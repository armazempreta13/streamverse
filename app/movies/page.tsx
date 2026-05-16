import React, { Suspense } from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroBanner } from '@/components/HeroBanner';
import { ContinueWatching } from '@/components/ContinueWatching';
import { siteConfig } from '@/config/site';
import { TmdbCarousel } from '@/components/TmdbCarousel';

export default function MoviesPage() {
  return (
    <main className="min-h-screen text-white flex overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full overflow-y-auto h-screen scrollbar-hide relative">
        <Suspense fallback={<div className="h-[80px]" />}>
          <Navbar />
        </Suspense>
        
        <div className="flex-1 relative pb-10">
          <HeroBanner category="movie" />

          {/* ── Faixa de fusão hero → conteúdo e Glow Central ── */}
          <div className="pointer-events-none relative z-20 flex justify-center w-full h-0">
            {siteConfig.features.heroGlow && (
              <>
                <div className="absolute bottom-[-100px] w-full max-w-[2000px] h-[500px] mix-blend-screen opacity-30"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(143,68,255,0.15) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                  }}
                />
              </>
            )}
          </div>
          
          <div className="relative z-30 mt-[-20px] sm:mt-[-40px] md:mt-[-80px]">
            <ContinueWatching />
          </div>

          <div className="mt-8 space-y-8 relative z-10 pb-16">
            {/* 1. Filmes em Alta */}
            <TmdbCarousel 
              title="Filmes em Alta" 
              endpoint="trending_movies" 
              cardStyle="trending" 
              seeAllHref="/search?type=movie&sort=trending"
            />

            {/* 2. Lançamentos */}
            <TmdbCarousel 
              title="Recém Lançados" 
              endpoint="recent_movies" 
              cardStyle="media" 
              seeAllHref="/search?type=movie"
              badge="NOVO"
            />

            {/* 3. Populares */}
            <div className="relative">
               <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[30%] h-full bg-[#8F44FF] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.04] pointer-events-none -z-10" />
               <TmdbCarousel 
                 title="Populares" 
                 endpoint="popular_movies" 
                 cardStyle="media" 
                 seeAllHref="/search?type=movie"
               />
            </div>

            {/* 4. Top Rated */}
            <TmdbCarousel 
              title="Melhores Avaliados" 
              endpoint="top_rated_movies" 
              cardStyle="media" 
              seeAllHref="/search?type=movie&sort=top_rated"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
