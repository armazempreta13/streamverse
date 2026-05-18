import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { Play, Star, ChevronLeft, ChevronRight, Heart } from 'lucide-react';

interface KidsItem {
  id: string | number;
  title: string;
  posterUrl: string;
  backdropUrl: string;
  type: 'movie' | 'tv';
  score?: string;
  overview?: string;
  year?: string;
}

interface KidsCarouselProps {
  title: string;
  icon: React.ReactNode;
  colorTheme: 'sky' | 'indigo' | 'purple' | 'pink' | 'emerald';
  items: KidsItem[];
  onPlay: (item: KidsItem) => void;
  favoriteIds?: (string | number)[];
  onToggleFavorite?: (id: string | number, type: 'movie' | 'tv', e: React.MouseEvent) => void;
  category?: 'movie' | 'tv';
  rating?: 'G' | 'PG';
}

export function KidsCarousel({ 
  title, 
  icon, 
  colorTheme, 
  items, 
  onPlay,
  favoriteIds = [],
  onToggleFavorite,
  category,
  rating = 'G'
}: KidsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Localized state to manage the expanded infinite list
  const [localItems, setLocalItems] = useState<KidsItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Synchronize internal state when baseline parent items change
  useEffect(() => {
    setLocalItems(items);
    setCurrentPage(1);
    setHasMore(true);
  }, [items]);

  if (items.length === 0) return null;

  const themeMap: Record<string, { bar: string, cardBorder: string, playBg: string, titleHover: string, star: string, arrowBg: string, arrowHover: string, baseBorder: string }> = {
    sky: {
      bar: 'bg-sky-400 shadow-[0_0_8px_#38bdf8]',
      cardBorder: 'hover:border-[#00CDFF] hover:shadow-[0_12px_24px_rgba(0,205,255,0.2)]',
      playBg: 'bg-gradient-to-r from-[#6BE6FF] to-[#00CDFF] shadow-sky-500/30',
      titleHover: 'group-hover:text-[#00CDFF]',
      star: 'text-[#00CDFF] fill-[#00CDFF]',
      arrowBg: 'bg-[#0F0A28]/90 border border-sky-500/30 text-sky-400 shadow-sky-500/10',
      arrowHover: 'hover:bg-sky-500 hover:text-white hover:border-sky-400 hover:scale-105 active:scale-95',
      baseBorder: 'border-white/5'
    },
    indigo: {
      bar: 'bg-indigo-400 shadow-[0_0_8px_#818CF8]',
      cardBorder: 'hover:border-indigo-400 hover:shadow-[0_12px_24px_rgba(129,140,248,0.2)]',
      playBg: 'bg-gradient-to-r from-indigo-400 to-indigo-600 shadow-indigo-500/30',
      titleHover: 'group-hover:text-indigo-400',
      star: 'text-indigo-400 fill-indigo-400',
      arrowBg: 'bg-[#0F0A28]/90 border border-indigo-500/30 text-indigo-400 shadow-indigo-500/10',
      arrowHover: 'hover:bg-indigo-500 hover:text-white hover:border-indigo-400 hover:scale-105 active:scale-95',
      baseBorder: 'border-white/5'
    },
    purple: {
      bar: 'bg-[#B47FFF] shadow-[0_0_8px_#822BFF]',
      cardBorder: 'hover:border-[#822BFF] hover:shadow-[0_12px_24px_rgba(130,43,255,0.2)]',
      playBg: 'bg-gradient-to-r from-[#B47FFF] to-[#822BFF] shadow-purple-500/30',
      titleHover: 'group-hover:text-[#B47FFF]',
      star: 'text-[#B47FFF] fill-[#B47FFF]',
      arrowBg: 'bg-[#0F0A28]/90 border border-purple-500/30 text-purple-400 shadow-purple-500/10',
      arrowHover: 'hover:bg-purple-500 hover:text-white hover:border-purple-400 hover:scale-105 active:scale-95',
      baseBorder: 'border-white/5'
    },
    pink: {
      bar: 'bg-[#FF75A9] shadow-[0_0_8px_#FF1F6D]',
      cardBorder: 'hover:border-[#FF1F6D] hover:shadow-[0_12px_24px_rgba(255,31,109,0.2)]',
      playBg: 'bg-gradient-to-r from-[#FF75A9] to-[#FF1F6D] shadow-pink-500/30',
      titleHover: 'group-hover:text-[#FF75A9]',
      star: 'text-[#FF75A9] fill-[#FF75A9]',
      arrowBg: 'bg-[#0F0A28]/90 border border-pink-500/30 text-pink-400 shadow-pink-500/10',
      arrowHover: 'hover:bg-pink-500 hover:text-white hover:border-pink-400 hover:scale-105 active:scale-95',
      baseBorder: 'border-white/5'
    },
    emerald: {
      bar: 'bg-[#61F2C2] shadow-[0_0_8px_#00DF93]',
      cardBorder: 'hover:border-[#00DF93] hover:shadow-[0_12px_24px_rgba(0,223,147,0.2)]',
      playBg: 'bg-gradient-to-r from-[#61F2C2] to-[#00DF93] shadow-emerald-500/30',
      titleHover: 'group-hover:text-[#61F2C2]',
      star: 'text-[#61F2C2] fill-[#61F2C2]',
      arrowBg: 'bg-[#0F0A28]/90 border border-emerald-500/30 text-emerald-400 shadow-emerald-500/10',
      arrowHover: 'hover:bg-emerald-500 hover:text-white hover:border-emerald-400 hover:scale-105 active:scale-95',
      baseBorder: 'border-white/5'
    }
  };

  const themeClasses = themeMap[colorTheme] || themeMap.sky;

  const fetchNextPage = async () => {
    if (loadingMore || !hasMore || !category) return;
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    try {
      const res = await fetch(`/api/catalog?type=kids&category=${category}&rating=${rating}&page=${nextPage}`);
      if (res.ok) {
        const data = await res.json();
        const rawResults = data.results || [];
        if (rawResults.length === 0) {
          setHasMore(false);
        } else {
          const newItems: KidsItem[] = rawResults.map((item: any) => ({
            id: item.id,
            title: item.title || item.name,
            posterUrl: item.posterPath ? `https://image.tmdb.org/t/p/w500${item.posterPath}` : '',
            backdropUrl: item.backdropPath ? `https://image.tmdb.org/t/p/original${item.backdropPath}` : '',
            type: category,
            score: item.voteAverage ? item.voteAverage.toFixed(1) : '8.5',
            overview: item.overview,
            year: item.releaseDate ? item.releaseDate.split('-')[0] : (item.firstAirDate ? item.firstAirDate.split('-')[0] : '')
          }));

          setLocalItems((prev) => {
            const existingIds = new Set(prev.map(i => i.id));
            const filteredNew = newItems.filter(i => !existingIds.has(i.id));
            return [...prev, ...filteredNew];
          });
          setCurrentPage(nextPage);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load next kids page', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleScroll = async (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const el = scrollRef.current;
      const scrollAmount = direction === 'left' ? -600 : 600;
      let newScrollLeft = el.scrollLeft + scrollAmount;

      // Infinite wrapping check for left direction
      if (direction === 'left' && el.scrollLeft <= 10) {
        el.scrollTo({ left: el.scrollWidth, behavior: 'auto' });
        newScrollLeft = el.scrollWidth - 600;
      }

      // Check if we need to fetch more items before scrolling right
      if (direction === 'right' && category && hasMore && !loadingMore) {
        const threshold = el.scrollWidth - el.clientWidth - 1200;
        if (el.scrollLeft >= threshold) {
          await fetchNextPage();
        }
      }

      el.scrollTo({ left: newScrollLeft, behavior: 'smooth' });

      // Infinite wrapping check for right direction
      setTimeout(() => {
        if (direction === 'right' && el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
          el.scrollTo({ left: 0, behavior: 'smooth' });
        }
      }, 500);
    }
  };

  return (
    <div className="relative group/carousel">
      {/* Dynamic inline styles to hide scrollbar */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <h3 className="text-lg md:text-2xl font-black text-white tracking-tight uppercase flex items-center gap-2.5 mb-6 select-none" style={{ fontFamily: "'Nunito', sans-serif" }}>
        {icon}
        {title}
      </h3>

      {/* Outer row wrapper with controls */}
      <div className="relative -mx-6 md:-mx-12 lg:-mx-16">
        {/* Left Big Arrow */}
        <button 
          onClick={() => handleScroll('left')}
          className={`absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 shadow-lg opacity-0 group-hover/carousel:opacity-100 ${themeClasses.arrowBg} ${themeClasses.arrowHover}`}
          aria-label="Voltar"
        >
          <ChevronLeft className="size-6 md:size-8 stroke-[3px]" />
        </button>

        {/* Horizontal Slider Area - Snapping removed to eliminate programmatic scroll fights/jitter */}
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto gap-7 pb-6 pt-2 no-scrollbar scroll-smooth px-6 md:px-12 lg:px-16"
        >
          {localItems.map((item) => {
            const isFav = favoriteIds.includes(item.id);
            return (
              <div 
                key={item.id}
                onClick={() => onPlay(item)}
                className={`shrink-0 w-[145px] sm:w-[175px] md:w-[195px] lg:w-[215px] group relative cursor-pointer overflow-hidden rounded-[24px] border bg-[#0F0A28]/95 p-2 transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-2 hover:scale-[1.02] active:scale-95 shadow-lg will-change-transform ${themeClasses.baseBorder} ${themeClasses.cardBorder}`}
              >
                <div className="relative aspect-[2/3] w-full rounded-[18px] overflow-hidden bg-slate-900 select-none shadow-inner border border-white/5">
                  {item.posterUrl ? (
                    <Image
                      src={item.posterUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 will-change-transform"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 bg-indigo-955/45 flex flex-col items-center justify-center text-center p-3">
                      <Star className="size-8 text-indigo-400/20 mb-1" />
                      <span className="text-[9px] text-indigo-300/30 font-black uppercase">Sem Imagem</span>
                    </div>
                  )}
                  
                  {/* Absolute favorite heart toggler */}
                  {onToggleFavorite && (
                    <button
                      onClick={(e) => onToggleFavorite(item.id, item.type, e)}
                      className="absolute bottom-3 right-3 p-2 rounded-xl bg-[#0F0A28]/85 border border-white/10 hover:border-pink-500/30 text-white hover:text-pink-500 transition-all z-20 pointer-events-auto hover:scale-110 active:scale-90 shadow-md"
                    >
                      <Heart className={`size-4 transition-all ${isFav ? 'fill-pink-500 text-pink-500 scale-110' : 'text-indigo-200'}`} />
                    </button>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E062F]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className={`w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg transform scale-50 group-hover:scale-100 transition-all duration-300 border border-white/10 ${themeClasses.playBg}`}>
                      <Play className="size-5 fill-white ml-0.5" />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 px-2 pb-1 text-center md:text-left select-none">
                  <h4 className={`text-white text-sm font-black tracking-tight leading-snug truncate transition-colors ${themeClasses.titleHover}`} style={{ fontFamily: "'Nunito', sans-serif" }}>
                    {item.title}
                  </h4>
                  <div className="flex items-center justify-center md:justify-start gap-1.5 mt-1.5 text-[10px] text-indigo-200/80 font-bold uppercase">
                    <span>{item.year}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    <span className={`flex items-center gap-0.5 ${themeClasses.star}`}>
                      <Star className={`size-3 ${themeClasses.star}`} />
                      {item.score || '9.0'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* 🌀 Glowing Orbital Spinner Card at the end of scroll during background fetch */}
          {loadingMore && (
            <div className={`shrink-0 w-[145px] sm:w-[175px] md:w-[195px] lg:w-[215px] rounded-[24px] border border-white/5 bg-[#0F0A28]/40 p-2 flex flex-col items-center justify-center min-h-[220px] sm:min-h-[260px] md:min-h-[300px] animate-pulse`}>
              <div className="relative aspect-[2/3] w-full rounded-[18px] bg-indigo-950/20 flex flex-col items-center justify-center gap-3">
                <div className={`w-9 h-9 border-4 border-indigo-500/20 rounded-full animate-spin ${
                  colorTheme === 'pink' ? 'border-t-pink-500' : 'border-t-yellow-400'
                }`}></div>
                <span className="text-[9px] text-indigo-300/40 font-black uppercase tracking-wider text-center px-3" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  Buscando mais magia...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Big Arrow */}
        <button 
          onClick={() => handleScroll('right')}
          className={`absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 shadow-lg opacity-0 group-hover/carousel:opacity-100 ${themeClasses.arrowBg} ${themeClasses.arrowHover}`}
          aria-label="Avançar"
        >
          <ChevronRight className="size-6 md:size-8 stroke-[3px]" />
        </button>
      </div>
    </div>
  );
}
