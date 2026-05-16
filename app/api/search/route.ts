import { NextResponse } from 'next/server';
import { fetchFromTmdb, searchTmdb, formatTmdbToCard, getAnime, getPopular } from '@/lib/tmdb-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || ''; // movie, tv, anime
  const page = parseInt(searchParams.get('page') || '1');

  try {
    let results: any[] = [];

    if (query) {
      // Search TMDB
      const tmdbRes = await searchTmdb(query, page);
      results = tmdbRes
        .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv' || !item.media_type)
        .map((item: any) => {
          const formatted = formatTmdbToCard(item);
          return {
            ...formatted,
            source: 'tmdb'
          };
        });
      
      // Apply type filter if present
      if (type) {
        results = results.filter(item => {
          if (type === 'anime') return item.type === 'tv';
          return item.type === type;
        });
      }
    } else if (type) {
      // Fetch popular by type if no query
      if (type === 'movie') {
        const data = await getPopular('movie', page);
        results = data.map((item: any) => ({ ...formatTmdbToCard({ ...item, media_type: 'movie' }), source: 'tmdb' }));
      } else if (type === 'series' || type === 'tv') {
        const data = await getPopular('tv', page);
        results = data.map((item: any) => ({ ...formatTmdbToCard({ ...item, media_type: 'tv' }), source: 'tmdb' }));
      } else if (type === 'anime') {
        const data = await getAnime(page);
        results = data.map((item: any) => ({ ...formatTmdbToCard({ ...item, media_type: 'tv' }), source: 'tmdb' }));
      }
    } else {
      // General trending
      const data = await fetchFromTmdb('/trending/all/day', { page: String(page) });
      results = (data?.results || []).map((item: any) => ({ ...formatTmdbToCard(item), source: 'tmdb' }));
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error('API Search Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
