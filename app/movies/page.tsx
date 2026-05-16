import React, { Suspense } from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroBanner } from '@/components/HeroBanner';
import { ContinueWatching } from '@/components/ContinueWatching';
import { siteConfig } from '@/config/site';
import { TmdbCarousel } from '@/components/TmdbCarousel';

export default function MoviesPage() {
  return (
    <main className="min-h-screen text-white flex">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full relative">
        <Suspense fallback={null}>
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
              seeAllHref="/search?type=movie&sort=recent"
              badge="NOVO"
            />

            {/* 3. Ação e Aventura */}
            <div className="relative">
               <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[30%] h-full bg-[#8F44FF] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.04] pointer-events-none -z-10" />
               <TmdbCarousel 
                 title="Ação e Aventura" 
                 endpoint="action_movies" 
                 cardStyle="media" 
                 seeAllHref="/search?type=movie&genre=28"
               />
            </div>

            {/* 4. Ficção Científica */}
            <TmdbCarousel 
              title="Ficção Científica" 
              endpoint="scifi_movies" 
              cardStyle="media" 
              seeAllHref="/search?type=movie&genre=878"
            />

            {/* 5. Top Rated */}
            <TmdbCarousel 
              title="Melhores Avaliados" 
              endpoint="top_rated_movies" 
              cardStyle="media" 
              seeAllHref="/search?type=movie&sort=top_rated"
            />

            {siteConfig.features.extendedCatalogs && (
              <>
                {/* 6. Sucessos de Bilheteria */}
                <TmdbCarousel 
                  title="Sucessos de Bilheteria" 
                  endpoint="popular_movies" 
                  cardStyle="media" 
                  seeAllHref="/search?type=movie&sort=popular"
                />

                {/* 7. Chegando em Breve */}
                <TmdbCarousel 
                  title="Chegando em Breve" 
                  endpoint="upcoming_movies" 
                  cardStyle="media" 
                  seeAllHref="/search?type=movie&sort=upcoming"
                  badge="EM BREVE"
                />

                {/* 8. Terror em Alta */}
                <TmdbCarousel 
                  title="Terror em Alta" 
                  endpoint="horror_movies" 
                  cardStyle="media" 
                  seeAllHref="/search?type=movie&genre=27"
                />

                {/* 9. Comédias */}
                <TmdbCarousel 
                  title="Comédias" 
                  endpoint="comedy_movies" 
                  cardStyle="media" 
                  seeAllHref="/search?type=movie&genre=35"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
