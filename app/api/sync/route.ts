import { NextRequest, NextResponse } from 'next/server';
import { runHeavySync, runLightSync, getSyncStatus, setPaused, getSyncLogs } from '@/lib/catalog-sync-service';

const SYNC_SECRET = process.env.SYNC_SECRET || 'streamverse-sync-secret';

function isAuthorized(req: NextRequest): boolean {
  const secret = req.headers.get('x-sync-secret') || req.nextUrl.searchParams.get('secret');
  return secret === SYNC_SECRET;
}

// GET /api/sync → status + recent logs
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const [status, logs] = await Promise.all([getSyncStatus(), getSyncLogs(30)]);
    return NextResponse.json({ status, logs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/sync → trigger sync
// Body: { type: 'heavy' | 'light' | 'pause' | 'resume' }
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const type = body.type || 'light';

  try {
    if (type === 'pause') {
      await setPaused(true);
      return NextResponse.json({ success: true, message: 'Sincronização pausada.' });
    }

    if (type === 'resume') {
      await setPaused(false);
      return NextResponse.json({ success: true, message: 'Sincronização retomada.' });
    }

    // Check if already running
    const status = await getSyncStatus();
    if (status.isRunning) {
      return NextResponse.json({ error: 'Sync já está em execução.' }, { status: 409 });
    }
    if (status.isPaused && type === 'heavy') {
      return NextResponse.json({ error: 'Sincronização está pausada.' }, { status: 403 });
    }

    if (type === 'heavy') {
      // Run async - respond immediately so the cron doesn't time out
      runHeavySync().catch(console.error);
      return NextResponse.json({ success: true, message: 'Sync pesado iniciado em background.' });
    }

    // Light sync (fast enough to await)
    const result = await runLightSync();
    return NextResponse.json({ success: true, result });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
