import { NextResponse } from 'next/server';
import {
  fetchFromTmdb, searchTmdb, formatTmdbToCard,
  getAnime, getPopular, getTrending, getTopRated,
  getRecentReleases, getTopAnime, getByGenre
} from '@/lib/tmdb-service';

const SORT_TO_ENDPOINT: Record<string, (type: string, page: number) => Promise<any[]>> = {
  popular: (type, page) => getPopular(type as 'movie' | 'tv', page),
  trending: (type, page) => type === 'anime'
    ? getAnime(page)
    : fetchFromTmdb(`/trending/${type === 'movie' ? 'movie' : 'tv'}/week`, { page: String(page) }).then(d => d?.results || []),
  top_rated: (type, page) => getTopRated(type as 'movie' | 'tv', page),
  recent: (type, page) => getRecentReleases(type as 'movie' | 'tv', page),
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryStr = searchParams.get('q') || '';
  const type = searchParams.get('type') || ''; // movie, tv, anime
  const sort = searchParams.get('sort') || '';
  const genre = searchParams.get('genre') || '';
  const page = parseInt(searchParams.get('page') || '1');

  try {
    let results: any[] = [];

    if (queryStr) {
      // Search TMDB
      const tmdbRes = await searchTmdb(queryStr, page);
      results = tmdbRes
        .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv' || !item.media_type)
        .map((item: any) => {
          const formatted = formatTmdbToCard(item);
          return { ...formatted, href: `/tmdb/${formatted.type}/${formatted.id}`, source: 'tmdb' };
        });
      if (type) {
        results = results.filter(item => {
          if (type === 'anime') return item.isAnime;
          if (type === 'movie') return item.type === 'movie';
          return item.type === 'tv';
        });
      }
    } else if (genre) {
      // Genre-based browse
      const mediaType = type === 'movie' ? 'movie' : 'tv';
      const data = await getByGenre(mediaType, genre, page);
      results = data.map((item: any) => {
        const formatted = formatTmdbToCard({ ...item, media_type: mediaType });
        return { ...formatted, href: `/tmdb/${formatted.type}/${formatted.id}`, source: 'tmdb' };
      });
    } else if (type === 'anime') {
      // Anime catalog
      const sortFn = sort === 'top_rated'
        ? () => getTopAnime(page)
        : sort === 'recent'
        ? () => getRecentReleases('tv', page)
        : () => getAnime(page);
      const data = await sortFn();
      results = data.map((item: any) => {
        const formatted = formatTmdbToCard({ ...item, media_type: 'tv' });
        return { ...formatted, href: `/tmdb/${formatted.type}/${formatted.id}`, source: 'tmdb', isAnime: true };
      });
    } else if (type) {
      // Movie/Series catalog with optional sort
      const mediaType = type === 'movie' ? 'movie' : 'tv';
      const sortFn = SORT_TO_ENDPOINT[sort] || ((t, p) => getPopular(t as 'movie' | 'tv', p));
      const data = await sortFn(mediaType, page);
      results = data.map((item: any) => {
        const formatted = formatTmdbToCard({ ...item, media_type: mediaType });
        return { ...formatted, href: `/tmdb/${formatted.type}/${formatted.id}`, source: 'tmdb' };
      });
    } else {
      // General trending (default)
      const endpoint = sort === 'trending' ? '/trending/all/week' : '/trending/all/day';
      const data = await fetchFromTmdb(endpoint, { page: String(page) });
      results = (data?.results || []).map((item: any) => {
        const formatted = formatTmdbToCard(item);
        return { ...formatted, href: `/tmdb/${formatted.type}/${formatted.id}`, source: 'tmdb' };
      });
    }

    // Filter out items without images
    results = results.filter(r => r.imageUrl && !r.imageUrl.includes('picsum'));

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error('API Search Error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar conteúdos.' }, { status: 500 });
  }
}
