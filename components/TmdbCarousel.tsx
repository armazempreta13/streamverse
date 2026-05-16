'use client';

import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TrendingCard, MediaCard } from './Cards';
import Link from 'next/link';
import { getTrending, getPopular, getAnime, formatTmdbToCard, getRecentReleases, getRecentAnime, getTopRated } from '@/lib/tmdb-service';

interface TmdbCarouselProps {
  title: string;
  endpoint: 'trending' | 'trending_movies' | 'trending_series' | 'popular' | 'anime' | 'popular_movies' | 'popular_series' | 'recent_movies' | 'recent_series' | 'recent_anime' | 'top_rated_movies' | 'top_rated_series';
  cardStyle?: 'trending' | 'media';
  seeAllHref?: string;
  badge?: string;
  theme?: 'default' | 'anime';
}

export function TmdbCarousel({ title, endpoint, cardStyle = 'media', seeAllHref, badge, theme = 'default' }: TmdbCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (hasLoaded) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        let results: any[] = [];
        if (endpoint === 'trending') results = await getTrending('all');
        else if (endpoint === 'trending_movies') results = await getTrending('movie');
        else if (endpoint === 'trending_series') results = await getTrending('tv');
        else if (endpoint === 'popular') results = await getPopular('movie');
        else if (endpoint === 'popular_movies') results = await getPopular('movie');
        else if (endpoint === 'popular_series') results = await getPopular('tv');
        else if (endpoint === 'anime') results = await getAnime();
        else if (endpoint === 'recent_movies') results = await getRecentReleases('movie');
        else if (endpoint === 'recent_series') results = await getRecentReleases('tv');
        else if (endpoint === 'recent_anime') results = await getRecentAnime();
        else if (endpoint === 'top_rated_movies') results = await getTopRated('movie');
        else if (endpoint === 'top_rated_series') results = await getTopRated('tv');

        if (results && results.length > 0) {
            const seenKey = `seen_ids_${window.location.pathname}`;
            if (!window[seenKey as any]) (window as any)[seenKey] = new Set();
            const seenIds = (window as any)[seenKey] as Set<string | number>;

            const uniqueResults = results.filter(r => !seenIds.has(r.id));
            const finalResults = uniqueResults.length >= 4 ? uniqueResults : results;

            const formatted = finalResults.slice(0, 20).map((item: any, index: number) => {
              const base = formatTmdbToCard(item);
              seenIds.add(item.id);
              return { ...base, rank: index + 1 };
            });
            setData(formatted);
        }
        setHasLoaded(true);
      } catch (error) {
        console.error("Error fetching TMDB contents: ", error);
        setHasLoaded(true);
      } finally {
        setLoading(false);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchData();
          observer.disconnect();
        }
      },
      { rootMargin: '400px' }
    );

    if (scrollRef.current) {
      observer.observe(scrollRef.current);
    }

    return () => observer.disconnect();
  }, [endpoint, hasLoaded]);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -800, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 800, behavior: 'smooth' });
    }
  };

  // Simplificando o gatilho de carregamento: O próprio Skeleton serve como ref para o Observer
  if (!hasLoaded) {
    return (
      <section ref={scrollRef} className="relative px-6 sm:px-10 pb-10 pt-6 min-h-[300px]">
        <h3 className="text-[20px] font-display font-bold mb-4 text-white opacity-50 tracking-wide">{title}</h3>
        <div className="flex gap-4 sm:gap-6 overflow-x-hidden pb-4 pt-2 -mx-6 sm:-mx-10 px-6 sm:px-10">
           {[...Array(4)].map((_, i) => (
             <div key={i} className={`shrink-0 bg-[#0B1020] animate-pulse rounded-[16px] ${cardStyle === 'trending' ? 'w-[150px] sm:w-[180px] aspect-[2/3]' : 'w-[280px] sm:w-[320px] aspect-[16/10]'}`} />
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
          {data.map((item) => {
            const href = `/tmdb/${item.type}/${item.id}`;
            return (
              <div key={item.id} className="snap-start shrink-0 cursor-pointer">
                  {cardStyle === 'trending' ? (
                    <TrendingCard 
                      title={item.title} 
                      rank={item.rank} 
                      imageUrl={item.posterUrl || item.imageUrl} 
                      slug={item.slug} 
                      href={href}
                      theme={theme}
                    />
                  ) : (
                    <MediaCard 
                      title={item.title}
                      subtitle={item.subtitle}
                      imageUrl={item.backdropUrl || item.imageUrl}
                      slug={item.slug}
                      href={href}
                      theme={theme}
                    />
                  )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
