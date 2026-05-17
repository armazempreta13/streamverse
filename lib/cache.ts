/**
 * cache.ts — Server-side in-memory cache with TTL + SWR
 * -------------------------------------------------------
 * Works in Edge, Node.js and Cloudflare Workers.
 * For Cloudflare KV or Upstash Redis, swap the `get/set` implementation below.
 */

type CacheEntry<T> = {
  value: T;
  expiry: number;
  revalidating?: boolean;
};

const store = new Map<string, CacheEntry<any>>();

const MAX_ENTRIES = 2000;

function evictIfNeeded() {
  if (store.size < MAX_ENTRIES) return;
  // Delete oldest 20% entries
  const keys = Array.from(store.keys()).slice(0, Math.floor(MAX_ENTRIES * 0.2));
  keys.forEach(k => store.delete(k));
}

export const Cache = {
  get<T>(key: string): T | null {
    const entry = store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) return null; // Expired
    return entry.value as T;
  },

  set<T>(key: string, value: T, ttlSeconds: number): void {
    evictIfNeeded();
    store.set(key, { value, expiry: Date.now() + ttlSeconds * 1000 });
  },

  /** Returns stale value even if expired, but schedules a background revalidation */
  getStale<T>(key: string): { value: T | null; stale: boolean } {
    const entry = store.get(key);
    if (!entry) return { value: null, stale: false };
    const stale = Date.now() > entry.expiry;
    return { value: entry.value as T, stale };
  },

  setRevalidating(key: string, val: boolean) {
    const entry = store.get(key);
    if (entry) entry.revalidating = val;
  },

  isRevalidating(key: string): boolean {
    return store.get(key)?.revalidating === true;
  },

  delete(key: string): void {
    store.delete(key);
  },

  clear(): void {
    store.clear();
  },

  size(): number {
    return store.size;
  }
};

/**
 * Wraps an async function with cache + stale-while-revalidate.
 * @param key      Cache key
 * @param ttl      TTL in seconds (fresh window)
 * @param staleTtl Extra seconds to serve stale while revalidating (default: ttl * 2)
 * @param fetcher  The async function to call on cache miss
 */
export async function withCache<T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T>,
  staleTtl?: number
): Promise<T | null> {
  const { value, stale } = Cache.getStale<T>(key);

  if (value !== null && !stale) {
    return value; // Fresh cache hit
  }

  if (value !== null && stale) {
    // SWR: Return stale immediately, revalidate in background
    if (!Cache.isRevalidating(key)) {
      Cache.setRevalidating(key, true);
      fetcher()
        .then(fresh => {
          if (fresh !== null) {
            Cache.set(key, fresh, staleTtl ?? ttl * 2);
          }
        })
        .catch(() => {})
        .finally(() => Cache.setRevalidating(key, false));
    }
    return value; // Return stale
  }

  // Cache miss: Fetch fresh
  try {
    const fresh = await fetcher();
    if (fresh !== null && fresh !== undefined) {
      Cache.set(key, fresh, ttl);
    }
    return fresh;
  } catch {
    return null;
  }
}
