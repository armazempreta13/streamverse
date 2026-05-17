import { NextRequest, NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.TMDB_API_KEY || process.env.TMDB_ACCESS_TOKEN || "e977149fcbba55f76536674e77f0a186";

// Whitelist of allowed endpoints
const ALLOWED_ENDPOINTS = [
  /^\/trending\/(movie|tv|all)\/week$/,
  /^\/(movie|tv)\/popular$/,
  /^\/(movie|tv)\/top_rated$/,
  /^\/(movie|tv)\/(now_playing|on_the_air)$/,
  /^\/movie\/upcoming$/,
  /^\/search\/(multi|movie|tv)$/,
  /^\/(movie|tv)\/(\d+)$/,
  /^\/discover\/(movie|tv)$/,
  /^\/genre\/(movie|tv)\/list$/,
  /^\/(movie|tv)\/(\d+)\/(recommendations|similar|credits|keywords|videos|images)$/,
  /^\/tv\/(\d+)\/season\/(\d+)$/
];

function isAllowed(endpoint: string) {
  return ALLOWED_ENDPOINTS.some(regex => regex.test(endpoint));
}

// In-memory rate limiting map
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();

function checkRateLimit(ip: string, endpoint: string) {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  
  let limit = 60; // Default: 60 req/min
  if (endpoint.startsWith('/search')) limit = 20;
  else if (endpoint.startsWith('/trending') || endpoint.startsWith('/discover')) limit = 30;

  const key = `${ip}:${endpoint}`;
  let record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + windowMs };
    rateLimitMap.set(key, record);
    return true; // allowed
  }

  record.count++;
  if (record.count > limit) {
    return false; // blocked
  }

  return true; // allowed
}

// Generic safe mapper to strip unwanted TMDB fields
function safeMapItem(item: any) {
  if (!item || typeof item !== 'object') return item;
  
  return {
    id: item.id,
    media_type: item.media_type,
    name: item.name,
    title: item.title,
    original_title: item.original_title,
    original_name: item.original_name,
    original_language: item.original_language,
    genre_ids: item.genre_ids,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    overview: item.overview,
    release_date: item.release_date,
    first_air_date: item.first_air_date,
    vote_average: item.vote_average,
    popularity: item.popularity,
    vote_count: item.vote_count,
    
    // For videos
    type: item.type,
    iso_639_1: item.iso_639_1,
    site: item.site,
    key: item.key,
    
    // For images
    file_path: item.file_path,
    
    // For episodes
    episode_number: item.episode_number,
    runtime: item.runtime,
    still_path: item.still_path,
    
    // For seasons
    season_number: item.season_number,
    episode_count: item.episode_count,
    air_date: item.air_date,
    
    // For credits
    character: item.character,
    profile_path: item.profile_path,
  };
}

function sanitizeResponse(path: string, data: any) {
  if (!data) return data;
  
  const sanitized: any = {};
  
  if (data.results && Array.isArray(data.results)) {
    sanitized.results = data.results.map(safeMapItem);
  }
  if (data.cast && Array.isArray(data.cast)) {
    sanitized.cast = data.cast.map(safeMapItem);
  }
  if (data.keywords && Array.isArray(data.keywords)) {
    sanitized.keywords = data.keywords.map(safeMapItem);
  }
  if (data.genres && Array.isArray(data.genres)) {
    sanitized.genres = data.genres;
  }
  if (data.seasons && Array.isArray(data.seasons)) {
    sanitized.seasons = data.seasons.map(safeMapItem);
  }
  if (data.episodes && Array.isArray(data.episodes)) {
    sanitized.episodes = data.episodes.map(safeMapItem);
  }
  if (data.logos && Array.isArray(data.logos)) {
    sanitized.logos = data.logos.map(safeMapItem);
  }
  
  // If it's a details endpoint, map the top-level properties
  if (path.match(/^\/(movie|tv)\/\d+$/)) {
    Object.assign(sanitized, safeMapItem(data));
    if (data.seasons) sanitized.seasons = data.seasons.map(safeMapItem);
    if (data.genres) sanitized.genres = data.genres;
  }
  
  // Copy safe pagination data
  if (typeof data.page === 'number') sanitized.page = data.page;
  if (typeof data.total_pages === 'number') sanitized.total_pages = data.total_pages;
  if (typeof data.total_results === 'number') sanitized.total_results = data.total_results;

  return sanitized;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const path = '/' + (resolvedParams.path || []).join('/');

  if (!isAllowed(path)) {
    return NextResponse.json({ error: 'Endpoint não permitido' }, { status: 403 });
  }

  // Rate Limiting
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip, path)) {
    return NextResponse.json({ error: 'Too Many Requests' }, { 
      status: 429,
      headers: { 'Retry-After': '60' }
    });
  }

  const { searchParams } = new URL(req.url);
  
  const tmdbUrl = new URL(`https://api.themoviedb.org/3${path}`);
  tmdbUrl.searchParams.set('api_key', TMDB_API_KEY);
  tmdbUrl.searchParams.set('language', 'pt-BR');
  
  // Allowed query parameters
  const allowedParams = [
    'page', 'query', 'with_genres', 'with_original_language', 
    'sort_by', 'first_air_date.lte', 'vote_count.gte', 
    'include_image_language'
  ];
  
  for (const key of allowedParams) {
    if (searchParams.has(key)) {
      const val = searchParams.get(key)!;
      // Sanitize inputs
      if (key === 'page' && parseInt(val) > 500) continue; 
      if (key === 'query' && val.length > 100) continue;
      tmdbUrl.searchParams.set(key, val);
    }
  }

  // Determine TTL based on path
  let revalidate = 3600; // default 1 hour
  if (path.includes('/trending') || path.includes('/popular')) revalidate = 21600; // 6 hours
  if (path.match(/^\/(movie|tv)\/\d+$/)) revalidate = 86400; // details 24 hours
  if (path.includes('/genre')) revalidate = 604800; // 7 days

  try {
    const res = await fetch(tmdbUrl.toString(), { next: { revalidate } });
    if (!res.ok) {
      return NextResponse.json({ error: 'Erro ao buscar dados do catálogo' }, { status: res.status });
    }
    const data = await res.json();
    
    // Filter payload before sending to client
    const safePayload = sanitizeResponse(path, data);
    
    return NextResponse.json(safePayload);
  } catch (err) {
    console.error('API TMDB Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
