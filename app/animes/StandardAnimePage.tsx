'use client';

import React from 'react';
import { HeroBanner } from '@/components/HeroBanner';
import { ContinueWatching } from '@/components/ContinueWatching';
import { TmdbCarousel } from '@/components/TmdbCarousel';

export function StandardAnimePage() {
  return (
    <div className="flex-1 relative pb-10">
      <HeroBanner category="anime" />

      {/* ── Faixa de fusão hero → conteúdo e Glow Central ── */}
      <div className="relative z-20 w-full h-0">
        <div className="absolute inset-x-0 bottom-0 h-[250px] bg-gradient-to-b from-transparent via-[#050510]/80 to-[#050510] pointer-events-none" />
        
        {/* Glow Central Roxão da Hero */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-full max-w-[800px] h-[300px] bg-[#8F44FF] rounded-[100%] opacity-[0.08] blur-[120px] pointer-events-none" />
      </div>

      <div className="relative z-30 mt-4 sm:mt-8">
        <ContinueWatching />
      </div>

      <div className="mt-8 space-y-12 relative z-10">
        <div className="relative">
          <TmdbCarousel 
            title="Novos Episódios" 
            endpoint="recent_anime" 
            cardStyle="media" 
            seeAllHref="/search?type=anime"
            badge="NOVO"
          />
        </div>

        <div className="relative">
          <TmdbCarousel 
            title="Top 10 Em Alta" 
            endpoint="anime" 
            cardStyle="trending" 
            seeAllHref="/search?type=anime"
          />
        </div>
        
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
  );
}
