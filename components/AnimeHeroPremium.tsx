'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Plus, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAnime, getDetails, fetchLogo } from '@/lib/tmdb-service';
import clsx from 'clsx';
import { siteConfig } from '@/config/site';

export function AnimeHeroPremium() {
  const [items, setItems] = useState<any[]>([]);
  const [logos, setLogos] = useState<Record<number, string>>({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [textVisible, setTextVisible] = useState(true);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        let animeTrending = await getAnime(1);
        const top5 = animeTrending.slice(0, 5);
        setItems(top5);

        // Fetch logos (Tenta TV primeiro, depois Movie se falhar)
        const logosMap: Record<number, string> = {};
        await Promise.all(top5.map(async (item: any) => {
          let logo = await fetchLogo(item.id, 'tv');
          if (!logo) logo = await fetchLogo(item.id, 'movie');
          if (logo) logosMap[item.id] = logo;
        }));
        setLogos(logosMap);
      } catch (error) {
        console.error('Error fetching anime hero:', error);
      }
    };
    fetchHero();
  }, []);

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      handleNext();
    }, 10000);
    return () => clearInterval(interval);
  }, [items.length, currentSlide]);

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTextVisible(false);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % items.length);
      setTextVisible(true);
      setIsTransitioning(false);
    }, 400);
  };

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTextVisible(false);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev === 0 ? items.length - 1 : prev - 1));
      setTextVisible(true);
      setIsTransitioning(false);
    }, 400);
  };

  if (items.length === 0) {
    return <div className="w-full h-[80vh] bg-[#050510] animate-pulse" />;
  }

  const content = items[currentSlide];
  const logoUrl = logos[content.id];

  const isCrunchyStyle = siteConfig.features.crunchyrollStyleLayout;

  return (
    <div className={`relative w-full overflow-hidden bg-[#050510] ${isCrunchyStyle ? 'pt-24 px-4 md:px-8 lg:px-12 pb-12' : 'h-[85vh] lg:h-[90vh]'}`}>
      <div className={isCrunchyStyle ? 'relative w-full max-w-[1600px] mx-auto h-[60vh] md:h-[70vh] rounded-[24px] shadow-2xl border border-white/5' : 'absolute inset-0'}>
        {/* Background Images with crossfade */}
        {items.map((item, idx) => (
          <div
            key={item.id}
            className={clsx(
              'absolute inset-0 transition-opacity duration-1000 ease-in-out',
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            )}
          >
            <div className="absolute inset-0 w-full h-full overflow-hidden rounded-[inherit]">
              <Image
                src={`https://image.tmdb.org/t/p/original${item.backdrop_path || item.poster_path}`}
                alt={item.name || item.title || ''}
                fill
                className="object-cover object-[center_20%] scale-105"
                priority={idx === 0}
              />
              {/* Ultra-Premium Overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#050510] via-[#050510]/80 to-transparent w-[80%] md:w-[60%]" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#050510] via-[#050510]/60 to-transparent" />
              <div className="absolute inset-0 mix-blend-screen opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FF3366]/20 via-transparent to-transparent" />
            </div>
          </div>
        ))}

        {/* Main Content Area */}
        <div className={`absolute inset-0 z-20 flex flex-col justify-center w-full ${isCrunchyStyle ? 'px-8 md:px-16' : 'max-w-[1600px] mx-auto px-6 md:px-10'}`}>
        <div className="max-w-3xl lg:max-w-4xl mt-20">
          {/* Badge */}
          <div className={clsx(
            'flex items-center gap-3 mb-6 transition-all duration-700 transform',
            textVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          )}>
            <div className="px-3 py-1 bg-[#FF3366]/10 border border-[#FF3366]/30 backdrop-blur-md rounded-sm">
              <span className="text-[#FF3366] text-[10px] font-bold tracking-[0.3em] uppercase drop-shadow-[0_0_8px_rgba(255,51,102,0.8)]">
                EM DESTAQUE
              </span>
            </div>
            <span className="h-[1px] w-16 bg-gradient-to-r from-[#FF3366]/50 to-transparent" />
          </div>

          {/* Title or Logo */}
          <div className={clsx(
            'mb-6 transition-all duration-700 delay-100 transform',
            textVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          )}>
            {logoUrl ? (
              <div className="relative w-[300px] sm:w-[400px] md:w-[500px] lg:w-[600px] h-[120px] sm:h-[150px] md:h-[200px]">
                <Image
                  src={logoUrl}
                  alt={content.name || content.title || 'Logo'}
                  fill
                  className="object-contain object-left drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]"
                  priority
                />
              </div>
            ) : (
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-tighter drop-shadow-2xl font-outfit uppercase leading-[0.9]">
                {content.name || content.title}
              </h1>
            )}
          </div>

          {/* Description */}
          <div className={clsx(
            'mb-10 transition-all duration-700 delay-200 transform',
            textVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          )}>
            <p className="text-[#A1A1AA] text-sm md:text-base lg:text-lg max-w-2xl leading-relaxed drop-shadow-lg line-clamp-3">
              {content.overview || "Prepare-se para entrar em um novo mundo. Acompanhe esta incrível jornada de ação e fantasia, disponível agora em altíssima qualidade."}
            </p>
          </div>

          {/* Actions */}
          <div className={clsx(
            'flex flex-wrap items-center gap-4 transition-all duration-700 delay-300 transform',
            textVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          )}>
            <Link href={`/tmdb/tv/${content.id}`}>
              <button className={`group relative flex items-center gap-3 px-8 py-4 rounded-lg font-bold overflow-hidden transition-all duration-300 hover:scale-105 ${
                isCrunchyStyle 
                  ? 'bg-gradient-to-r from-[#B838F5] to-[#FF3366] text-white shadow-[0_0_30px_rgba(255,51,102,0.4)]' 
                  : 'bg-white text-black hover:shadow-[0_0_30px_rgba(255,51,102,0.4)] ring-1 ring-transparent hover:ring-[#FF3366]/50'
              }`}>
                {!isCrunchyStyle && <div className="absolute inset-0 bg-gradient-to-r from-white via-[#ffeef2] to-white opacity-0 group-hover:opacity-100 transition-opacity" />}
                <Play className={`size-5 z-10 transition-colors ${isCrunchyStyle ? 'fill-white' : 'fill-black group-hover:fill-[#FF3366]'}`} />
                <span className={`relative z-10 tracking-wide text-sm transition-colors ${isCrunchyStyle ? 'text-white' : 'group-hover:text-[#FF3366]'}`}>Assistir Agora</span>
              </button>
            </Link>

            <button className={`group flex items-center gap-2 px-6 py-4 rounded-lg font-medium backdrop-blur-md transition-all duration-300 ${
              isCrunchyStyle 
                ? 'bg-black/40 hover:bg-black/60 border border-white/20 text-white hover:border-[#FF3366]/50' 
                : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white hover:border-[#FF3366]/30'
            }`}>
              <Plus className={`size-5 group-hover:rotate-90 transition-transform duration-300 ${isCrunchyStyle ? 'text-white' : 'text-[#FF3366]'}`} />
              <span className="text-sm tracking-wide">Minha Lista</span>
            </button>

            <Link href={`/tmdb/tv/${content.id}`}>
              <button className="flex items-center justify-center size-[54px] rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all duration-300 hover:border-[#FF3366]/30 group">
                <Info className="size-5 text-white/70 group-hover:text-white transition-colors" />
              </button>
            </Link>
          </div>
        </div>
      </div>
      </div>

      {/* Hero Controls (Bottom Right) */}
      <div className={`absolute z-30 flex items-center gap-6 ${isCrunchyStyle ? 'bottom-6 right-6 md:right-10' : 'bottom-10 right-6 md:right-10'}`}>
        <div className="hidden md:flex items-center gap-3">
          {items.map((_, idx) => (
            <div 
              key={idx}
              className={clsx(
                "h-1 rounded-full transition-all duration-500 cursor-pointer",
                idx === currentSlide ? "w-10 bg-[#FF3366] shadow-[0_0_10px_#FF3366]" : "w-2 bg-white/20 hover:bg-white/50"
              )}
              onClick={() => {
                setIsTransitioning(true);
                setTextVisible(false);
                setTimeout(() => {
                  setCurrentSlide(idx);
                  setTextVisible(true);
                  setIsTransitioning(false);
                }, 400);
              }}
            />
          ))}
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={handlePrev}
            className="flex items-center justify-center size-10 rounded-full border border-white/10 bg-black/20 backdrop-blur-sm text-white hover:bg-white hover:text-black transition-all"
          >
            <ChevronLeft className="size-5 ml-[-2px]" />
          </button>
          <button 
            onClick={handleNext}
            className="flex items-center justify-center size-10 rounded-full border border-white/10 bg-black/20 backdrop-blur-sm text-white hover:bg-white hover:text-black transition-all"
          >
            <ChevronRight className="size-5 mr-[-2px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
