/**
 * tmdb-mapper.ts — Safe payload mappers
 * Strip all sensitive / unnecessary fields from TMDb responses before sending to client.
 */

export type SafeMediaItem = {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  originalTitle?: string;
  overview?: string;
  posterPath?: string;
  backdropPath?: string;
  releaseDate?: string;
  firstAirDate?: string;
  year?: number;
  voteAverage?: number;
  popularity?: number;
  genreIds?: number[];
  genres?: { id: number; name: string }[];
  originalLanguage?: string;
  originCountry?: string[];
  mediaType?: string;
};

export type SafeDetails = SafeMediaItem & {
  runtime?: number;
  status?: string;
  seasons?: SafeSeason[];
  cast?: SafeCastMember[];
  videos?: SafeVideo[];
  logos?: SafeImage[];
  keywords?: string[];
  similar?: SafeMediaItem[];
};

export type SafeSeason = {
  id: number;
  number: number;
  name: string;
  episodeCount?: number;
  airDate?: string;
  posterPath?: string;
  overview?: string;
};

export type SafeEpisode = {
  id: number;
  number: number;
  name: string;
  overview?: string;
  airDate?: string;
  runtime?: number;
  stillPath?: string;
  voteAverage?: number;
};

export type SafeCastMember = {
  id: number;
  name: string;
  character?: string;
  profilePath?: string;
};

export type SafeVideo = {
  key: string;
  site: string;
  type: string;
  iso639?: string;
};

export type SafeImage = {
  filePath: string;
  iso639?: string;
};

export type SafeListResponse = {
  results: SafeMediaItem[];
  page?: number;
  totalPages?: number;
};

/** Map a raw TMDb item to a safe payload */
export function mapItem(raw: any): SafeMediaItem {
  const type = raw.media_type === 'movie' || raw.release_date != null ? 'movie' : 'tv';
  const date = raw.release_date || raw.first_air_date;
  return {
    id: raw.id,
    type,
    title: raw.title || raw.name || '',
    originalTitle: raw.original_title || raw.original_name,
    overview: raw.overview || undefined,
    posterPath: raw.poster_path || undefined,
    backdropPath: raw.backdrop_path || undefined,
    releaseDate: raw.release_date || undefined,
    firstAirDate: raw.first_air_date || undefined,
    year: date ? Number(date.substring(0, 4)) : undefined,
    voteAverage: raw.vote_average,
    popularity: raw.popularity,
    genreIds: raw.genre_ids,
    genres: raw.genres,
    originalLanguage: raw.original_language,
    originCountry: raw.origin_country,
    mediaType: raw.media_type,
  };
}

export function mapList(raw: any): SafeListResponse {
  return {
    results: (raw?.results || []).map(mapItem),
    page: raw?.page,
    totalPages: raw?.total_pages,
  };
}

export function mapDetails(raw: any): SafeDetails {
  const base = mapItem(raw);
  return {
    ...base,
    runtime: raw.runtime || raw.episode_run_time?.[0],
    status: raw.status,
    genres: raw.genres,
    seasons: raw.seasons
      ?.filter((s: any) => s.season_number > 0)
      .map((s: any): SafeSeason => ({
        id: s.id,
        number: s.season_number,
        name: s.name,
        episodeCount: s.episode_count,
        airDate: s.air_date,
        posterPath: s.poster_path,
        overview: s.overview,
      })),
  };
}

export function mapCast(raw: any[]): SafeCastMember[] {
  return (raw || []).slice(0, 20).map(p => ({
    id: p.id,
    name: p.name,
    character: p.character,
    profilePath: p.profile_path,
  }));
}

export function mapVideos(raw: any[]): SafeVideo[] {
  return (raw || []).map(v => ({
    key: v.key,
    site: v.site,
    type: v.type,
    iso639: v.iso_639_1,
  }));
}

export function mapImages(raw: any[]): SafeImage[] {
  return (raw || []).map(img => ({
    filePath: img.file_path,
    iso639: img.iso_639_1,
  }));
}

export function mapEpisodes(raw: any[]): SafeEpisode[] {
  return (raw || []).map(ep => ({
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
