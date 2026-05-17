/**
 * /api/catalog — Semantic, secure, cached catalog endpoint.
 *
 * Supported endpoints:
 *   GET /api/catalog?type=trending&category=movie|tv|anime|all
 *   GET /api/catalog?type=popular&category=movie|tv|anime
 *   GET /api/catalog?type=top_rated&category=movie|tv
 *   GET /api/catalog?type=recent&category=movie|tv|anime
 *   GET /api/catalog?type=upcoming
 *   GET /api/catalog?type=discover&category=movie|tv&genre=<id>
 *   GET /api/catalog?type=search&q=<query>&category=movie|tv|anime
 *   GET /api/catalog?type=details&id=<id>&category=movie|tv
 *   GET /api/catalog?type=credits&id=<id>&category=movie|tv
 *   GET /api/catalog?type=videos&id=<id>&category=movie|tv
 *   GET /api/catalog?type=images&id=<id>&category=movie|tv
 *   GET /api/catalog?type=similar&id=<id>&category=movie|tv
 *   GET /api/catalog?type=seasons&id=<id>
 *   GET /api/catalog?type=season_episodes&id=<id>&season=<n>
 *   GET /api/catalog?type=genres&category=movie|tv
 */

import { NextRequest, NextResponse } from 'next/server';
import { withCache } from '@/lib/cache';
import { checkRateLimit, isSuspiciousRequest } from '@/lib/rate-limit';
import {
  mapList, mapDetails, mapCast, mapVideos, mapImages, mapEpisodes, mapItem,
  SafeListResponse, SafeDetails, SafeCastMember, SafeVideo, SafeImage, SafeEpisode, SafeSeason,
} from '@/lib/tmdb-mapper';

// ─── TMDb Fetcher (server-only, key never leaves here) ─────────────────────

const TMDB_KEY = process.env.TMDB_API_KEY || process.env.TMDB_ACCESS_TOKEN || 'e977149fcbba55f76536674e77f0a186';
const TMDB_BASE = 'https://api.themoviedb.org/3';

async function tmdb(path: string, params: Record<string, string> = {}): Promise<any> {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set('api_key', TMDB_KEY);
  url.searchParams.set('language', 'pt-BR');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), { next: { revalidate: 0 } }); // Cache handled by our layer
  if (!res.ok) return null;
  return res.json();
}

// ─── TTLs (seconds) ─────────────────────────────────────────────────────────

const TTL = {
  trending:  15 * 60,      // 15 min
  popular:   6 * 60 * 60,  // 6h
  topRated:  6 * 60 * 60,  // 6h
  recent:    2 * 60 * 60,  // 2h
  details:   24 * 60 * 60, // 24h
  search:    60 * 60,      // 1h
  genres:    7 * 24 * 60 * 60, // 7d
  seasons:   24 * 60 * 60, // 24h
  episodes:  24 * 60 * 60, // 24h
  credits:   24 * 60 * 60, // 24h
  videos:    24 * 60 * 60, // 24h
  images:    24 * 60 * 60, // 24h
  similar:   6 * 60 * 60,  // 6h
};

function getTmdbType(cat: string): 'tv' | 'movie' {
  return cat === 'series' || cat === 'anime' || cat === 'tv' ? 'tv' : 'movie';
}

// ─── Handlers ────────────────────────────────────────────────────────────────

async function handleTrending(cat: string, page: string): Promise<SafeListResponse | null> {
  const tmdbCat = cat === 'anime' ? 'tv' : cat === 'series' ? 'tv' : cat;
  const key = `trending:${cat}:${page}`;
  return withCache(key, TTL.trending, async () => {
    if (cat === 'anime') {
      const data = await tmdb('/discover/tv', {
        with_genres: '16',
        with_original_language: 'ja',
        sort_by: 'popularity.desc',
        page,
      });
      return mapList(data);
    }
    const data = await tmdb(`/trending/${tmdbCat === 'all' ? 'all' : tmdbCat}/week`, { page });
    return mapList(data);
  });
}

async function handlePopular(cat: string, page: string): Promise<SafeListResponse | null> {
  const key = `popular:${cat}:${page}`;
  return withCache(key, TTL.popular, async () => {
    if (cat === 'anime') {
      const data = await tmdb('/discover/tv', {
        with_genres: '16',
        with_original_language: 'ja',
        sort_by: 'popularity.desc',
        page,
      });
      return mapList(data);
    }
    const type = cat === 'series' ? 'tv' : cat;
    const data = await tmdb(`/${type}/popular`, { page });
    return mapList(data);
  });
}

async function handleTopRated(cat: string, page: string): Promise<SafeListResponse | null> {
  const key = `top_rated:${cat}:${page}`;
  return withCache(key, TTL.topRated, async () => {
    if (cat === 'anime') {
      const data = await tmdb('/discover/tv', {
        with_genres: '16',
        with_original_language: 'ja',
        sort_by: 'vote_average.desc',
        'vote_count.gte': '200',
        page,
      });
      return mapList(data);
    }
    const type = cat === 'series' ? 'tv' : cat;
    const data = await tmdb(`/${type}/top_rated`, { page });
    return mapList(data);
  });
}

async function handleRecent(cat: string, page: string): Promise<SafeListResponse | null> {
  const key = `recent:${cat}:${page}`;
  return withCache(key, TTL.recent, async () => {
    if (cat === 'anime') {
      const data = await tmdb('/discover/tv', {
        with_genres: '16',
        with_original_language: 'ja',
        sort_by: 'first_air_date.desc',
        'first_air_date.lte': new Date().toISOString().split('T')[0],
        page,
      });
      return mapList(data);
    }
    const type = cat === 'series' ? 'tv' : cat;
    const endpoint = type === 'movie' ? '/movie/now_playing' : '/tv/on_the_air';
    const data = await tmdb(endpoint, { page });
    return mapList(data);
  });
}

async function handleUpcoming(page: string): Promise<SafeListResponse | null> {
  const key = `upcoming:${page}`;
  return withCache(key, TTL.recent, async () => {
    const data = await tmdb('/movie/upcoming', { page });
    return mapList(data);
  });
}

async function handleDiscover(cat: string, genre: string, page: string): Promise<SafeListResponse | null> {
  const key = `discover:${cat}:${genre}:${page}`;
  return withCache(key, TTL.popular, async () => {
    const type = cat === 'series' ? 'tv' : cat === 'anime' ? 'tv' : cat;
    const params: Record<string, string> = { sort_by: 'popularity.desc', page };
    if (genre) params.with_genres = cat === 'anime' ? `16,${genre}` : genre;
    if (cat === 'anime') {
      params.with_original_language = 'ja';
    }
    const data = await tmdb(`/discover/${type}`, params);
    return mapList(data);
  });
}

async function handleSearch(q: string, cat: string, page: string): Promise<SafeListResponse | null> {
  const key = `search:${q}:${cat}:${page}`;
  return withCache(key, TTL.search, async () => {
    const endpoint = cat === 'movie' ? '/search/movie' : cat === 'series' || cat === 'tv' ? '/search/tv' : '/search/multi';
    const data = await tmdb(endpoint, { query: q, page });
    const list = mapList(data);
    if (cat === 'anime') {
      list.results = list.results.filter(r => r.originalLanguage === 'ja');
    }
    return list;
  });
}

async function handleDetails(id: string, cat: string): Promise<SafeDetails | null> {
  const type = getTmdbType(cat);
  const key = `details:${type}:${id}`;
  return withCache(key, TTL.details, async () => {
    const data = await tmdb(`/${type}/${id}`);
    if (!data) return null;
    return mapDetails(data);
  });
}

async function handleCredits(id: string, cat: string): Promise<SafeCastMember[] | null> {
  const type = getTmdbType(cat);
  const key = `credits:${type}:${id}`;
  return withCache(key, TTL.credits, async () => {
    const data = await tmdb(`/${type}/${id}/credits`);
    return mapCast(data?.cast || []);
  });
}

async function handleVideos(id: string, cat: string): Promise<SafeVideo[] | null> {
  const type = getTmdbType(cat);
  const key = `videos:${type}:${id}`;
  return withCache(key, TTL.videos, async () => {
    const data = await tmdb(`/${type}/${id}/videos`);
    return mapVideos(data?.results || []);
  });
}

async function handleImages(id: string, cat: string): Promise<{ logos: SafeImage[], backdrops: SafeImage[] } | null> {
  const type = getTmdbType(cat);
  const key = `images:${type}:${id}`;
  return withCache(key, TTL.images, async () => {
    const data = await tmdb(`/${type}/${id}/images`, { include_image_language: 'en,pt,null' });
    return {
      logos: mapImages(data?.logos || []),
      backdrops: mapImages(data?.backdrops || []),
    };
  });
}

async function handleSimilar(id: string, cat: string): Promise<SafeListResponse | null> {
  const type = getTmdbType(cat);
  const key = `similar:${type}:${id}`;
  return withCache(key, TTL.similar, async () => {
    let data = await tmdb(`/${type}/${id}/recommendations`);
    if (!data?.results?.length) {
      data = await tmdb(`/${type}/${id}/similar`);
    }
    return mapList(data);
  });
}

async function handleSeasons(id: string): Promise<SafeSeason[] | null> {
  const key = `seasons:${id}`;
  return withCache(key, TTL.seasons, async () => {
    const data = await tmdb(`/tv/${id}`);
    return (data?.seasons || [])
      .filter((s: any) => s.season_number > 0)
      .map((s: any): SafeSeason => ({
        id: s.id,
        number: s.season_number,
        name: s.name,
        episodeCount: s.episode_count,
        airDate: s.air_date,
        posterPath: s.poster_path,
        overview: s.overview,
      }));
  });
}

async function handleSeasonEpisodes(id: string, season: string): Promise<SafeEpisode[] | null> {
  const key = `episodes:${id}:${season}`;
  return withCache(key, TTL.episodes, async () => {
    const data = await tmdb(`/tv/${id}/season/${season}`);
    return mapEpisodes(data?.episodes || []);
  });
}

async function handleGenres(cat: string): Promise<{ genres: { id: number; name: string }[] } | null> {
  const type = cat === 'series' || cat === 'anime' ? 'tv' : 'movie';
  const key = `genres:${type}`;
  return withCache(key, TTL.genres, async () => {
    const data = await tmdb(`/genre/${type}/list`);
    return { genres: data?.genres || [] };
  });
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  // Anti-bot check
  if (isSuspiciousRequest(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || '';

  // Rate limiting
  const limit = checkRateLimit(ip, `/${type}`);
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too Many Requests' }, {
      status: 429,
      headers: {
        'Retry-After': String(limit.resetIn),
        'X-RateLimit-Remaining': '0',
      },
    });
  }

  // Param sanitization
  const cat = (['movie', 'tv', 'series', 'anime', 'all'].includes(searchParams.get('category') || ''))
    ? searchParams.get('category')!
    : 'all';
  const rawPage = parseInt(searchParams.get('page') || '1');
  const page = String(Math.min(Math.max(rawPage, 1), 100));
  const id = searchParams.get('id')?.replace(/\D/g, '') || '';
  const genre = searchParams.get('genre')?.replace(/\D/g, '') || '';
  const season = searchParams.get('season')?.replace(/\D/g, '') || '1';
  const rawQ = searchParams.get('q') || '';
  const q = rawQ.substring(0, 120).trim();

  let data: any = null;

  try {
    switch (type) {
      case 'trending':    data = await handleTrending(cat, page); break;
      case 'popular':     data = await handlePopular(cat, page); break;
      case 'top_rated':   data = await handleTopRated(cat, page); break;
      case 'recent':      data = await handleRecent(cat, page); break;
      case 'upcoming':    data = await handleUpcoming(page); break;
      case 'discover':    data = await handleDiscover(cat, genre, page); break;
      case 'search':      if (!q) return NextResponse.json({ error: 'Query required' }, { status: 400 });
                          data = await handleSearch(q, cat, page); break;
      case 'details':     if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
                          data = await handleDetails(id, cat); break;
      case 'credits':     if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
                          data = await handleCredits(id, cat); break;
      case 'videos':      if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
                          data = await handleVideos(id, cat); break;
      case 'images':      if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
                          data = await handleImages(id, cat); break;
      case 'similar':     if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
                          data = await handleSimilar(id, cat); break;
      case 'seasons':     if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
                          data = await handleSeasons(id); break;
      case 'season_episodes': if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
                          data = await handleSeasonEpisodes(id, season); break;
      case 'genres':      data = await handleGenres(cat); break;
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    if (data === null) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 });
    }

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-RateLimit-Remaining': String(limit.remaining),
      },
    });
  } catch (err) {
    console.error('[/api/catalog] Error:', type, err instanceof Error ? err.message : 'unknown');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
