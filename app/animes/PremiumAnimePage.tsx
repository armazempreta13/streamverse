'use client';

import React from 'react';
import { AnimeHeroPremium } from '@/components/AnimeHeroPremium';
import { ContinueWatching } from '@/components/ContinueWatching';
import { TmdbCarousel } from '@/components/TmdbCarousel';
import { OtakuAtmosphere } from '@/components/OtakuAtmosphere';

export function PremiumAnimePage() {
  return (
    <>
      <OtakuAtmosphere />
      
      <div className="flex-1 relative pb-10 z-10">
        <AnimeHeroPremium />

        <div className="relative z-30 mt-[-40px] md:mt-[-80px]">
          <div className="w-full max-w-[1600px] mx-auto px-6 md:px-10 mb-2 flex items-center gap-3 opacity-60">
            <span className="text-[10px] tracking-[0.3em] text-[#FF3366] font-display font-bold">アニメ</span>
            <div className="h-px w-12 bg-gradient-to-r from-[#FF3366] to-transparent" />
          </div>
          <ContinueWatching />
        </div>

        <div className="mt-4 space-y-12 relative z-10">
          {/* 1. Lançamentos */}
          <div className="relative">
            <TmdbCarousel 
              title="Novos Episódios" 
              endpoint="recent_anime" 
              cardStyle="media" 
              seeAllHref="/search?type=anime"
              badge="NOVO"
            />
          </div>

          {/* 2. EM ALTA NO JAPÃO */}
          <div className="relative">
            <div className="absolute top-[-20px] left-6 md:left-10 text-[10px] tracking-widest text-[#8F44FF] font-bold opacity-50 uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#8F44FF] rounded-full animate-pulse" /> Trending Now トレンド
            </div>
            <TmdbCarousel 
              title="EM ALTA NO JAPÃO 🔥" 
              endpoint="anime" 
              cardStyle="trending" 
              seeAllHref="/search?type=anime"
            />
          </div>
          
          {/* 3. Populares */}
          <div className="relative">
             <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[30%] h-full bg-[#3B82F6] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.03] pointer-events-none -z-10" />
             <TmdbCarousel 
               title="Populares" 
               endpoint="anime" 
               cardStyle="media" 
               seeAllHref="/search?type=anime"
             />
          </div>
          
        </div>
      </div>
    </>
  );
}
