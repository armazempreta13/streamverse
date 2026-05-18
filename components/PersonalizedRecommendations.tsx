'use client';

import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { MediaCard } from './Cards';
import { getTmdbImage } from '@/lib/tmdb-service';

// ─── Endpoint -> /api/catalog params mapping ───
type CatalogParams = { type: string; category?: string; genre?: string };

const ENDPOINT_MAP: Record<string, CatalogParams> = {
  trending:          { type: 'trending', category: 'all' },
  popular_movies:    { type: 'popular',  category: 'movie' },
  action_movies:     { type: 'discover', category: 'movie', genre: '28' },
  horror_movies:     { type: 'discover', category: 'movie', genre: '27' },
  scifi_movies:      { type: 'discover', category: 'movie', genre: '878' },
  comedy_movies:     { type: 'discover', category: 'movie', genre: '35' },
  action_series:     { type: 'discover', category: 'series', genre: '10759' },
  drama_series:      { type: 'discover', category: 'series', genre: '18' },
  anime:             { type: 'popular',  category: 'anime' },
};

const GENRE_MAPPING: Record<string, { endpoint: string; label: string }> = {
  "Ação": { endpoint: "action_movies", label: "Ação" },
  "Ação & Aventura": { endpoint: "action_series", label: "Ação & Aventura" },
  "Terror": { endpoint: "horror_movies", label: "Terror" },
  "Ficção científica": { endpoint: "scifi_movies", label: "Ficção Científica" },
  "Comédia": { endpoint: "comedy_movies", label: "Comédia" },
  "Drama": { endpoint: "drama_series", label: "Drama" },
  "Animação": { endpoint: "anime", label: "Animes" },
  "Action": { endpoint: "action_movies", label: "Ação" },
  "Action & Adventure": { endpoint: "action_series", label: "Ação & Aventura" },
  "Horror": { endpoint: "horror_movies", label: "Terror" },
  "Sci-Fi": { endpoint: "scifi_movies", label: "Ficção Científica" },
  "Science Fiction": { endpoint: "scifi_movies", label: "Ficção Científica" },
  "Comedy": { endpoint: "comedy_movies", label: "Comédia" },
  "Animation": { endpoint: "anime", label: "Animes" }
};

async function fetchCatalog(endpoint: string): Promise<any[]> {
  const params = ENDPOINT_MAP[endpoint];
  if (!params) return [];

  const qs = new URLSearchParams({ type: params.type });
  if (params.category) qs.set('category', params.category);
  if (params.genre) qs.set('genre', params.genre);

  const res = await fetch(`/api/catalog?${qs.toString()}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data?.results || [];
}

function formatItem(item: any) {
  const type = item.type || (item.firstAirDate != null ? 'tv' : 'movie');
  return {
    id: item.id,
    type,
    title: item.title || '',
    subtitle: item.originalLanguage === 'ja' ? 'Anime' : type === 'movie' ? 'Filme' : 'Série',
    isAnime: item.originalLanguage === 'ja',
    imageUrl: getTmdbImage(item.posterPath, 'w185') || getTmdbImage(item.backdropPath, 'w185') || 'https://picsum.photos/seed/1/400/600',
    backdropUrl: getTmdbImage(item.backdropPath, 'w300') || getTmdbImage(item.posterPath, 'w185') || 'https://picsum.photos/seed/1/800/450',
    posterUrl: getTmdbImage(item.posterPath, 'w185') || getTmdbImage(item.backdropPath, 'w185') || 'https://picsum.photos/seed/1/400/600',
    slug: item.title || '',
  };
}

const recommendationCache = new Map<string, any[]>();

export function PersonalizedRecommendations() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [data, setData] = useState<any[]>([]);
  const [title, setTitle] = useState("Recomendados para Você");
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (hasLoaded) return;

    const load = async () => {
      // 1. Determine favorite genre
      let favoriteGenre = "";
      let maxCount = 0;
      try {
        const clicks = JSON.parse(localStorage.getItem('streamverse_genre_clicks') || '{}');
        Object.entries(clicks).forEach(([genre, count]: [string, any]) => {
          if (count > maxCount) {
            maxCount = count;
            favoriteGenre = genre;
          }
        });
      } catch (e) {}

      const mapped = favoriteGenre ? GENRE_MAPPING[favoriteGenre] : null;
      const endpoint = mapped ? mapped.endpoint : 'trending';
      const label = mapped ? `Recomendados de ${mapped.label}` : 'Especialmente para Você';
      setTitle(label);

      if (recommendationCache.has(endpoint)) {
        setData(recommendationCache.get(endpoint)!);
        setHasLoaded(true);
        return;
      }

      try {
        const results = await fetchCatalog(endpoint);
        if (results.length > 0) {
          const seen = new Set<number>();
          const formatted = results
            .filter((item: any) => {
              if (seen.has(item.id)) return false;
              seen.add(item.id);
              return true;
            })
            .slice(0, 15)
            .map((item: any) => formatItem(item));
          setData(formatted);
          recommendationCache.set(endpoint, formatted);
        }
      } catch (err) {
        console.error("Failed to load recommendations", err);
      } finally {
        setHasLoaded(true);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          load();
          observer.disconnect();
        }
      },
      { rootMargin: '400px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasLoaded]);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -500, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 500, behavior: 'smooth' });
    }
  };

  if (hasLoaded && data.length === 0) return null;

  return (
    <section 
      ref={sectionRef} 
      className="relative px-6 sm:px-10 py-6 group/section select-none"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#8F44FF]/10 border border-[#8F44FF]/20 flex items-center justify-center shadow-[0_0_15px_rgba(143,68,255,0.1)]">
            <Sparkles className="size-4 text-[#A661FF] animate-pulse" />
          </div>
          <h3 className="text-[20px] font-display font-bold text-white tracking-wide">
            {title}
          </h3>
        </div>
      </div>

      <div className="relative">
        {/* Navigation Buttons */}
        <button 
          onClick={scrollLeft}
          className="absolute left-[-24px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center z-20 opacity-0 group-hover/section:opacity-100 transition-all duration-300 text-white hover:scale-110 shadow-2xl hover:bg-[#8F44FF] hover:border-[#8F44FF]"
        >
          <ChevronLeft className="size-6 ml-[-2px]" />
        </button>
        
        <button 
          onClick={scrollRight}
          className="absolute right-[-24px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center z-20 opacity-0 group-hover/section:opacity-100 transition-all duration-300 text-white hover:scale-110 shadow-2xl hover:bg-[#8F44FF] hover:border-[#8F44FF]"
        >
          <ChevronRight className="size-6 mr-[-2px]" />
        </button>

        {/* Carousel Content */}
        <div 
          ref={scrollRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 scrollbar-hide -mx-6 sm:-mx-10 px-6 sm:px-10 snap-x snap-mandatory"
          style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
        >
          {data.length === 0 ? (
            // Shimmer placeholders
            [...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="w-[150px] sm:w-[185px] aspect-[2/3] bg-white/[0.03] rounded-xl animate-pulse shrink-0 border border-white/5" 
              />
            ))
          ) : (
            data.map((item) => (
              <div key={item.id} className="snap-start shrink-0">
                <MediaCard
                  title={item.title}
                  subtitle={item.subtitle}
                  imageUrl={item.imageUrl}
                  slug={item.slug}
                  href={`/tmdb/${item.type}/${item.id}`}
                  theme={item.isAnime ? 'anime' : 'default'}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
