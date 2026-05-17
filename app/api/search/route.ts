/**
 * /api/search — Unified search endpoint
 * Delegates to /api/catalog internally. Adds rate-limiting and sanitization.
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, isSuspiciousRequest } from '@/lib/rate-limit';
import { withCache } from '@/lib/cache';
import { mapList, mapItem } from '@/lib/tmdb-mapper';

const TMDB_KEY = process.env.TMDB_API_KEY || process.env.TMDB_ACCESS_TOKEN || 'e977149fcbba55f76536674e77f0a186';

async function searchTmdb(q: string, mediaType: string, page: number) {
  const endpoint = mediaType === 'movie' ? '/search/movie'
    : mediaType === 'tv' ? '/search/tv'
    : '/search/multi';

  const url = new URL(`https://api.themoviedb.org/3${endpoint}`);
  url.searchParams.set('api_key', TMDB_KEY);
  url.searchParams.set('language', 'pt-BR');
  url.searchParams.set('query', q);
  url.searchParams.set('page', String(page));

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  return res.json();
}

async function browseByGenre(mediaType: 'movie' | 'tv', genre: string, sort: string, page: number) {
  const url = new URL(`https://api.themoviedb.org/3/discover/${mediaType}`);
  url.searchParams.set('api_key', TMDB_KEY);
  url.searchParams.set('language', 'pt-BR');
  url.searchParams.set('with_genres', genre);
  url.searchParams.set('sort_by', sort || 'popularity.desc');
  url.searchParams.set('page', String(page));
  const res = await fetch(url.toString(), { next: { revalidate: 21600 } });
  if (!res.ok) return null;
  return res.json();
}

async function browseAnime(sort: string, page: number) {
  const sortField = sort === 'top_rated' ? 'vote_average.desc'
    : sort === 'recent' ? 'first_air_date.desc'
    : 'popularity.desc';
  const url = new URL('https://api.themoviedb.org/3/discover/tv');
  url.searchParams.set('api_key', TMDB_KEY);
  url.searchParams.set('language', 'pt-BR');
  url.searchParams.set('with_genres', '16');
  url.searchParams.set('with_original_language', 'ja');
  url.searchParams.set('sort_by', sortField);
  url.searchParams.set('page', String(page));
  if (sort === 'top_rated') url.searchParams.set('vote_count.gte', '200');
  const res = await fetch(url.toString(), { next: { revalidate: 21600 } });
  if (!res.ok) return null;
  return res.json();
}

export async function GET(req: NextRequest) {
  if (isSuspiciousRequest(req)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
  const rl = checkRateLimit(ip, '/search');
  if (!rl.allowed) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded.' }, {
      status: 429,
      headers: { 'Retry-After': String(rl.resetIn) },
    });
  }

  const { searchParams } = new URL(req.url);
  const rawQ    = (searchParams.get('q') || '').substring(0, 120).trim();
  const type    = searchParams.get('type') || '';
  const sort    = searchParams.get('sort') || 'popular';
  const genre   = (searchParams.get('genre') || '').replace(/\D/g, '');
  const rawPage = parseInt(searchParams.get('page') || '1');
  const page    = Math.min(Math.max(rawPage, 1), 50);

  // Map type string to TMDb media type
  const mediaType = type === 'movie' ? 'movie' : type === 'tv' || type === 'series' ? 'tv' : 'multi';

  try {
    let raw: any = null;

    if (rawQ) {
      const cacheKey = `search:${rawQ}:${mediaType}:${page}`;
      raw = await withCache(cacheKey, 3600, () => searchTmdb(rawQ, mediaType, page));
    } else if (genre) {
      const mtype = type === 'movie' ? 'movie' : 'tv';
      const cacheKey = `browse:genre:${mtype}:${genre}:${sort}:${page}`;
      raw = await withCache(cacheKey, 21600, () => browseByGenre(mtype as 'movie' | 'tv', genre, sort, page));
    } else if (type === 'anime') {
      const cacheKey = `browse:anime:${sort}:${page}`;
      raw = await withCache(cacheKey, 21600, () => browseAnime(sort, page));
    } else {
      // Fallback: general trending
      const url = new URL('https://api.themoviedb.org/3/trending/all/week');
      url.searchParams.set('api_key', TMDB_KEY);
      url.searchParams.set('language', 'pt-BR');
      url.searchParams.set('page', String(page));
      const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
      raw = res.ok ? await res.json() : null;
    }

    const safe = mapList(raw);

    // Filter by anime if needed
    if (type === 'anime' && rawQ) {
      safe.results = safe.results.filter(r => r.originalLanguage === 'ja');
    }

    // Filter out items without images
    safe.results = safe.results.filter(r => r.posterPath || r.backdropPath);

    return NextResponse.json({ success: true, ...safe });
  } catch (err) {
    console.error('[/api/search] Error:', err instanceof Error ? err.message : 'unknown');
    return NextResponse.json({ success: false, error: 'Erro ao buscar conteúdos.' }, { status: 500 });
  }
}
