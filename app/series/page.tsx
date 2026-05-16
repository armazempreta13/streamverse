import React, { Suspense } from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroBanner } from '@/components/HeroBanner';
import { ContinueWatching } from '@/components/ContinueWatching';
import { siteConfig } from '@/config/site';
import { TmdbCarousel } from '@/components/TmdbCarousel';

export default function SeriesPage() {
  return (
    <main className="min-h-screen text-white flex overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full overflow-y-auto h-screen scrollbar-hide relative">
        <Suspense fallback={<div className="h-[80px]" />}>
          <Navbar />
        </Suspense>
        
        <div className="flex-1 relative pb-10">
          <HeroBanner category="series" />

          {/* ── Faixa de fusão hero → conteúdo e Glow Central ── */}
          <div className="pointer-events-none relative z-20 flex justify-center w-full h-0">
            {siteConfig.features.heroGlow && (
              <>
                <div className="absolute bottom-[-100px] w-full max-w-[2000px] h-[500px] mix-blend-screen opacity-30"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.1) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                  }}
                />
              </>
            )}
          </div>
          
          <div className="relative z-30 mt-[-20px] sm:mt-[-40px] md:mt-[-80px]">
            <ContinueWatching />
          </div>

          <div className="mt-2 space-y-0 relative z-10">
            {/* 1. Séries em Alta */}
            <TmdbCarousel 
              title="Séries em Alta" 
              endpoint="trending_series" 
              cardStyle="trending" 
              seeAllHref="/search?type=tv&sort=trending"
            />

            {/* 2. Lançamentos */}
            <TmdbCarousel 
              title="Novos Episódios" 
              endpoint="recent_series" 
              cardStyle="media" 
              seeAllHref="/search?type=tv"
              badge="NOVO"
            />

            {/* 3. Populares */}
            <div className="relative">
               <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[30%] h-full bg-[#3B82F6] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.03] pointer-events-none -z-10" />
               <TmdbCarousel 
                 title="Populares na StreamVerse" 
                 endpoint="popular_series" 
                 cardStyle="media" 
                 seeAllHref="/search?type=tv"
               />
            </div>

            {/* 4. Top Rated */}
            <TmdbCarousel 
              title="Favoritas do Público" 
              endpoint="top_rated_series" 
              cardStyle="media" 
              seeAllHref="/search?type=tv&sort=top_rated"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
