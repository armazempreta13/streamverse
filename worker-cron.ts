/**
 * Cloudflare Cron Handler
 * Cloudflare Workers calls this when a cron trigger fires.
 * 
 * Schedule:
 *   "0 3 * * *"    → Heavy sync daily at 03:00 UTC
 *   "0 */6 * * *"  → Light sync every 6 hours
 */

export async function scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
  const cron = event.cron;
  const secret = env.SYNC_SECRET || 'streamverse-sync-2026';

  // Determine sync type from the cron schedule
  const isHeavy = cron === '0 3 * * *';
  const type = isHeavy ? 'heavy' : 'light';

  console.log(`[CronSync] Trigger fired: ${cron} → type=${type}`);

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
    console.log(`[CronSync] Response:`, data);
  } catch (err) {
    console.error(`[CronSync] Failed:`, err);
  }
}
