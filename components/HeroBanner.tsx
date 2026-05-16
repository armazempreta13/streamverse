'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Play, Info, ChevronRight, Plus, Star, Calendar } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';
import { siteConfig } from '@/config/site';
import { getTrending, getAnime, formatTmdbToCard, fetchFromTmdb, getTmdbImage, getDetails, searchTmdb } from '@/lib/tmdb-service';

// Keyframes injetados uma vez no DOM
const BREATH_STYLE = `
@keyframes barBreath {
  0%   { transform: scaleX(0.55); opacity: 0.5; }
  50%  { transform: scaleX(1);    opacity: 1;   }
  100% { transform: scaleX(0.55); opacity: 0.5; }
}
@keyframes glowPulse {
  0%   { box-shadow: 0 0 6px 1px rgba(166,97,255,0.4);  }
  50%  { box-shadow: 0 0 18px 4px rgba(166,97,255,0.85); }
  100% { box-shadow: 0 0 6px 1px rgba(166,97,255,0.4);  }
}
@keyframes shadowAura {
  0% { transform: scale(1) translateY(0); filter: blur(100px) brightness(1); }
  50% { transform: scale(1.15) translateY(-20px); filter: blur(120px) brightness(1.3); }
  100% { transform: scale(1) translateY(0); filter: blur(100px) brightness(1); }
}
`;

export function HeroBanner({ category }: { category?: 'anime' | 'movie' | 'series' } = {}) {
  const [heroContents, setHeroContents] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [prevSlide, setPrevSlide] = useState<number | null>(null);
  const [textVisible, setTextVisible] = useState(true);

  // Helper para decidir a fonte cinematográfica de cada conteúdo
  const getDynamicTypography = (content: any) => {
    if (!siteConfig.features.dynamicHeroTypography) {
      return 'font-montserrat font-black tracking-tighter text-[46px] sm:text-[60px] md:text-[76px] lg:text-[92px] leading-[0.92] uppercase';
    }

    // Usamos um simples algoritmo de hash baseado no título para que a fonte de um filme específico seja sempre a mesma
    const str = String(content.title || content.id || 'default');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % 4;

    switch (index) {
      case 0:
        // Agressiva, Industrial, Impactante (Ex: The Boys, Ação)
        return 'font-bebas tracking-wide text-[54px] sm:text-[76px] md:text-[96px] lg:text-[130px] leading-[0.85] uppercase scale-y-110 origin-bottom';
      case 1:
        // Elegante, Medieval, Drama (Ex: House of the Dragon)
        return 'font-cinzel font-bold tracking-tight text-[40px] sm:text-[52px] md:text-[68px] lg:text-[84px] leading-[0.95] uppercase drop-shadow-2xl';
      case 2:
        // Moderna, Sci-fi, Anime Premium (Ex: Solo Leveling)
        return 'font-outfit font-black tracking-tight text-[44px] sm:text-[60px] md:text-[76px] lg:text-[94px] leading-[0.95] uppercase';
      case 3:
      default:
        // Blockbuster Clássico, Padrão Robusto (Ex: Vingadores)
        return 'font-montserrat font-black tracking-tighter text-[46px] sm:text-[60px] md:text-[76px] lg:text-[92px] leading-[0.92] uppercase';
    }
  };

  useEffect(() => {
    const fetchHero = async () => {
      try {
        let top5Items: any[] = [];

        if (category === 'anime') {
          let animeTrending = await getAnime(1);
          top5Items = animeTrending.slice(0, 5);
        } else if (category === 'movie') {
          let trending = await getTrending('movie');
          top5Items = trending.slice(0, 5);
        } else if (category === 'series') {
          let trending = await getTrending('tv');
          top5Items = trending.slice(0, 5);
        } else {
          // 1. Tentar carregar os títulos personalizados da config
          if (siteConfig.hero?.customTitles && siteConfig.hero.customTitles.length > 0) {
            const results = await Promise.all(siteConfig.hero.customTitles.map(async (title) => {
               try {
                 const searchRes = await searchTmdb(title);
                 if (searchRes && searchRes.length > 0) {
                   // Prioriza resultados que tenham backdrop_path
                   return searchRes.find((r:any) => r.backdrop_path) || searchRes[0];
                 }
               } catch(e) {}
               return null;
            }));
            top5Items = results.filter(Boolean);
          }
        }

        // 2. Preencher com Em Alta caso a config tenha menos de 5 filmes
        if (top5Items.length < 5) {
          let trending;
          if (category === 'anime') trending = await getAnime(2);
          else if (category === 'movie') trending = await getTrending('movie');
          else if (category === 'series') trending = await getTrending('tv');
          else trending = await getTrending('all');

          const existingIds = top5Items.map(t => t.id);
          const needed = 5 - top5Items.length;
          const extra = trending.filter((t:any) => !existingIds.includes(t.id)).slice(0, needed);
          top5Items = [...top5Items, ...extra];
        }

        const top5 = top5Items.slice(0, 5).map((item: any) => {
            const base = formatTmdbToCard(item);
            return {
              ...base,
              heroImage: base.backdropUrl || base.imageUrl,
              year: base.date ? base.date.substring(0, 4) : '2024',
              description: base.overview || 'Acompanhe esta super produção em alta no momento.',
            };
        });

        // 3. Buscar Logos ANTES de renderizar para evitar a "piscada" (Flash of Unstyled Text)
        const withLogos = await Promise.all(top5.map(async (item: any) => {
          try {
            const images = await fetchFromTmdb(`/${item.type}/${item.id}/images`, { include_image_language: 'en,pt,null' });
            if (images && images.logos && images.logos.length > 0) {
              const bestLogo = images.logos.find((l:any) => l.iso_639_1 === 'pt') 
                            || images.logos.find((l:any) => l.iso_639_1 === 'en')
                            || images.logos[0];
              return { ...item, logoUrl: getTmdbImage(bestLogo.file_path, 'w500') };
            }
          } catch (e) {}
          return item;
        }));
        
        setHeroContents(withLogos);
      } catch (e) {
        console.error(e);
      }
    };
    fetchHero();
  }, []);

  const nextSlide = useCallback(() => {
    setHeroContents((prev) => {
      if (!prev.length) return prev;
      // fade out → troca → fade in
      setTextVisible(false);
      setTimeout(() => {
        setCurrentSlide((curr) => {
          setPrevSlide(curr);
          return curr === prev.length - 1 ? 0 : curr + 1;
        });
        setTimeout(() => setTextVisible(true), 80);
      }, 320);
      return prev;
    });
  }, []);

  useEffect(() => {
    if (!isHovered && heroContents.length > 1) {
      const timer = setInterval(nextSlide, 8000);
      return () => clearInterval(timer);
    }
  }, [isHovered, heroContents.length, nextSlide]);

  if (heroContents.length === 0) {
    return (
      <section className="relative w-full h-[80vh] min-h-[600px] lg:h-[90vh] bg-[#050510] overflow-hidden">
        {/* Skeleton shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-[shimmer_2s_infinite]" />
        <div className="absolute bottom-24 left-32 flex flex-col gap-4">
          <div className="w-20 h-5 rounded bg-white/5 animate-pulse" />
          <div className="w-80 h-16 rounded bg-white/5 animate-pulse" />
          <div className="w-56 h-4 rounded bg-white/5 animate-pulse" />
          <div className="w-96 h-4 rounded bg-white/5 animate-pulse" />
          <div className="w-72 h-4 rounded bg-white/5 animate-pulse" />
          <div className="flex gap-4 mt-4">
            <div className="w-40 h-12 rounded-lg bg-white/5 animate-pulse" />
            <div className="w-36 h-12 rounded-lg bg-white/5 animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  const currentContent = heroContents[currentSlide];

  return (
    <section
      className="relative w-full h-[80vh] min-h-[600px] lg:h-[90vh] bg-transparent overflow-hidden group/carousel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <style>{BREATH_STYLE}</style>

      {/* ── Vignette edges ── */}
      <div className="absolute inset-0 z-[6] pointer-events-none"
        style={{ boxShadow: 'inset 0 0 120px 40px rgba(5,5,16,0.9)' }}
      />

      {/* ── Slides ── */}
      {heroContents.map((content, idx) => (
        <div
          key={content.id}
          className={clsx(
            'absolute inset-0 transition-all duration-[1200ms] ease-in-out',
            idx === currentSlide
              ? 'opacity-100 z-10 pointer-events-auto'
              : 'opacity-0 z-0 pointer-events-none'
          )}
        >
          {/* Background image with subtle Ken Burns */}
          <div
            className={clsx(
              'absolute inset-0 transition-transform duration-[22000ms] ease-out will-change-transform',
              idx === currentSlide ? 'scale-[1.04]' : 'scale-100'
            )}
          >
            <Image
              src={content.heroImage}
              alt={content.title}
              fill
              quality={80}
              sizes="100vw"
              loading={idx === 0 ? "eager" : "lazy"}
              className="object-cover object-[72%_top] will-change-transform"
              referrerPolicy="no-referrer"
              priority={idx === 0}
            />
          </div>

          {/* AURA EXCLUSIVA DO SOLO LEVELING (Arise - Shadow Monarch) */}
          {Number(content.id) === 120911 && (
            <>
              {/* Trevas profundas invadindo a tela (Multiply) */}
              <div className="absolute inset-0 z-[8] pointer-events-none mix-blend-multiply opacity-80 transition-opacity duration-1000"
                style={{
                  background: 'radial-gradient(circle at 70% 30%, transparent 10%, #030008 80%)'
                }}
              />
              
              {/* Energia sombria e roxa emanando (Screen / Color Dodge) */}
              <div className="absolute inset-0 z-[8] pointer-events-none mix-blend-screen opacity-90 transition-opacity duration-1000">
                {/* Nuvem primária massiva de poder nas costas do Jinwoo */}
                <div 
                  className="absolute top-[-10%] right-[0%] w-[60%] h-[80%] rounded-full bg-gradient-to-tr from-[#5B1FCC] to-[#8F44FF] animate-[shadowAura_6s_ease-in-out_infinite]"
                  style={{ animationDelay: '0s' }}
                />
                {/* Fumaça negra/roxa inferior subindo */}
                <div 
                  className="absolute bottom-[-10%] left-[20%] w-[50%] h-[60%] rounded-full bg-[#A661FF] mix-blend-color-dodge animate-[shadowAura_8s_ease-in-out_infinite_reverse]"
                  style={{ animationDelay: '2s' }}
                />
              </div>

              {/* Textura extra de poeira estática misturada na magia */}
              <div className="absolute inset-0 z-[8] pointer-events-none mix-blend-overlay opacity-30"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
              />
            </>
          )}

          {/* Ambient purple glow right (Padrão para outros) */}
          {Number(content.id) !== 120911 && (
            <div className="absolute right-[-5%] top-[15%] w-[55%] h-[70%] rounded-full pointer-events-none z-[8]"
              style={{
                background: 'radial-gradient(ellipse, rgba(123,46,255,0.22) 0%, transparent 70%)',
                filter: 'blur(60px)',
                mixBlendMode: 'screen',
              }}
            />
          )}

          {/* Left dark gradient — text legibility */}
          <div className="absolute inset-0 z-[9]"
            style={{
              background: 'linear-gradient(105deg, rgba(5,5,16,0.98) 0%, rgba(5,5,16,0.88) 38%, rgba(5,5,16,0.45) 58%, transparent 72%)',
            }}
          />


          {/* Dissolve inferior — funde o banner com o fundo da página */}
          <div
            className="absolute inset-x-0 z-[9] pointer-events-none"
            style={{
              top: '40%',
              bottom: '-4px',
              background: 'linear-gradient(to bottom, transparent 0%, rgba(5,5,16,0.3) 20%, rgba(5,5,16,0.7) 45%, rgba(5,5,16,0.92) 68%, #050510 85%, #050510 100%)',
            }}
          />

          {/* ── Content ── */}
          <div className="relative z-20 h-full flex flex-col justify-end pb-28 pl-16 sm:pl-28 md:pl-32 lg:pl-36 pr-6 max-w-[900px]">

            {/* Badge */}
            <div className={clsx(
              'transition-all duration-500 transform',
              idx === currentSlide && textVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            )}>
              <span className="inline-flex items-center gap-2 border border-[#7B2EFF]/40 bg-[#7B2EFF]/15 backdrop-blur-md text-[#BF8BFF] text-[10px] uppercase font-bold tracking-[0.25em] px-4 py-1.5 rounded-[4px] mb-5"
                style={{ boxShadow: '0 0 20px rgba(123,46,255,0.2), inset 0 0 20px rgba(123,46,255,0.05)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#A661FF] animate-pulse" />
                Lançamento
              </span>
            </div>

            {/* Title or Logo */}
            {content.logoUrl ? (
              <div 
                className={clsx(
                  'mb-4 lg:mb-8 transition-all duration-700 delay-75 transform origin-left',
                  idx === currentSlide && textVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'
                )}
              >
                <div className="relative w-[280px] sm:w-[400px] md:w-[500px] lg:w-[600px] h-[100px] sm:h-[140px] md:h-[180px] lg:h-[220px]">
                  <Image 
                    src={content.logoUrl} 
                    alt={content.title} 
                    fill 
                    className={clsx(
                      "object-contain object-left-bottom drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]",
                      content.title?.toLowerCase().includes('como mágica') && "invert brightness-200 contrast-125"
                    )}
                    priority
                  />
                </div>
              </div>
            ) : (
              <h1
                className={clsx(
                  getDynamicTypography(content),
                  'mb-4 lg:mb-6 text-white transition-all duration-500 delay-75 transform',
                  idx === currentSlide && textVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                )}
                style={{ textShadow: '0 0 80px rgba(143,68,255,0.25), 0 8px 40px rgba(0,0,0,0.9)' }}
              >
                {content.title}
              </h1>
            )}

            {/* Subtitle row */}
            <div className={clsx(
              'flex items-center gap-3 mb-6 transition-all duration-500 delay-100 transform',
              idx === currentSlide && textVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            )}>
              {/* Badges/Tags */}
              <div className="flex items-center gap-3 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase mt-2 mb-4">
                {category === 'anime' ? (
                  <span className="text-[#FF3366] drop-shadow-[0_0_8px_rgba(255,51,102,0.8)]">EM DESTAQUE</span>
                ) : (
                  <>
                    <span className="text-[#8F44FF]">Em Alta</span>
                    <span className="w-1 h-1 rounded-full bg-white/30" />
                    <span className="text-[#8F44FF]">Novo Episódio</span>
                  </>
                )}
              </div>
              {/* Thin decorative line */}
              <span className="hidden md:block flex-1 max-w-[120px] h-px bg-gradient-to-r from-[#A661FF]/40 to-transparent ml-2" />
            </div>

            {/* Description */}
            <p className={clsx(
              'max-w-[480px] lg:max-w-[560px] text-[#8E97A8] text-[15px] lg:text-[17px] leading-[1.75] mb-10 line-clamp-3 font-normal transition-all duration-500 delay-150 transform',
              idx === currentSlide && textVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            )}>
              {content.description}
            </p>

            {/* Buttons */}
            <div className={clsx(
              'flex flex-wrap items-center gap-4 transition-all duration-500 delay-200 transform',
              idx === currentSlide && textVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            )}>
              <Link
                href={`/tmdb/${content.type}/${content.id}`}
                className="group/play relative flex items-center gap-3 text-white px-8 lg:px-10 py-3.5 lg:py-4 rounded-[8px] font-semibold text-[15px] transition-all duration-300 hover:scale-[1.03] active:scale-95 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #9F55FF 0%, #7B2EFF 60%, #5B1FCC 100%)',
                  boxShadow: '0 8px 32px rgba(123,46,255,0.5), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
                }}
              >
                {/* Shimmer on hover */}
                <span className="absolute inset-0 translate-x-[-100%] group-hover/play:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <Play className="size-5 fill-white shrink-0" />
                <span>Assistir agora</span>
              </Link>

              <button
                className="flex items-center gap-3 text-white/90 px-7 lg:px-8 py-3.5 lg:py-4 rounded-[8px] font-semibold text-[15px] transition-all duration-300 hover:scale-[1.03] active:scale-95 backdrop-blur-md"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
                }}
              >
                <Plus className="size-5 text-white/60 shrink-0" />
                <span>Minha Lista</span>
              </button>

              <Link
                href={`/tmdb/${content.type}/${content.id}`}
                className="group/info flex items-center justify-center w-[52px] h-[52px] lg:w-[54px] lg:h-[54px] rounded-full transition-all duration-300 hover:scale-[1.08] active:scale-95 backdrop-blur-md"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}
              >
                <Info className="size-5 text-white/50 group-hover/info:text-white transition-colors duration-200" />
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* ── Metadata panel — conditionally visible ── */}
      {siteConfig.features.heroGlow && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 transition-all duration-300">
          <div
            className="flex items-center gap-6 px-8 py-3.5 rounded-full"
            style={{
              background: 'linear-gradient(180deg, rgba(20,15,35,0.4) 0%, rgba(10,5,20,0.8) 100%)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(166,97,255,0.15)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 20px 40px rgba(0,0,0,0.6)',
            }}
          >
            {/* IMDb */}
            <div className="flex items-center gap-3">
              <Star className="size-5 text-[#A661FF] fill-[#A661FF] shrink-0" />
              <div className="flex flex-col">
                <p className="text-white font-bold text-[15px] leading-none">
                  {heroContents[currentSlide]?.score || '9.2'}
                </p>
                <p className="text-[#8E97A8] text-[9px] uppercase tracking-widest font-semibold mt-1">IMDb</p>
              </div>
            </div>

            <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/10 to-transparent" />

            {/* Ano */}
            <div className="flex items-center gap-3">
              <Calendar className="size-4 text-[#8E97A8] shrink-0" />
              <div className="flex flex-col">
                <p className="text-white font-bold text-[15px] leading-none">
                  {heroContents[currentSlide]?.year || '2024'}
                </p>
                <p className="text-[#8E97A8] text-[9px] uppercase tracking-widest font-semibold mt-1">Ano</p>
              </div>
            </div>

            <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/10 to-transparent" />

            {/* Qualidade */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center px-1.5 py-1 rounded-[3px] border border-white/20 bg-white/5">
                <span className="text-[8px] font-bold text-white tracking-widest leading-none">4K</span>
              </div>
              <div className="flex flex-col">
                <p className="text-white font-bold text-[15px] leading-none">4K UHD</p>
                <p className="text-[#8E97A8] text-[9px] uppercase tracking-widest font-semibold mt-1">Qualidade</p>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* ── Vertical pagination (left) ── */}
      <div className="absolute left-6 lg:left-10 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col items-center gap-5">
        <span className="text-[#A661FF] text-[12px] font-bold tracking-widest tabular-nums"
          style={{ textShadow: '0 0 12px rgba(166,97,255,0.6)' }}>
          {String(currentSlide + 1).padStart(2, '0')}
        </span>

        <div className="flex flex-col gap-2.5">
          {heroContents.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setTextVisible(false);
                setTimeout(() => {
                  setPrevSlide(currentSlide);
                  setCurrentSlide(i);
                  setTimeout(() => setTextVisible(true), 80);
                }, 320);
              }}
              className={clsx(
                'w-[2px] rounded-full transition-all duration-700 origin-center',
                i === currentSlide
                  ? 'h-14 bg-[#A661FF]'
                  : 'h-3 bg-white/15 hover:bg-white/35'
              )}
              style={i === currentSlide ? {
                animation: 'barBreath 2.8s ease-in-out infinite, glowPulse 2.8s ease-in-out infinite',
              } : {}}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        <span className="text-[#3A4055] text-[12px] font-medium tracking-widest tabular-nums">
          {String(heroContents.length).padStart(2, '0')}
        </span>
      </div>

      {/* ── Right arrow ── */}
      <button
        onClick={nextSlide}
        className="absolute right-6 lg:right-12 top-1/2 -translate-y-1/2 z-30 w-12 h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 active:scale-95 opacity-0 group-hover/carousel:opacity-100"
        style={{
          background: 'rgba(5,5,16,0.55)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        }}
      >
        <ChevronRight className="size-6 translate-x-0.5" />
      </button>
    </section>
  );
}