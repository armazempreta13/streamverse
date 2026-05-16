'use client';

import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TrendingCard, MediaCard } from './Cards';
import Link from 'next/link';
import { getTrending, getPopular, getAnime, formatTmdbToCard, getRecentReleases, getRecentAnime, getTopRated, getTopAnime, getUpcoming, getByGenre, getAnimeByGenre } from '@/lib/tmdb-service';
// TMDB genre IDs
const GENRE = { action: 28, horror: 27, comedy: 35, scifi: 878, thriller: 53, romance: 10749, drama: 18, animation: 16 };

interface TmdbCarouselProps {
  title: string;
  endpoint: 'trending' | 'trending_movies' | 'trending_series' | 'popular' | 'anime' | 'popular_movies' | 'popular_series' | 'recent_movies' | 'recent_series' | 'recent_anime' | 'top_rated_movies' | 'top_rated_series' | 'top_anime' | 'upcoming_movies' | 'action_movies' | 'horror_movies' | 'scifi_movies' | 'comedy_movies' | 'action_series' | 'drama_series' | 'thriller_series' | 'action_anime' | 'comedy_anime' | 'fantasy_anime' | 'romance_anime' | 'popular_anime';
  cardStyle?: 'trending' | 'media';
  seeAllHref?: string;
  badge?: string;
  theme?: 'default' | 'anime';
}

const carouselCache = new Map<string, any[]>();

export const TmdbCarousel = React.memo(function TmdbCarousel({ title, endpoint, cardStyle = 'media', seeAllHref, badge, theme = 'default' }: TmdbCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<any[]>(() => carouselCache.get(endpoint) || []);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(() => carouselCache.has(endpoint));

  useEffect(() => {
    if (hasLoaded) return;

    const fetchData = async () => {
      try {
        if (carouselCache.has(endpoint)) {
           setData(carouselCache.get(endpoint)!);
           setHasLoaded(true);
           return;
        }

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
        else if (endpoint === 'top_anime') results = await getTopAnime();
        else if (endpoint === 'upcoming_movies') results = await getUpcoming();
        else if (endpoint === 'action_movies') results = await getByGenre('movie', GENRE.action);
        else if (endpoint === 'horror_movies') results = await getByGenre('movie', GENRE.horror);
        else if (endpoint === 'scifi_movies') results = await getByGenre('movie', GENRE.scifi);
        else if (endpoint === 'comedy_movies') results = await getByGenre('movie', GENRE.comedy);
        else if (endpoint === 'action_series') results = await getByGenre('tv', GENRE.action);
        else if (endpoint === 'drama_series') results = await getByGenre('tv', GENRE.drama);
        else if (endpoint === 'thriller_series') results = await getByGenre('tv', GENRE.thriller);
        else if (endpoint === 'action_anime') results = await getAnimeByGenre(10759); // Action & Adventure
        else if (endpoint === 'comedy_anime') results = await getAnimeByGenre(35); // Comedy
        else if (endpoint === 'fantasy_anime') results = await getAnimeByGenre(10765); // Sci-Fi & Fantasy
        else if (endpoint === 'romance_anime') results = await getAnimeByGenre(10749); // Romance
        else if (endpoint === 'popular_anime') results = await getAnime(); // getAnime by default uses popularity.desc

        if (results && results.length > 0) {
            // Remove duplicates within the same carousel just in case
            const uniqueMap = new Map();
            results.forEach(item => {
              if (!uniqueMap.has(item.id)) {
                uniqueMap.set(item.id, item);
              }
            });
            const uniqueResults = Array.from(uniqueMap.values());

            const formatted = uniqueResults.slice(0, 20).map((item: any, index: number) => {
              const base = formatTmdbToCard(item);
              return { ...base, rank: index + 1 };
            });
            setData(formatted);
            carouselCache.set(endpoint, formatted);
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
      <section ref={scrollRef} className="relative px-6 sm:px-10 pb-0 pt-2 min-h-[300px]">
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
