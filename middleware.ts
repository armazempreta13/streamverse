/**
 * ╔════════════════════════════════════════════════════════════════╗
 * ║            StreamVerse Edge Middleware — middleware.ts          ║
 * ║  Runs on EVERY request before it reaches Next.js pages/routes  ║
 * ║  Edge Runtime compatible (Cloudflare Workers)                  ║
 * ╚════════════════════════════════════════════════════════════════╝
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  fullSecurityCheck,
  getSecurityHeaders,
  checkRateLimit,
  buildRequestFingerprint,
} from './lib/security';

// ─── Config ──────────────────────────────────────────────────────────────────

export const config = {
  matcher: [
    // Match all routes except static assets and _next internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot|css|js)$).*)',
  ],
};

// ─── Shadow throttle helper ───────────────────────────────────────────────────
// Adds artificial delay without revealing detection to the client

async function shadowThrottle(ms = 2000): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApiRoute = pathname.startsWith('/api/');
  const cookieHeader = req.headers.get('cookie');

  // ── Run full security check ──────────────────────────────────────────────
  const decision = fullSecurityCheck({
    req: req as any,
    cookieHeader,
    pathname,
    isApiRoute,
  });

  // ── Build base security headers ──────────────────────────────────────────
  const secHeaders = getSecurityHeaders();

  // ── Handle blocked requests ──────────────────────────────────────────────
  if (decision.action === 'block') {
    const isApi = isApiRoute;
    const body = isApi
      ? JSON.stringify({ error: 'Access denied.', code: 403 })
      : `<!DOCTYPE html><html><head><title>Access Denied</title></head><body style="background:#050510;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column"><h1>Access Denied</h1><p style="color:#8A93A6">Your request was blocked by our security system.</p><p style="color:#555;font-size:12px">Ray: ${req.headers.get('cf-ray') || 'N/A'}</p></body></html>`;

    return new NextResponse(body, {
      status: 403,
      headers: {
        'Content-Type': isApi ? 'application/json' : 'text/html',
        ...secHeaders,
        ...(decision.retryAfter ? { 'Retry-After': String(decision.retryAfter) } : {}),
        'X-Block-Reason': decision.reasons.join(','),
      },
    });
  }

  // ── Shadow mode: allow through but slow down ─────────────────────────────
  if (decision.action === 'shadow') {
    await shadowThrottle(1500 + Math.random() * 2000);
  }

  // ── Throttle mode: return 429 for API, slow for pages ────────────────────
  if (decision.action === 'throttle' && isApiRoute) {
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests. Please slow down.', retryAfter: 60 }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
          'X-RateLimit-Limit': '60',
          'X-RateLimit-Remaining': '0',
          ...secHeaders,
        },
      }
    );
  }

  // ── Allow: pass through with security headers ────────────────────────────
  const res = NextResponse.next();

  // Apply all security headers
  Object.entries(secHeaders).forEach(([k, v]) => res.headers.set(k, v));

  // Attach fingerprint header (internal use only, not exposed to client)
  const fp = buildRequestFingerprint(req as any);
  res.headers.set('X-Request-FP', fp);

  // Update rate limit cookies
  if (isApiRoute) {
    const rl = checkRateLimit(cookieHeader, '_sv_api_rl', { maxRequests: 60, windowMs: 60_000 });
    if (rl.cookieValue) {
      res.cookies.set('_sv_api_rl', rl.cookieValue, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 120,
        path: '/api',
      });
    }
  }

  // Threat level header (only for debugging, remove in prod if desired)
  if (decision.threatLevel > 0) {
    res.headers.set('X-Threat-Level', String(decision.threatLevel));
  }

  return res;
}
