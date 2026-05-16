// Cloudflare Cron Handler
// Called by Cloudflare Workers when a cron trigger fires.
//
// Schedule:
//   "0 3 * * *"    → Heavy sync daily at 03:00 UTC
//   "0 */6 * * *"  → Light sync every 6 hours
//
// This file is excluded from the Next.js compiler — it's a Cloudflare Workers entrypoint.

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function scheduled(event: any, env: any, ctx: any) {
  const cron = event.cron as string;
  const secret = (env.SYNC_SECRET as string) || 'streamverse-sync-2026';
  const isHeavy = cron === '0 3 * * *';
  const type = isHeavy ? 'heavy' : 'light';

  console.log('[CronSync] Trigger:', cron, '→ type:', type);

  try {
    const res = await fetch('https://streamverse.pages.dev/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sync-secret': secret,
      },
      body: JSON.stringify({ type }),
    });
    const data = await res.json();
    console.log('[CronSync] Response:', data);
  } catch (err) {
    console.error('[CronSync] Failed:', err);
  }
}
