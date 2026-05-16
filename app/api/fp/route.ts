import { NextRequest, NextResponse } from 'next/server';

/**
 * /api/fp — Client fingerprint receiver
 * Accepts fingerprint data from SecurityGuard component.
 * Logs suspicious clients silently.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ ok: true });

    const { fp, automation, firstInteraction } = body;

    // Flag highly suspicious clients
    if (automation > 2) {
      console.warn(`[Security] Suspicious client fingerprint: ${fp}, automation_flags=${automation}, first_interaction=${firstInteraction}ms`);
    }

    // Return minimal response — don't reveal detection
    return NextResponse.json({ ok: true }, {
      headers: {
        'Cache-Control': 'no-store',
      }
    });
  } catch {
    return NextResponse.json({ ok: true });
  }
}

// Also handle beacon (sendBeacon sends as text/plain)
export async function GET() {
  return NextResponse.json({ ok: true });
}
