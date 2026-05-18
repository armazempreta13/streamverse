'use client';

import React from 'react';
import { HeroBanner } from '@/components/HeroBanner';
import { ContinueWatching } from '@/components/ContinueWatching';
import { TmdbCarousel } from '@/components/TmdbCarousel';
import { siteConfig } from '@/config/site';

export function StandardAnimePage() {
  return (
    <div className="flex-1 relative pb-10">
      <HeroBanner category="anime" />

      {/* ── Faixa de fusão hero → conteúdo e Glow Central ── */}
      <div className="pointer-events-none relative z-20 flex justify-center w-full h-0">
        {siteConfig.features.heroGlow && (
          <div
            className="absolute bottom-[-100px] w-full max-w-[2000px] h-[500px] mix-blend-screen opacity-30"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(143,68,255,0.15) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
          />
        )}
      </div>

      <div className="relative z-30 mt-[-20px] sm:mt-[-40px] md:mt-[-80px]">
        <ContinueWatching />
      </div>

      <div className="mt-8 space-y-8 relative z-10 pb-16">
        {/* Animes em Alta */}
        <TmdbCarousel
          title="Animes em Alta"
          endpoint="anime"
          cardStyle="trending"
          seeAllHref="/search?type=anime&sort=trending"
        />

        {/* Novos Episódios */}
        <TmdbCarousel
          title="Novos Episódios"
          endpoint="recent_anime"
          cardStyle="media"
          seeAllHref="/search?type=anime"
          badge="NOVO"
        />

        {/* Mais Assistidos */}
        <div className="relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[30%] h-full bg-[#8F44FF] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.04] pointer-events-none -z-10" />
          <TmdbCarousel
            title="Mais Assistidos"
            endpoint="popular_anime"
            cardStyle="media"
            seeAllHref="/search?type=anime&sort=popular"
          />
        </div>

        {siteConfig.features.extendedCatalogs && (
          <>
            {/* Ação e Shounen */}
            <TmdbCarousel
              title="Ação e Shounen"
              endpoint="action_anime"
              cardStyle="media"
              seeAllHref="/search?type=anime"
            />

            {/* Fantasia e Isekai */}
            <TmdbCarousel
              title="Fantasia e Isekai"
              endpoint="fantasy_anime"
              cardStyle="media"
              seeAllHref="/search?type=anime"
            />

            {/* Comédia e Slice of Life */}
            <TmdbCarousel
              title="Comédia e Slice of Life"
              endpoint="comedy_anime"
              cardStyle="media"
              seeAllHref="/search?type=anime"
            />

            {/* Romance */}
            <TmdbCarousel
              title="Romance"
              endpoint="romance_anime"
              cardStyle="media"
              seeAllHref="/search?type=anime"
            />

            {/* Aclamados */}
            <TmdbCarousel
              title="Aclamados pela Crítica"
              endpoint="top_anime"
              cardStyle="trending"
              seeAllHref="/search?type=anime"
            />
          </>
        )}
      </div>
    </div>
  );
}
