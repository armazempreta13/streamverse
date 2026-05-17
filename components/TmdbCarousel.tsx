'use client';

import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TrendingCard, MediaCard } from './Cards';
import Link from 'next/link';
import { getTmdbImage } from '@/lib/tmdb-service';

// ─── Endpoint → /api/catalog params mapping ──────────────────────────────────

type CatalogParams = { type: string; category?: string; genre?: string };

const ENDPOINT_MAP: Record<string, CatalogParams> = {
  trending:          { type: 'trending', category: 'all' },
  trending_movies:   { type: 'trending', category: 'movie' },
  trending_series:   { type: 'trending', category: 'series' },
  popular:           { type: 'popular',  category: 'movie' },
  popular_movies:    { type: 'popular',  category: 'movie' },
  popular_series:    { type: 'popular',  category: 'series' },
  popular_anime:     { type: 'popular',  category: 'anime' },
  anime:             { type: 'popular',  category: 'anime' },
  recent_movies:     { type: 'recent',   category: 'movie' },
  recent_series:     { type: 'recent',   category: 'series' },
  recent_anime:      { type: 'recent',   category: 'anime' },
  top_rated_movies:  { type: 'top_rated', category: 'movie' },
  top_rated_series:  { type: 'top_rated', category: 'series' },
  top_anime:         { type: 'top_rated', category: 'anime' },
  upcoming_movies:   { type: 'upcoming' },
  action_movies:     { type: 'discover', category: 'movie', genre: '28' },
  horror_movies:     { type: 'discover', category: 'movie', genre: '27' },
  scifi_movies:      { type: 'discover', category: 'movie', genre: '878' },
  comedy_movies:     { type: 'discover', category: 'movie', genre: '35' },
  action_series:     { type: 'discover', category: 'series', genre: '10759' },
  drama_series:      { type: 'discover', category: 'series', genre: '18' },
  thriller_series:   { type: 'discover', category: 'series', genre: '53' },
  action_anime:      { type: 'discover', category: 'anime', genre: '10759' },
  comedy_anime:      { type: 'discover', category: 'anime', genre: '35' },
  fantasy_anime:     { type: 'discover', category: 'anime', genre: '10765' },
  romance_anime:     { type: 'discover', category: 'anime', genre: '10749' },
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

function formatItem(item: any, index: number) {
  const type = item.type || (item.firstAirDate != null ? 'tv' : 'movie');
  return {
    id: item.id,
    type,
    title: item.title || '',
    subtitle: item.originalLanguage === 'ja' ? 'Anime' : type === 'movie' ? 'Filme' : 'Série',
    isAnime: item.originalLanguage === 'ja',
    imageUrl: getTmdbImage(item.posterPath, 'w500') || getTmdbImage(item.backdropPath, 'w500') || 'https://picsum.photos/seed/1/400/600',
    backdropUrl: getTmdbImage(item.backdropPath, 'w780') || getTmdbImage(item.posterPath, 'w500') || 'https://picsum.photos/seed/1/800/450',
    posterUrl: getTmdbImage(item.posterPath, 'w500') || getTmdbImage(item.backdropPath, 'w500') || 'https://picsum.photos/seed/1/400/600',
    slug: item.title || '',
    rank: index + 1,
  };
}

// ─── Session-level carousel cache (survives navigation, cleared on reload) ───
const carouselCache = new Map<string, any[]>();

interface TmdbCarouselProps {
  title: string;
  endpoint: keyof typeof ENDPOINT_MAP;
  cardStyle?: 'trending' | 'media';
  seeAllHref?: string;
  badge?: string;
  theme?: 'default' | 'anime';
}

export const TmdbCarousel = React.memo(function TmdbCarousel({ title, endpoint, cardStyle = 'media', seeAllHref, badge, theme = 'default' }: TmdbCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [data, setData] = useState<any[]>(() => typeof window !== 'undefined' ? carouselCache.get(endpoint) || [] : []);
  const [hasLoaded, setHasLoaded] = useState(() => typeof window !== 'undefined' ? carouselCache.has(endpoint) : false);

  useEffect(() => {
    if (hasLoaded) return;

    const load = async () => {
      if (carouselCache.has(endpoint)) {
        setData(carouselCache.get(endpoint)!);
        setHasLoaded(true);
        return;
      }
      try {
        const results = await fetchCatalog(endpoint);
        if (results.length > 0) {
          const seen = new Set<number>();
          const formatted = results
            .filter((item: any) => { if (seen.has(item.id)) return false; seen.add(item.id); return true; })
            .slice(0, 20)
            .map((item: any, i: number) => formatItem(item, i));
          setData(formatted);
          carouselCache.set(endpoint, formatted);
        }
      } catch {
        // Silently fail — carousel just stays empty
      } finally {
        setHasLoaded(true);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { load(); observer.disconnect(); } },
      { rootMargin: '500px' }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [endpoint, hasLoaded]);

  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -800, behavior: 'smooth' });
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 800, behavior: 'smooth' });

  if (!hasLoaded) {
    return (
      <section ref={sectionRef} className="relative px-6 sm:px-10 pb-0 pt-2 min-h-[300px]">
        <div className="flex items-end justify-between mb-4">
          <h3 className="text-[24px] font-display font-bold text-white opacity-20 tracking-wide">{title}</h3>
        </div>
        <div className="flex gap-4 sm:gap-6 overflow-x-hidden pb-6 pt-2 -mx-6 sm:-mx-10 px-6 sm:px-10">
          {[...Array(6)].map((_, i) => (
            <div key={`skeleton-${i}`} className={`shrink-0 bg-[#0B1020] animate-pulse ${cardStyle === 'trending' ? 'w-[160px] sm:w-[200px] aspect-[2/3] rounded-[20px]' : 'w-[280px] sm:w-[300px] lg:w-[320px] aspect-[16/10] rounded-[16px]'}`} />
          ))}
        </div>
      </section>
    );
  }

  if (data.length === 0) return null;

  return (
    <section className="relative px-6 sm:px-10 pb-0 pt-2 group/section">
      <div className="flex items-end justify-between mb-4">
        <div className="flex items-center gap-3">
           <h3 className="text-[24px] font-display font-bold text-white tracking-wide">{title}</h3>
           {badge && (
             <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${
               theme === 'anime' 
                 ? 'bg-[#FF3366]/20 text-[#FF3366] border-[#FF3366]/30' 
                 : 'bg-[#8F44FF]/20 text-[#A661FF] border-[#8F44FF]/30'
             }`}>
               {badge}
             </span>
           )}
        </div>
        {seeAllHref && (
           <Link href={seeAllHref} className={`text-[13px] font-bold transition-colors uppercase tracking-widest flex items-center gap-1 group ${
             theme === 'anime' ? 'text-[#FF3366] hover:text-[#FF6699]' : 'text-[#A661FF] hover:text-[#7B2EFF]'
           }`}>
              Ver Todos
              <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
           </Link>
        )}
      </div>
      
      <div className="relative border border-transparent">
        <button 
          onClick={scrollLeft}
          className={`absolute left-[-24px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center z-20 opacity-0 group-hover/section:opacity-100 transition-all duration-300 text-white hover:scale-110 shadow-[0_0_20px_rgba(0,0,0,0.5)] ${
            theme === 'anime' ? 'hover:bg-[#FF3366] hover:border-[#FF3366]' : 'hover:bg-[#8F44FF] hover:border-[#8F44FF]'
          }`}
        >
          <ChevronLeft className="size-6 ml-[-2px]" />
        </button>
        
        <button 
          onClick={scrollRight}
          className={`absolute right-[-24px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center z-20 opacity-0 group-hover/section:opacity-100 transition-all duration-300 text-white hover:scale-110 shadow-[0_0_20px_rgba(0,0,0,0.5)] ${
            theme === 'anime' ? 'hover:bg-[#FF3366] hover:border-[#FF3366]' : 'hover:bg-[#8F44FF] hover:border-[#8F44FF]'
          }`}
        >
          <ChevronRight className="size-6 mr-[-2px]" />
        </button>

        <div 
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 pt-2 scrollbar-hide snap-x -mx-6 sm:-mx-10 px-6 sm:px-10"
          style={{ scrollBehavior: 'smooth' }}
        >
          {data.map((item) => (
            <div key={item.id} className="snap-start shrink-0 cursor-pointer">
                {cardStyle === 'trending' ? (
                  <TrendingCard 
                    title={item.title} 
                    rank={item.rank} 
                    imageUrl={item.posterUrl || item.imageUrl} 
                    slug={item.slug} 
                    href={`/tmdb/${item.type}/${item.id}`}
                    theme={theme}
                  />
                ) : (
                  <MediaCard 
                    title={item.title}
                    subtitle={item.subtitle}
                    imageUrl={item.backdropUrl || item.imageUrl}
                    slug={item.slug}
                    href={`/tmdb/${item.type}/${item.id}`}
                    theme={theme}
                  />
                )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});
