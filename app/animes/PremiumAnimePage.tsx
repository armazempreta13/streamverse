'use client';

import React from 'react';
import { AnimeHeroPremium } from '@/components/AnimeHeroPremium';
import { ContinueWatching } from '@/components/ContinueWatching';
import { TmdbCarousel } from '@/components/TmdbCarousel';
import { OtakuAtmosphere } from '@/components/OtakuAtmosphere';
import { Aperture, Flame } from 'lucide-react';
import { siteConfig } from '@/config/site';

export function PremiumAnimePage() {
  return (
    <>
      <OtakuAtmosphere />
      
      <div className="flex-1 relative pb-10 z-10">
        <AnimeHeroPremium />

        <div className="relative z-30 mt-[-40px] md:mt-[-80px]">
          <div className="w-full max-w-[1600px] mx-auto px-6 md:px-10 mb-2 flex items-center gap-3 opacity-60">
            <span className="text-[10px] tracking-[0.3em] text-[#FF3366] font-display font-bold">継続中</span>
            <div className="h-px w-12 bg-gradient-to-r from-[#FF3366] to-transparent" />
          </div>
          <ContinueWatching theme="anime" />
        </div>

        <div className="mt-8 flex flex-col gap-10 md:gap-12 relative z-10">

          {/* 1. Novos Episódios */}
          <div className="relative">
            <div className={`absolute top-[-18px] left-6 md:left-10 flex items-center gap-2 z-20 ${siteConfig.features.crunchyrollStyleLayout ? 'top-[-26px]' : ''}`}>
              {siteConfig.features.crunchyrollStyleLayout ? (
                <>
                  <Aperture className="size-5 text-[#B838F5]" />
                  <span className="text-[16px] font-bold text-white tracking-wide uppercase">NOVOS EPISÓDIOS</span>
                  <span className="text-[11px] text-white/40 ml-2 tracking-widest">新しいエピソード</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF3366] animate-pulse shadow-[0_0_8px_#FF3366]" />
                  <span className="text-[9px] tracking-[0.35em] text-[#FF3366]/50 font-bold uppercase">新着エピソード</span>
                </>
              )}
            </div>
            <TmdbCarousel 
              title={siteConfig.features.crunchyrollStyleLayout ? "" : "Novos Episódios"} 
              endpoint="recent_anime" 
              cardStyle="media" 
              seeAllHref="/search?type=anime"
              badge="NOVO"
              theme="anime"
            />
          </div>

          {/* ── Torii Divider ── */}
          {!siteConfig.features.crunchyrollStyleLayout && (
            <div className="w-full max-w-[1600px] mx-auto px-6 md:px-10 flex items-center gap-4 py-1">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#FF3366]/15 to-transparent" />
              <span className="text-[#FF3366]/20 text-lg">⛩</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#FF3366]/15 to-transparent" />
            </div>
          )}

          {/* 2. EM ALTA NO JAPÃO */}
          <div className="relative">
            <div className={`absolute top-[-18px] left-6 md:left-10 flex items-center gap-2 z-20 ${siteConfig.features.crunchyrollStyleLayout ? 'top-[-26px]' : ''}`}>
              {siteConfig.features.crunchyrollStyleLayout ? (
                <>
                  <Flame className="size-5 text-[#FF3366]" />
                  <span className="text-[16px] font-bold text-white tracking-wide uppercase">EM ALTA NO JAPÃO</span>
                  <span className="text-[11px] text-white/40 ml-2 tracking-widest">日本で人気</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8F44FF] animate-pulse shadow-[0_0_8px_#8F44FF]" />
                  <span className="text-[9px] tracking-[0.35em] text-[#8F44FF]/50 font-bold uppercase">トレンド · Trending</span>
                </>
              )}
            </div>
            <TmdbCarousel 
              title={siteConfig.features.crunchyrollStyleLayout ? "" : "EM ALTA NO JAPÃO 🔥"} 
              endpoint="anime" 
              cardStyle="trending" 
              seeAllHref="/search?type=anime"
              theme="anime"
            />
          </div>

          {/* ── Katana Divider ── */}
          {!siteConfig.features.crunchyrollStyleLayout && (
            <div className="w-full max-w-[1600px] mx-auto px-6 md:px-10 flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#8F44FF]/10" />
              <span className="text-[8px] tracking-[0.5em] text-white/8 font-bold">斬</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#8F44FF]/10" />
            </div>
          )}
          
          {/* 3. Populares */}
          <div className="relative">
             <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[30%] h-full bg-[#FF3366] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.02] pointer-events-none -z-10" />
             <div className="absolute top-[-18px] left-6 md:left-10 flex items-center gap-2 z-20">
               <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24] animate-pulse shadow-[0_0_8px_#FBBF24]" />
               <span className="text-[9px] tracking-[0.35em] text-[#FBBF24]/50 font-bold uppercase">人気作品 · Populares</span>
             </div>
             <TmdbCarousel 
               title="Mais Assistidos" 
               endpoint="anime" 
               cardStyle="media" 
               seeAllHref="/search?type=anime"
               theme="anime"
             />
          </div>

          {/* ── Bottom Watermark ── */}
          <div className="w-full max-w-[1600px] mx-auto px-6 md:px-10 py-6 flex items-center justify-center gap-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#FF3366]/8" />
            <span className="text-[10px] text-[#8A93A6]/12 tracking-[0.5em] font-bold select-none">アニメ · STREAMVERSE · 配信</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#FF3366]/8" />
          </div>
        </div>
      </div>
    </>
  );
}
