/**
 * CatalogSyncService
 * ==================
 * Fetches trending/popular/anime data from TMDB and persists to Firestore.
 * Designed to run inside a Next.js API Route (Edge-compatible).
 *
 * Heavy sync  → once per day (called by cron or manual admin)
 * Light sync  → every 6 hours (trending/popular only)
 */

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';

// ─── Types ─────────────────────────────────────────────────────────────────

export type CatalogItem = {
  id?: string;
  tmdbId: number;
  imdbId?: string;
  type: 'movie' | 'series' | 'anime';
  title: string;
  originalTitle: string;
  slug: string;
  overview: string;
  posterPath: string;
  backdropPath: string;
  genres: string[];
  popularity: number;
  voteAverage: number;
  voteCount: number;
  releaseDate?: string;
  firstAirDate?: string;
  isTrending: boolean;
  isPopular: boolean;
  isTopRated: boolean;
  isAnime: boolean;
  rankingScore: number;
  lastSyncedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type SyncLog = {
  type: 'info' | 'success' | 'warning' | 'error';
  action: string;
  message: string;
  createdAt: string;
};

export type SyncStatus = {
  lastHeavySync?: string;
  lastLightSync?: string;
  isRunning: boolean;
  isPaused: boolean;
  totalItems: number;
  lastError?: string;
};

// ─── TMDB Genre IDs ────────────────────────────────────────────────────────

const GENRE_MAP: Record<number, string> = {
  28: 'Ação', 12: 'Aventura', 16: 'Animação', 35: 'Comédia', 80: 'Crime',
  99: 'Documentário', 18: 'Drama', 10751: 'Família', 14: 'Fantasia',
  36: 'História', 27: 'Terror', 10402: 'Música', 9648: 'Mistério',
  10749: 'Romance', 878: 'Ficção Científica', 10770: 'TV Movie',
  53: 'Suspense', 10752: 'Guerra', 37: 'Faroeste',
};

// ─── Helpers ───────────────────────────────────────────────────────────────

function getAdminDb() {
  const serviceAccountStr = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT;
  if (!serviceAccountStr) throw new Error('FIREBASE_ADMIN_SERVICE_ACCOUNT not set');
  
  let adminApp: App;
  if (!getApps().find((a: any) => a.name === 'admin-sync')) {
    const serviceAccount = JSON.parse(serviceAccountStr);
    adminApp = initializeApp({ credential: cert(serviceAccount) }, 'admin-sync');
  } else {
    adminApp = getApps().find((a: any) => a.name === 'admin-sync')!;
  }
  return getFirestore(adminApp);
}

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || 'e977149fcbba55f76536674e77f0a186';
const TMDB_BASE = 'https://api.themoviedb.org/3';

async function tmdbFetch(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.set('api_key', TMDB_API_KEY);
  url.searchParams.set('language', 'pt-BR');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) return null;
  return res.json();
}

function detectAnime(item: any): boolean {
  const genres: number[] = item.genre_ids || item.genres?.map((g: any) => g.id) || [];
  const isAnimation = genres.includes(16);
  const isJapanese = item.original_language === 'ja';
  const isTV = item.media_type === 'tv' || item.first_air_date != null;
  const fromJapan = (item.origin_country || []).includes('JP');
  return isAnimation && (isJapanese || fromJapan) && isTV;
}

function computeScore(item: any, isTrending: boolean): number {
  const pop = Math.min(item.popularity || 0, 1000) / 10;
  const vote = (item.vote_average || 0) * 10;
  const votes = Math.min(item.vote_count || 0, 5000) / 500;
  const dateStr = item.release_date || item.first_air_date || '';
  const recency = dateStr
    ? Math.max(0, 10 - (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24 * 365))
    : 0;
  const trendBonus = isTrending ? 20 : 0;
  return Math.round(pop + vote + votes + recency + trendBonus);
}

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function buildCatalogItem(
  raw: any,
  overrides: Partial<CatalogItem> = {}
): CatalogItem {
  const isAnime = detectAnime(raw);
  const type: 'movie' | 'series' | 'anime' =
    isAnime ? 'anime' : (raw.media_type === 'movie' || raw.release_date) ? 'movie' : 'series';
  const title = raw.title || raw.name || '';
  const genres = (raw.genre_ids || raw.genres?.map((g: any) => g.id) || [])
    .map((id: number) => GENRE_MAP[id]).filter(Boolean);

  return {
    tmdbId: raw.id,
    type,
    title,
    originalTitle: raw.original_title || raw.original_name || title,
    slug: slugify(title),
    overview: raw.overview || '',
    posterPath: raw.poster_path || '',
    backdropPath: raw.backdrop_path || '',
    genres,
    popularity: raw.popularity || 0,
    voteAverage: raw.vote_average || 0,
    voteCount: raw.vote_count || 0,
    releaseDate: raw.release_date,
    firstAirDate: raw.first_air_date,
    isTrending: false,
    isPopular: false,
    isTopRated: false,
    isAnime,
    rankingScore: computeScore(raw, false),
    ...overrides,
  };
}

// ─── Logger ────────────────────────────────────────────────────────────────

async function writeLog(db: any, log: Omit<SyncLog, 'createdAt'>) {
  try {
    await db.collection('sync_logs').add({ ...log, createdAt: new Date().toISOString() });
  } catch {}
}

// ─── Upsert helper ─────────────────────────────────────────────────────────

async function upsertItem(
  db: any,
  item: CatalogItem
): Promise<'created' | 'updated' | 'skipped'> {
  const col = db.collection('tmdb_catalog');
  const existing = await col.where('tmdbId', '==', item.tmdbId).limit(1).get();

  const now = new Date().toISOString();
  if (existing.empty) {
    await col.add({ ...item, createdAt: now, updatedAt: now, lastSyncedAt: now });
    return 'created';
  }

  const doc = existing.docs[0];
  const prev = doc.data();
  // Only update if something meaningful changed
  const changed =
    prev.rankingScore !== item.rankingScore ||
    prev.isTrending !== item.isTrending ||
    prev.isPopular !== item.isPopular ||
    prev.voteAverage !== item.voteAverage ||
    prev.popularity !== item.popularity;

  if (!changed) return 'skipped';
  await doc.ref.update({ ...item, updatedAt: now, lastSyncedAt: now });
  return 'updated';
}

// ─── Heavy Sync ────────────────────────────────────────────────────────────

export async function runHeavySync(): Promise<{ created: number; updated: number; skipped: number; errors: string[] }> {
  const db = getAdminDb();
  const stats = { created: 0, updated: 0, skipped: 0, errors: [] as string[] };
  const now = new Date().toISOString();

  await writeLog(db, { type: 'info', action: 'heavy_sync', message: 'Iniciando sync completo...' });

  // Mark as running
  await db.collection('system').doc('catalog_sync').set(
    { isRunning: true, lastHeavySyncStart: now }, { merge: true }
  );

  try {
    const batches: Array<Promise<any[]>> = [];

    // 1. Trending All
    batches.push(tmdbFetch('/trending/all/week').then(d => (d?.results || []).map((r: any) => buildCatalogItem(r, { isTrending: true, rankingScore: computeScore(r, true) }))));
    // 2. Popular Movies
    batches.push(tmdbFetch('/movie/popular').then(d => (d?.results || []).map((r: any) => buildCatalogItem(r, { isPopular: true, type: 'movie' }))));
    // 3. Popular TV
    batches.push(tmdbFetch('/tv/popular').then(d => (d?.results || []).map((r: any) => buildCatalogItem(r, { isPopular: true }))));
    // 4. Top Rated Movies
    batches.push(tmdbFetch('/movie/top_rated').then(d => (d?.results || []).map((r: any) => buildCatalogItem(r, { isTopRated: true, type: 'movie' }))));
    // 5. Top Rated TV
    batches.push(tmdbFetch('/tv/top_rated').then(d => (d?.results || []).map((r: any) => buildCatalogItem(r, { isTopRated: true }))));
    // 6. Now Playing Movies
    batches.push(tmdbFetch('/movie/now_playing').then(d => (d?.results || []).map((r: any) => buildCatalogItem(r, { type: 'movie' }))));
    // 7. Upcoming Movies
    batches.push(tmdbFetch('/movie/upcoming').then(d => (d?.results || []).map((r: any) => buildCatalogItem(r, { type: 'movie' }))));
    // 8. On The Air TV
    batches.push(tmdbFetch('/tv/on_the_air').then(d => (d?.results || []).map((r: any) => buildCatalogItem(r))));
    // 9. Animes
    batches.push(tmdbFetch('/discover/tv', { with_genres: '16', with_original_language: 'ja', sort_by: 'popularity.desc' }).then(d => (d?.results || []).map((r: any) => buildCatalogItem(r, { isAnime: true, type: 'anime' }))));
    // 10. Anime Trending
    batches.push(tmdbFetch('/discover/tv', { with_genres: '16', with_original_language: 'ja', sort_by: 'first_air_date.desc' }).then(d => (d?.results || []).map((r: any) => buildCatalogItem(r, { isAnime: true, type: 'anime', isTrending: true }))));

    const results = await Promise.all(batches);
    const allItems = results.flat();

    // Deduplicate by tmdbId
    const seen = new Set<number>();
    const unique = allItems.filter(item => {
      if (seen.has(item.tmdbId)) return false;
      seen.add(item.tmdbId);
      return true;
    });

    // Upsert in batches of 10 (Firestore parallel)
    for (let i = 0; i < unique.length; i += 10) {
      const chunk = unique.slice(i, i + 10);
      const results = await Promise.all(chunk.map(item => upsertItem(db, item).catch(e => { stats.errors.push(e.message); return 'skipped' as const; })));
      results.forEach(r => { if (r !== 'skipped' || true) stats[r]++; });
    }

    await writeLog(db, {
      type: 'success',
      action: 'heavy_sync',
      message: `Sync completo. Criados: ${stats.created}, Atualizados: ${stats.updated}, Sem alteração: ${stats.skipped}`
    });

    await db.collection('system').doc('catalog_sync').set({
      isRunning: false,
      lastHeavySync: now,
      lastHeavySyncStats: stats,
    }, { merge: true });

  } catch (err: any) {
    stats.errors.push(err.message);
    await writeLog(db, { type: 'error', action: 'heavy_sync', message: err.message });
    await db.collection('system').doc('catalog_sync').set({ isRunning: false, lastError: err.message }, { merge: true });
  }

  return stats;
}

// ─── Light Sync ────────────────────────────────────────────────────────────

export async function runLightSync(): Promise<{ updated: number; errors: string[] }> {
  const db = getAdminDb();
  const stats = { updated: 0, errors: [] as string[] };
  const now = new Date().toISOString();

  await writeLog(db, { type: 'info', action: 'light_sync', message: 'Iniciando sync leve (trending)...' });

  try {
    const [trending, animes] = await Promise.all([
      tmdbFetch('/trending/all/day').then(d => d?.results || []),
      tmdbFetch('/discover/tv', { with_genres: '16', with_original_language: 'ja', sort_by: 'popularity.desc' }).then(d => d?.results || []),
    ]);

    const allItems = [
      ...trending.map((r: any) => buildCatalogItem(r, { isTrending: true, rankingScore: computeScore(r, true) })),
      ...animes.map((r: any) => buildCatalogItem(r, { isAnime: true, type: 'anime', isTrending: true })),
    ];

    const seen = new Set<number>();
    const unique = allItems.filter(item => { if (seen.has(item.tmdbId)) return false; seen.add(item.tmdbId); return true; });

    for (const item of unique) {
      const r = await upsertItem(db, item).catch(e => { stats.errors.push(e.message); return 'skipped' as const; });
      if (r === 'updated' || r === 'created') stats.updated++;
    }

    await writeLog(db, { type: 'success', action: 'light_sync', message: `Sync leve concluído. ${stats.updated} itens atualizados.` });
    await db.collection('system').doc('catalog_sync').set({ lastLightSync: now }, { merge: true });

  } catch (err: any) {
    stats.errors.push(err.message);
    await writeLog(db, { type: 'error', action: 'light_sync', message: err.message });
  }

  return stats;
}

// ─── Get Status ────────────────────────────────────────────────────────────

export async function getSyncStatus(): Promise<SyncStatus & { totalItems: number }> {
  const db = getAdminDb();
  const [statusDoc, countSnap] = await Promise.all([
    db.collection('system').doc('catalog_sync').get(),
    db.collection('tmdb_catalog').count().get(),
  ]);

  const data = statusDoc.data() || {};
  return {
    lastHeavySync: data.lastHeavySync,
    lastLightSync: data.lastLightSync,
    isRunning: data.isRunning || false,
    isPaused: data.isPaused || false,
    lastError: data.lastError,
    totalItems: countSnap.data().count,
  };
}

// ─── Get Logs ──────────────────────────────────────────────────────────────

export async function getSyncLogs(limit = 50): Promise<SyncLog[]> {
  const db = getAdminDb();
  const snap = await db.collection('sync_logs').orderBy('createdAt', 'desc').limit(limit).get();
  return snap.docs.map((d: any) => d.data() as SyncLog);
}

// ─── Pause / Resume ────────────────────────────────────────────────────────

export async function setPaused(paused: boolean) {
  const db = getAdminDb();
  await db.collection('system').doc('catalog_sync').set({ isPaused: paused }, { merge: true });
}

// ─── Get Catalog Items ─────────────────────────────────────────────────────

export async function getCatalogItems(filters: {
  type?: string;
  isTrending?: boolean;
  isAnime?: boolean;
  isPopular?: boolean;
  limit?: number;
} = {}): Promise<CatalogItem[]> {
  const db = getAdminDb();
  let q: any = db.collection('tmdb_catalog');

  if (filters.type) q = q.where('type', '==', filters.type);
  if (filters.isTrending) q = q.where('isTrending', '==', true);
  if (filters.isAnime) q = q.where('isAnime', '==', true);
  if (filters.isPopular) q = q.where('isPopular', '==', true);

  q = q.orderBy('rankingScore', 'desc').limit(filters.limit || 20);
  const snap = await q.get();
  return snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as CatalogItem));
}
