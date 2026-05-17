/**
 * rate-limit.ts — In-memory rate limiter per IP + endpoint category
 * Works without Redis. For distributed, swap with Upstash or CF KV.
 */

type RateLimitEntry = {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockUntil: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

// Auto-clean every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime && now > entry.blockUntil) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

type RateLimitConfig = {
  limit: number;
  windowMs: number;
  blockDurationMs?: number; // How long to block after exceeding (default: windowMs)
};

const ENDPOINT_CONFIGS: Record<string, RateLimitConfig> = {
  search:   { limit: 20, windowMs: 60_000, blockDurationMs: 120_000 },
  trending: { limit: 30, windowMs: 60_000 },
  discover: { limit: 20, windowMs: 60_000 },
  popular:  { limit: 30, windowMs: 60_000 },
  details:  { limit: 60, windowMs: 60_000 },
  default:  { limit: 40, windowMs: 60_000 },
};

function getConfig(endpoint: string): RateLimitConfig {
  for (const [key, cfg] of Object.entries(ENDPOINT_CONFIGS)) {
    if (endpoint.startsWith('/' + key) || endpoint.includes(key)) return cfg;
  }
  return ENDPOINT_CONFIGS.default;
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetIn: number; // seconds
  blocked: boolean;
};

export function checkRateLimit(ip: string, endpoint: string): RateLimitResult {
  const config = getConfig(endpoint);
  const key = `${ip}:${endpoint.split('/').slice(0, 3).join('/')}`;
  const now = Date.now();

  let entry = rateLimitStore.get(key);

  // Handle active block
  if (entry?.blocked && now < entry.blockUntil) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.ceil((entry.blockUntil - now) / 1000),
      blocked: true,
    };
  }

  // Reset window
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
      blocked: false,
      blockUntil: 0,
    };
    rateLimitStore.set(key, entry);
    return { allowed: true, remaining: config.limit - 1, resetIn: Math.ceil(config.windowMs / 1000), blocked: false };
  }

  entry.count++;

  if (entry.count > config.limit) {
    entry.blocked = true;
    entry.blockUntil = now + (config.blockDurationMs ?? config.windowMs);
    return { allowed: false, remaining: 0, resetIn: Math.ceil((entry.blockUntil - now) / 1000), blocked: true };
  }

  return {
    allowed: true,
    remaining: config.limit - entry.count,
    resetIn: Math.ceil((entry.resetTime - now) / 1000),
    blocked: false,
  };
}

/** Detect likely bot/scraper based on request headers */
export function isSuspiciousRequest(req: Request): boolean {
  const ua = req.headers.get('user-agent') || '';
  if (ua.length < 10) return true; // Empty / minimal UA

  const botPatterns = [
    /curl/i, /wget/i, /python-requests/i, /scrapy/i,
    /Go-http-client/i, /node-fetch/i, /axios/i,
    /http_request/i, /libwww-perl/i, /java\/\d/i,
  ];
  return botPatterns.some(p => p.test(ua));
}
