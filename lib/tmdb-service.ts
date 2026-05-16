export const getTmdbImage = (path: string | null | undefined, size = 'w500') => {
  if (!path) return '';
  if (size === 'original') return `https://image.tmdb.org/t/p/original${path}`;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || "e977149fcbba55f76536674e77f0a186";

export async function fetchFromTmdb(endpoint: string, params: Record<string, string> = {}, silent = false) {
  if (!TMDB_API_KEY || TMDB_API_KEY === 'undefined') {
    if (!silent) console.warn('TMDB: Missing API Key.');
    return null;
  }
  const url = new URL(`https://api.themoviedb.org/3${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  url.searchParams.append('language', 'pt-BR');
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
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

export async function getUpcoming(page = 1) {
  const data = await fetchFromTmdb('/movie/upcoming', { page: String(page) });
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
  const data = await fetchFromTmdb('/discover/tv', {
    with_genres: '16',
    with_original_language: 'ja',
    sort_by: 'popularity.desc',
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

export async function getTopAnime(page = 1) {
  const data = await fetchFromTmdb('/discover/tv', {
    with_genres: '16',
    with_original_language: 'ja',
    sort_by: 'vote_average.desc',
    'vote_count.gte': '200',
    page: String(page)
  });
  return data?.results || [];
}

export async function getAnimeByGenre(genreId: string | number, page = 1) {
  const data = await fetchFromTmdb('/discover/tv', {
    with_genres: `16,${genreId}`,
    with_original_language: 'ja',
    sort_by: 'popularity.desc',
    page: String(page)
  });
  return data?.results || [];
}

export async function getByGenre(type: 'movie' | 'tv', genreId: string | number, page = 1) {
  const data = await fetchFromTmdb(`/discover/${type}`, {
    with_genres: String(genreId),
    sort_by: 'popularity.desc',
    page: String(page)
  });
  return data?.results || [];
}

export async function getGenres(type: 'movie' | 'tv' = 'movie') {
  const data = await fetchFromTmdb(`/genre/${type}/list`);
  return data?.genres || [];
}

export async function getSimilar(type: 'movie' | 'tv', id: string) {
  let data = await fetchFromTmdb(`/${type}/${id}/recommendations`);
  if (!data?.results || data.results.length === 0) {
    data = await fetchFromTmdb(`/${type}/${id}/similar`);
  }
  return data?.results || [];
}

export async function getCredits(type: 'movie' | 'tv', id: string) {
  const data = await fetchFromTmdb(`/${type}/${id}/credits`);
  return data?.cast || [];
}

export async function getKeywords(type: 'movie' | 'tv', id: string) {
  const data = await fetchFromTmdb(`/${type}/${id}/keywords`);
  return data?.keywords || data?.results || [];
}

/** Returns the best YouTube trailer embed URL, or null */
export async function getTrailerUrl(type: 'movie' | 'tv', id: string): Promise<string | null> {
  const data = await fetchFromTmdb(`/${type}/${id}/videos`, {}, true);
  const results = data?.results || [];
  const trailer = results.find((v: any) => v.type === 'Trailer' && v.iso_639_1 === 'pt' && v.site === 'YouTube')
    || results.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube')
    || results.find((v: any) => v.site === 'YouTube')
    || results[0];
  return trailer ? `https://www.youtube.com/embed/${trailer.key}?rel=0` : null;
}

/** Returns parsed seasons for a TV show */
export async function getSeasons(id: string) {
  const data = await fetchFromTmdb(`/tv/${id}`);
  if (!data?.seasons) return [];
  return data.seasons
    .filter((s: any) => s.season_number > 0)
    .map((s: any) => ({
      id: s.id,
      number: s.season_number,
      name: s.name,
      episodeCount: s.episode_count,
      airDate: s.air_date,
      posterPath: s.poster_path,
      overview: s.overview,
    }));
}

/** Returns episodes for a specific season */
export async function getSeasonEpisodes(seriesId: string, seasonNumber: number) {
  const data = await fetchFromTmdb(`/tv/${seriesId}/season/${seasonNumber}`);
  return (data?.episodes || []).map((ep: any) => ({
    id: ep.id,
    number: ep.episode_number,
    name: ep.name,
    overview: ep.overview,
    airDate: ep.air_date,
    runtime: ep.runtime,
    stillPath: ep.still_path,
    voteAverage: ep.vote_average,
  }));
}

/** Enrich anime with AniList (optional, best-effort) */
export async function enrichWithAniList(title: string): Promise<{ anilistId?: number; score?: number; tags?: string[]; status?: string; episodes?: number } | null> {
  try {
    const query = `query($search:String){Media(search:$search,type:ANIME){id averageScore status episodes tags{name}}}`;
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { search: title } }),
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const media = data?.data?.Media;
    if (!media) return null;
    return {
      anilistId: media.id,
      score: media.averageScore ? media.averageScore / 10 : undefined,
      tags: media.tags?.slice(0, 6).map((t: any) => t.name),
      status: media.status,
      episodes: media.episodes,
    };
  } catch {
    return null;
  }
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
  const isAnime = cType === 'tv' && item.original_language === 'ja' && (item.genre_ids || []).includes(16);
  let typeLabel = '';
  if (isAnime) typeLabel = 'Anime';
  else if (cType === 'movie') typeLabel = 'Filme';
  else if (cType === 'tv') typeLabel = 'Série';
  const slug = item.title || item.name;
  return {
    id: item.id,
    type: cType,
    title: item.title || item.name,
    subtitle: typeLabel,
    isAnime,
    imageUrl: getTmdbImage(item.poster_path, 'w500') || getTmdbImage(item.backdrop_path, 'w500') || 'https://picsum.photos/seed/1/400/600',
    backdropUrl: getTmdbImage(item.backdrop_path, 'w780') || getTmdbImage(item.poster_path, 'w500') || 'https://picsum.photos/seed/1/800/450',
    posterUrl: getTmdbImage(item.poster_path, 'w500') || getTmdbImage(item.backdrop_path, 'w500') || 'https://picsum.photos/seed/1/400/600',
    slug: slug,
    overview: item.overview,
    date: item.release_date || item.first_air_date,
    score: item.vote_average ? item.vote_average.toFixed(1) : undefined,
    popularity: item.popularity,
    voteCount: item.vote_count,
  };
}
