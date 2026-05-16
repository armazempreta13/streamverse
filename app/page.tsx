import React, { Suspense } from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroBanner } from '@/components/HeroBanner';
import { ContinueWatching } from '@/components/ContinueWatching';
import { siteConfig } from '@/config/site';
import { TmdbCarousel } from '@/components/TmdbCarousel';

export default function Home() {
  return (
    <main className="min-h-screen text-white flex overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full overflow-y-auto h-screen scrollbar-hide relative">
        <Suspense fallback={<div className="h-[80px]" />}>
          <Navbar />
        </Suspense>
        
        <div className="flex-1 relative pb-10">
          <HeroBanner />

          {/* ── Faixa de fusão hero → conteúdo e Glow Central ── */}
          <div className="pointer-events-none relative z-20 flex justify-center w-full h-0">
            {/* Efeito de fusão e luz orgânica sob a Hero */}
            {siteConfig.features.heroGlow && (
              <>
                {/* Brilho Difuso Maior posicionado SUBINDO para a Hero */}
                <div className="absolute bottom-[-100px] w-full max-w-[2000px] h-[500px] mix-blend-screen opacity-30"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(143,68,255,0.15) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                  }}
                />
                {/* Halo Roxo Suave para a caixa do IMDb */}
                <div className="absolute bottom-[20px] w-full max-w-[600px] h-[60px] mix-blend-screen rounded-[100%]"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(166,97,255,0.4) 0%, transparent 70%)',
                    filter: 'blur(30px)',
                  }}
                />
                <div className="absolute bottom-[40px] w-full max-w-[400px] h-[1px] z-10"
                  style={{
                    background: 'linear-gradient(to right, transparent, rgba(166,97,255,0.5) 20%, rgba(191,139,255,0.8) 50%, rgba(166,97,255,0.5) 80%, transparent)',
                    boxShadow: '0 2px 10px 1px rgba(166,97,255,0.4)',
                  }}
                />
              </>
            )}
          </div>
          
          <div className="relative z-30 mt-[-20px] sm:mt-[-40px] md:mt-[-80px]">
            <ContinueWatching />
          </div>

          <div className="mt-2 space-y-0 relative z-10">
            {siteConfig.features.premiumHomeLayout ? (
              <>
                {/* 2. Em Alta Agora (Mistura de Tudo) */}
                <TmdbCarousel 
                  title="Em Alta Agora" 
                  endpoint="trending" 
                  cardStyle="trending" 
                  seeAllHref="/search?sort=trending"
                />

                {/* 3. Lançamentos Premium */}
                <TmdbCarousel 
                  title="Lançamentos" 
                  endpoint="recent_movies" 
                  cardStyle="media" 
                  seeAllHref="/search?type=movie&sort=recent"
                  badge="ESTREIA"
                />

                {/* 4. Séries em Alta */}
                <div className="relative">
                   <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[30%] h-full bg-[#8F44FF] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.04] pointer-events-none -z-10" />
                   <TmdbCarousel 
                     title="Séries em Alta" 
                     endpoint="trending_series" 
                     cardStyle="media" 
                     seeAllHref="/search?type=tv&sort=trending"
                     badge="SÉRIE"
                   />
                </div>

                {/* 5. Animes da Temporada (Condicional) */}
                {siteConfig.features.showAnimesOnHome && (
                  <div className="relative">
                     <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[40%] h-full bg-[#3B82F6] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.03] pointer-events-none -z-10" />
                     <TmdbCarousel 
                       title="Animes da Temporada" 
                       endpoint="anime" 
                       cardStyle="media" 
                       seeAllHref="/animes"
                       badge="CRUNCHYROLL"
                     />
                  </div>
                )}

                {/* 6. Filmes Mais Assistidos */}
                <TmdbCarousel 
                  title="Filmes Mais Assistidos" 
                  endpoint="popular_movies" 
                  cardStyle="media" 
                  seeAllHref="/search?type=movie&sort=popular"
                />

                {/* 7. Recomendados Para Você (Placeholder Inteligente) */}
                <TmdbCarousel 
                  title="Recomendados Para Você" 
                  endpoint="trending" 
                  cardStyle="media" 
                  seeAllHref="/search"
                  badge="PARA VOCÊ"
                />

                {/* 8. Episódios Novos */}
                <TmdbCarousel 
                  title="Episódios Novos" 
                  endpoint="recent_series"
                  cardStyle="media" 
                  seeAllHref="/search?type=tv&sort=recent"
                  badge="EP NOVO"
                />
              </>
            ) : (
              <>
                {/* Estrutura Clássica (Fallback) */}
                <TmdbCarousel title="Filmes Recentes" endpoint="recent_movies" cardStyle="media" badge="NOVO" />
                <TmdbCarousel title="Novos Episódios" endpoint="recent_series" cardStyle="media" badge="ATUALIZADO" />
                <TmdbCarousel title="Top 10 Em Alta" endpoint="trending" cardStyle="trending" />
                {siteConfig.features.showAnimesOnHome && (
                  <TmdbCarousel title="Animes em Destaque" endpoint="anime" cardStyle="media" />
                )}
                <TmdbCarousel title="Filmes de Sucesso" endpoint="popular_movies" cardStyle="media" />
                <TmdbCarousel title="Maratonas Imperdíveis" endpoint="popular_series" cardStyle="media" />
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
