export const getTmdbImage = (path: string | null | undefined, size = 'w500') => {
  if (!path) return '';
  if (size === 'original') return `https://image.tmdb.org/t/p/original${path}`;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export async function fetchFromTmdb(endpoint: string, params: Record<string, string> = {}, silent = false) {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey) {
    console.warn('Missing NEXT_PUBLIC_TMDB_API_KEY environment variable.');
    return null;
  }

  const url = new URL(`https://api.themoviedb.org/3${endpoint}`);
  url.searchParams.append('api_key', apiKey);
  url.searchParams.append('language', 'pt-BR');
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  try {
    const response = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!response.ok) {
      if (!silent) console.error(`TMDB API Error: ${response.status} ${response.statusText}`);
      return null;
    }
    return response.json();
  } catch (error) {
    console.error("TMDB Fetch Error:", error);
    return null;
  }
}

export async function getTrending(type: 'movie' | 'tv' | 'all' = 'all') {
  const data = await fetchFromTmdb(`/trending/${type}/week`);
  return data?.results || [];
}

export async function getPopular(type: 'movie' | 'tv' = 'movie', page = 1) {
  const data = await fetchFromTmdb(`/${type}/popular`, { page: String(page) });
  return data?.results || [];
}

export async function getTopRated(type: 'movie' | 'tv' = 'movie', page = 1) {
  const data = await fetchFromTmdb(`/${type}/top_rated`, { page: String(page) });
  return data?.results || [];
}

export async function getRecentReleases(type: 'movie' | 'tv' = 'movie', page = 1) {
  const endpoint = type === 'movie' ? '/movie/now_playing' : '/tv/on_the_air';
  const data = await fetchFromTmdb(endpoint, { page: String(page) });
  return data?.results || [];
}

export async function searchTmdb(query: string, page = 1) {
  if (!query) return [];
  const data = await fetchFromTmdb('/search/multi', { query, page: String(page) });
  return data?.results || [];
}

export async function getDetails(type: 'movie' | 'tv', id: string) {
  const data = await fetchFromTmdb(`/${type}/${id}`);
  return data;
}

export async function getAnime(page = 1) {
  // Animes are usually TV shows with genre 16 (Animation) and origin country JP
  const data = await fetchFromTmdb('/discover/tv', {
    with_genres: '16',
    with_original_language: 'ja',
    page: String(page)
  });
  return data?.results || [];
}

export async function getRecentAnime(page = 1) {
  const data = await fetchFromTmdb('/discover/tv', {
    with_genres: '16',
    with_original_language: 'ja',
    sort_by: 'first_air_date.desc',
    'first_air_date.lte': new Date().toISOString().split('T')[0],
    page: String(page)
  });
  return data?.results || [];
}

export async function getGenres(type: 'movie' | 'tv' = 'movie') {
  const data = await fetchFromTmdb(`/genre/${type}/list`);
  return data?.genres || [];
}

export async function getByGenre(type: 'movie' | 'tv', genreId: string, page = 1) {
  const data = await fetchFromTmdb(`/discover/${type}`, {
    with_genres: genreId,
    sort_by: 'popularity.desc',
    page: String(page)
  });
  return data?.results || [];
}

export async function getSimilar(type: 'movie' | 'tv', id: string) {
  let data = await fetchFromTmdb(`/${type}/${id}/recommendations`);
  if (!data?.results || data.results.length === 0) {
    data = await fetchFromTmdb(`/${type}/${id}/similar`);
  }
  return data?.results || [];
}

export async function fetchLogo(id: number | string, type: 'movie' | 'tv' = 'movie') {
  try {
    const data = await fetchFromTmdb(`/${type}/${id}/images`, { include_image_language: 'en,pt,null' }, true);
    if (data && data.logos && data.logos.length > 0) {
      const bestLogo = data.logos.find((l: any) => l.iso_639_1 === 'pt') 
                    || data.logos.find((l: any) => l.iso_639_1 === 'en')
                    || data.logos[0];
      return getTmdbImage(bestLogo.file_path, 'w500');
    }
    return null;
  } catch (e) {
    return null;
  }
}

export function formatTmdbToCard(item: any) {
  const cType = item.media_type || (item.name ? 'tv' : 'movie');
  let typeLabel = '';
  if (cType === 'movie') typeLabel = 'Filme';
  else if (cType === 'tv') typeLabel = 'Série';

  const slug = item.title || item.name;

  return {
    id: item.id,
    type: cType,
    title: item.title || item.name,
    subtitle: typeLabel,
    imageUrl: getTmdbImage(item.poster_path, 'w500') || getTmdbImage(item.backdrop_path, 'w500') || 'https://picsum.photos/seed/1/400/600',
    backdropUrl: getTmdbImage(item.backdrop_path, 'w780') || getTmdbImage(item.poster_path, 'w500') || 'https://picsum.photos/seed/1/800/450',
    posterUrl: getTmdbImage(item.poster_path, 'w500') || getTmdbImage(item.backdrop_path, 'w500') || 'https://picsum.photos/seed/1/400/600',
    slug: slug,
    overview: item.overview,
    date: item.release_date || item.first_air_date,
    score: item.vote_average ? item.vote_average.toFixed(1) : undefined
  };
}
