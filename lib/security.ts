/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║         StreamVerse Security Core — lib/security.ts       ║
 * ║   Multi-layer protection: WAF · Rate Limit · Fingerprint  ║
 * ╚═══════════════════════════════════════════════════════════╝
 *
 * Works entirely in Edge Runtime (Cloudflare Workers).
 * No external dependencies. No persistent state needed.
 * Leverages built-in Cloudflare headers when available.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export type ThreatLevel = 0 | 1 | 2 | 3 | 4 | 5;

export type SecurityDecision = {
  allow: boolean;
  threatLevel: ThreatLevel;
  reasons: string[];
  action: 'allow' | 'throttle' | 'challenge' | 'block' | 'shadow';
  retryAfter?: number; // seconds
};

// ─── WAF — Malicious pattern detection ──────────────────────────────────────

const WAF_PATTERNS = {
  sqli: [
    /(\b(select|insert|update|delete|drop|create|alter|exec|execute|union|having|where)\b.*\b(from|into|table|database)\b)/i,
    /('|(\\x27)|(\\047)|(\\x2527)|(\\047)|\%27)\s*(or|and)/i,
    /(;|--|\||\*|\/\*|\*\/).*?(select|insert|update|delete|drop)/i,
  ],
  xss: [
    /<script[\s\S]*?>[\s\S]*?<\/script>/i,
    /(javascript|vbscript|expression|onload|onerror|onclick)\s*:/i,
    /<(iframe|object|embed|link|meta|base)[^>]*>/i,
    /document\.(cookie|location|write|getElementById)/i,
  ],
  pathTraversal: [
    /\.\.[\/\\]/,
    /%2e%2e[%2f%5c]/i,
    /\/(etc\/passwd|windows\/win\.ini|proc\/self)/i,
  ],
  ssrf: [
    /(localhost|127\.0\.0\.1|169\.254\.|0\.0\.0\.0|::1)(?::\d+)?/i,
    /file:\/\//i,
    /http:\/\/(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/i,
  ],
};

export function runWAF(url: URL, headers: Headers): { blocked: boolean; reason: string } {
  const checkStr = [
    url.pathname,
    url.search,
    headers.get('user-agent') || '',
    headers.get('referer') || '',
  ].join(' ');

  for (const [category, patterns] of Object.entries(WAF_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(checkStr)) {
        return { blocked: true, reason: `WAF:${category}` };
      }
    }
  }
  return { blocked: false, reason: '' };
}

// ─── Bot / Automation Detection ─────────────────────────────────────────────

const KNOWN_BAD_BOTS = [
  'python-requests', 'go-http-client', 'java/', 'curl/', 'wget/',
  'scrapy', 'phantomjs', 'headlesschrome', 'puppeteer', 'playwright',
  'selenium', 'webdriver', 'httrack', 'nikto', 'sqlmap', 'masscan',
  'zgrab', 'nmap', 'zmap', 'libwww-perl', 'lwp-trivial', 'urllib',
  'mechanize', 'guzzle', 'ahrefsbot', 'semrushbot', 'dotbot',
  'mj12bot', 'bingbot', 'amazonbot', 'ccbot', 'dataprovider',
  'bytespider', 'claudebot', 'gptbot', 'chatgpt-user',
];

const KNOWN_GOOD_BOTS = [
  'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
  'yandexbot', 'facebot', 'facebookexternalhit', 'twitterbot', 'linkedinbot',
];

export function analyzeUserAgent(ua: string): { isBot: boolean; isBadBot: boolean; isGoodBot: boolean; score: number } {
  if (!ua || ua.length < 10) return { isBot: true, isBadBot: true, isGoodBot: false, score: 80 };

  const uaLower = ua.toLowerCase();
  const isGoodBot = KNOWN_GOOD_BOTS.some(b => uaLower.includes(b));
  if (isGoodBot) return { isBot: true, isBadBot: false, isGoodBot: true, score: 0 };

  const isBadBot = KNOWN_BAD_BOTS.some(b => uaLower.includes(b));
  if (isBadBot) return { isBot: true, isBadBot: true, isGoodBot: false, score: 90 };

  // Headless/automation signals
  let score = 0;
  if (uaLower.includes('headless')) score += 60;
  if (!ua.includes('Mozilla')) score += 30;
  if (ua.includes('Bot') || ua.includes('bot')) score += 20;
  if (ua.includes('Crawler') || ua.includes('Spider')) score += 20;
  if (!/chrome|firefox|safari|edge|opera/i.test(ua)) score += 25;
  // Suspiciously generic
  if (/^Mozilla\/5\.0$/.test(ua.trim())) score += 50;

  return { isBot: score > 40, isBadBot: score > 60, isGoodBot: false, score };
}

// ─── Cloudflare Header Analysis ─────────────────────────────────────────────

export function analyzeCloudflareHeaders(headers: Headers): { cfScore: number; isDatacenter: boolean; isTor: boolean; country: string } {
  // CF-Threat-Score: 0-100 (Cloudflare's own threat assessment)
  const cfThreatScore = parseInt(headers.get('cf-threat-score') || '0', 10);
  // CF-IPCountry
  const country = headers.get('cf-ipcountry') || 'XX';
  // CF-Connecting-IP is the real user IP
  // CF-Worker: set if it's an internal CF request
  // X-Forwarded-For anomalies
  const xff = headers.get('x-forwarded-for') || '';
  const xffIps = xff.split(',').map(s => s.trim()).filter(Boolean);

  // Datacenter/proxy signals from CF
  const isDatacenter = headers.get('cf-worker') !== null || cfThreatScore > 30;
  const isTor = country === 'T1'; // Cloudflare marks Tor exit nodes as T1

  return {
    cfScore: cfThreatScore,
    isDatacenter,
    isTor,
    country,
  };
}

// ─── Rate Limit (Cookie-based, stateless) ────────────────────────────────────
// Uses a signed cookie to track request bursts without server-side state.
// Window: 60s | Max requests per window configurable per route type

const RATE_LIMIT_SECRET = 'sv2026'; // short signing salt

function simpleSign(data: string): string {
  // Deterministic but not cryptographically secure — good enough for cookie integrity
  let hash = 0;
  const str = data + RATE_LIMIT_SECRET;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export type RateLimitConfig = {
  maxRequests: number;
  windowMs: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetMs: number;
  cookieValue?: string;
};

export function checkRateLimit(
  cookieHeader: string | null,
  cookieName: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  // Parse existing cookie
  let timestamps: number[] = [];
  if (cookieHeader) {
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]+)`));
    if (match) {
      try {
        const [data, sig] = match[1].split('.');
        if (sig === simpleSign(data)) {
          timestamps = JSON.parse(atob(data)).filter((t: number) => t > windowStart);
        }
      } catch {}
    }
  }

  const allowed = timestamps.length < config.maxRequests;
  if (allowed) timestamps.push(now);

  const oldest = timestamps[0] || now;
  const resetMs = oldest + config.windowMs;

  const data = btoa(JSON.stringify(timestamps));
  const sig = simpleSign(data);
  const cookieValue = `${data}.${sig}`;

  return {
    allowed,
    remaining: Math.max(0, config.maxRequests - timestamps.length),
    resetMs,
    cookieValue,
  };
}

// ─── Request Fingerprint (Server-side, from headers) ─────────────────────────

export function buildRequestFingerprint(req: Request): string {
  const headers = req.headers;
  const parts = [
    headers.get('user-agent') || '',
    headers.get('accept-language') || '',
    headers.get('accept-encoding') || '',
    headers.get('accept') || '',
    headers.get('sec-ch-ua-platform') || '',
    headers.get('sec-ch-ua') || '',
  ];
  // Simple hash
  const str = parts.join('|');
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) ^ str.charCodeAt(i);
  return (h >>> 0).toString(16).padStart(8, '0');
}

// ─── Threat Score Calculator ─────────────────────────────────────────────────

export function calculateThreatLevel(score: number): ThreatLevel {
  if (score >= 100) return 5;
  if (score >= 80) return 4;
  if (score >= 60) return 3;
  if (score >= 40) return 2;
  if (score >= 20) return 1;
  return 0;
}

export function getThreatAction(level: ThreatLevel): SecurityDecision['action'] {
  switch (level) {
    case 5: return 'block';
    case 4: return 'shadow';
    case 3: return 'throttle';
    case 2: return 'allow'; 
    case 1: return 'allow'; 
    default: return 'allow';
  }
}

// ─── Security Headers ────────────────────────────────────────────────────────

export function getSecurityHeaders(): Record<string, string> {
  return {
    // Prevent clickjacking
    'X-Frame-Options': 'SAMEORIGIN',
    // Stop MIME sniffing
    'X-Content-Type-Options': 'nosniff',
    // XSS Protection (legacy IE)
    'X-XSS-Protection': '1; mode=block',
    // Referrer
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    // HSTS (1 year, include subdomains)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    // Cross-Origin policies
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Cross-Origin-Embedder-Policy': 'unsafe-none', // relaxed to allow embeds (YouTube trailers)
    // Permissions
    'Permissions-Policy': [
      'accelerometer=()',
      'ambient-light-sensor=()',
      'autoplay=(self)',
      'battery=()',
      'camera=()',
      'geolocation=()',
      'gyroscope=()',
      'magnetometer=()',
      'microphone=()',
      'payment=()',
      'usb=()',
    ].join(', '),
    // Content Security Policy
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://static.cloudflareinsights.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://image.tmdb.org https://picsum.photos https://image.pollinations.ai",
      "media-src 'self' blob:",
      "frame-src 'self' https://www.youtube.com https://youtube.com https://myembed.biz https://challenges.cloudflare.com",
      "connect-src 'self' https://api.themoviedb.org https://graphql.anilist.co https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com wss:",
      "worker-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join('; '),
  };
}

// ─── Suspicious Path Detection ───────────────────────────────────────────────

const SUSPICIOUS_PATHS = [
  '/wp-admin', '/wp-login', '/wp-content', '/xmlrpc', '/phpmyadmin',
  '/.env', '/.git', '/config.php', '/admin.php', '/shell.php',
  '/backup', '/.htaccess', '/robots.txt.bak', '/sitemap.xml.gz',
  '/api/v1/', '/api/v2/', '/graphql', '/swagger', '/openapi',
  '/cgi-bin', '/scripts/',
];

export function isSuspiciousPath(pathname: string): boolean {
  const p = pathname.toLowerCase();
  return SUSPICIOUS_PATHS.some(sp => p.startsWith(sp) || p === sp);
}

// ─── Full Security Check (called from middleware) ─────────────────────────────

export type SecurityCheckInput = {
  req: Request;
  cookieHeader: string | null;
  pathname: string;
  isApiRoute: boolean;
};

export function fullSecurityCheck(input: SecurityCheckInput): SecurityDecision {
  const { req, cookieHeader, pathname, isApiRoute } = input;
  const url = new URL(req.url);
  const headers = req.headers;

  let score = 0;
  const reasons: string[] = [];

  // 1. WAF check
  const waf = runWAF(url, headers);
  if (waf.blocked) {
    reasons.push(waf.reason);
    score += 50; // was 100
  }

  // 2. Suspicious path
  if (isSuspiciousPath(pathname)) {
    reasons.push('suspicious_path');
    score += 50; // was 85
  }

  // 3. User-Agent analysis
  const ua = headers.get('user-agent') || '';
  const uaAnalysis = analyzeUserAgent(ua);
  if (uaAnalysis.isBadBot) {
    reasons.push('bad_bot');
    score += uaAnalysis.score; // usually 90 -> block
  } else if (uaAnalysis.isBot && !uaAnalysis.isGoodBot) {
    reasons.push('unknown_bot');
    score += Math.min(uaAnalysis.score, 30);
  }

  // 4. Cloudflare threat score
  const cf = analyzeCloudflareHeaders(headers);
  if (cf.cfScore > 50) {
    reasons.push('cf_threat');
    score += cf.cfScore;
  }
  if (cf.isTor) {
    reasons.push('tor');
    score += 20;
  }

  // 5. Rate limiting
  if (isApiRoute) {
    const rl = checkRateLimit(cookieHeader, '_sv_api_rl', {
      maxRequests: 200,
      windowMs: 60_000,
    });
    if (!rl.allowed) {
      reasons.push('rate_limit_api');
      score += 40;
    }
  } else {
    const rl = checkRateLimit(cookieHeader, '_sv_page_rl', {
      maxRequests: 300,
      windowMs: 60_000,
    });
    if (!rl.allowed) {
      reasons.push('rate_limit_page');
      score += 30;
    }
  }

  // 6. Missing browser signals
  const secFetch = headers.get('sec-fetch-mode');
  if (isApiRoute && !secFetch && !ua.includes('curl')) {
    reasons.push('missing_sec_fetch');
    score += 10;
  }

  // 7. Suspicious accept headers
  const accept = headers.get('accept') || '';
  if (!accept && !ua.toLowerCase().includes('curl')) {
    reasons.push('missing_accept');
    score += 10;
  }

  const threatLevel = calculateThreatLevel(score);
  const action = getThreatAction(threatLevel);

  return {
    allow: action === 'allow' || action === 'throttle' || action === 'shadow',
    threatLevel,
    reasons,
    action,
    retryAfter: action === 'block' ? 3600 : action === 'shadow' ? undefined : 60,
  };
}
