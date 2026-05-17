/**
 * /api/fp — Lightweight server-side fingerprint collector
 * Receives client-side signals and stores a session fingerprint.
 * Used only for bot/abuse detection — never for tracking.
 *
 * POST /api/fp
 * Body: { tz, lang, screen, webgl, canvas, plugins }
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

function hashFP(data: Record<string, string>): string {
  const str = Object.values(data).join('|');
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';

  // Rate limit fingerprint endpoint (anti-spam)
  const rl = checkRateLimit(ip, '/fp');
  if (!rl.allowed) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  try {
    const body = await req.json();

    // Only use benign, non-identifying signals
    const signals: Record<string, string> = {
      tz:      String(body.tz     || '').substring(0, 50),
      lang:    String(body.lang   || '').substring(0, 20),
      screen:  String(body.screen || '').substring(0, 20),
      webgl:   String(body.webgl  || '').substring(0, 100),
      plugins: String(body.plugins || '').substring(0, 100),
      ua:      req.headers.get('user-agent')?.substring(0, 200) || '',
      accept:  req.headers.get('accept-language') || '',
    };

    const fp = hashFP(signals);

    // Return the fingerprint hash (session use only, not persisted)
    return NextResponse.json({ ok: true, fp }, {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json',
      },
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
