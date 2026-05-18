import React, { Suspense } from 'react';
import { Navbar } from '@/components/Navbar';
import { getDetails, getSimilar, formatTmdbToCard, getTmdbImage, getCredits, getKeywords, getTrailerUrl, getSeasons, fetchLogo, fetchAlternativeBackdrop } from '@/lib/tmdb-service';
import { Metadata } from 'next';
import { ArrowLeft, Play, Info, Star, Plus, Download, Share2, ChevronLeft, ChevronRight, Clock, Calendar, Globe, Tv, Film } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { MediaCard } from '@/components/Cards';
import { VideoPlayer } from '@/components/VideoPlayer';
import { CommentSection } from '@/components/CommentSection';
import { OtakuAtmosphere } from '@/components/OtakuAtmosphere';
import { SubtleActionBar } from '@/components/SubtleActionBar';
import { GenreAtmosphere } from '@/components/GenreAtmosphere';
import { SpidermanAnimation } from '@/components/SpidermanAnimation';
import { AmbientLighting } from '@/components/ambient-lighting';
import { NativeAd } from '@/components/NativeAd';

export async function generateMetadata({ params }: { params: Promise<{ type: string, id: string }> }): Promise<Metadata> {
  const { type, id } = await params;
  if (type !== 'movie' && type !== 'tv') return {};
  
  const details = await getDetails(type as 'movie' | 'tv', id);
  if (!details) return {};

  const title = type === 'movie' ? details.title : details.name;
  const keywordsData = await getKeywords(type as 'movie' | 'tv', id);
  const tags = keywordsData.map((k: any) => k.name).join(', ');

  return {
    title: `${title} - Assistir Online no StreamVerse`,
    description: details.overview ? details.overview.substring(0, 160) : `Assista ${title} online em HD no StreamVerse.`,
    keywords: `${tags}, assistir ${title}, ${title} online, streamverse`,
    openGraph: {
      title: `${title} - StreamVerse`,
      description: details.overview,
      images: [details.backdrop_path ? `https://image.tmdb.org/t/p/w780${details.backdrop_path}` : ''],
    }
  };
}

export default async function TmdbWatchPage({ params }: { params: Promise<{ type: string, id: string }> }) {
  const { type, id } = await params;
  
  if (type !== 'movie' && type !== 'tv') {
    return notFound();
  }

  const details = await getDetails(type as 'movie' | 'tv', id);
  
  if (!details) {
    return notFound();
  }

  const title = type === 'movie' ? details.title : details.name;
  const date = type === 'movie' ? details.release_date : details.first_air_date;
  const year = date ? date.split('-')[0] : '';
  const backdrop = details.backdrop_path ? `https://image.tmdb.org/t/p/w780${details.backdrop_path}` : '';
  const posterUrl = details.poster_path ? getTmdbImage(details.poster_path) : 'https://picsum.photos/seed/1/400/600';
  const genres = details.genres?.map((g: any) => g.name).join(', ') || '';
  const runtime = type === 'movie' ? details.runtime : (details.episode_run_time?.[0] || '');

  const videoUrl = type === 'movie' 
    ? `https://myembed.biz/filme/${id}` 
    : `https://myembed.biz/serie/${id}`;

  const similarData = await getSimilar(type as 'movie' | 'tv', id);
  const similarItems = similarData.slice(0, 10).map((item: any) => formatTmdbToCard({ ...item, media_type: type }));

  const cast = await getCredits(type as 'movie' | 'tv', id);
  const topCast = cast.slice(0, 20);

  const trailerUrl = await getTrailerUrl(type as 'movie' | 'tv', id);
  const seasons = type === 'tv' ? await getSeasons(id) : [];
  const logoUrl = await fetchLogo(id, type as 'movie' | 'tv');
  const alternativeBackdrop = await fetchAlternativeBackdrop(id, type as 'movie' | 'tv', details.backdrop_path);

  // Detecção de Anime: É série/tv, o país de origem inclui Japão (JP) e tem o gênero Animação (id 16)
  const isAnime = type === 'tv' && 
                  details.origin_country?.includes('JP') && 
                  details.genres?.some((g: any) => g.id === 16);

  const themeColor = isAnime ? '#FF3366' : '#8F44FF';
  const themeGlow = isAnime ? 'rgba(255,51,102,0.4)' : 'rgba(143,68,255,0.4)';

  return (
    <div className="min-h-screen bg-[#0A0C10] text-white flex flex-col font-sans relative overflow-x-hidden">
      <AmbientLighting 
        imageUrl={posterUrl} 
        contentId={id} 
        contentType={isAnime ? 'anime' : (type === 'movie' ? 'movie' : 'series')} 
        genres={details.genres?.map((g: any) => g.name) || []}
      />
      {isAnime && <OtakuAtmosphere backdropUrl={backdrop} />}
      
      <div className="relative z-[210]">
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
      </div>

      <GenreAtmosphere genres={details.genres?.map((g: any) => g.name) || []} theme={isAnime ? 'anime' : 'default'} />
      <SpidermanAnimation title={title || ''} />

      {/* Background Backdrop (Fully blended backdrop) */}
      <div className="absolute top-0 inset-x-0 h-[580px] md:h-[650px] z-0 pointer-events-none overflow-hidden select-none">
        {alternativeBackdrop && (
          <Image 
            src={alternativeBackdrop} 
            alt={title} 
            fill 
            className="object-cover object-top opacity-15 scale-102 animate-in fade-in duration-1000" 
            priority 
            unoptimized 
          />
        )}
        {/* Seamless radial mask spotlight to blend left, right, and center edges */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#0A0C10_80%)]" />
        {/* Vertical gradients to blend navbar (top) and page body (bottom) */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0C10]/80 via-transparent to-[#0A0C10]" />
      </div>

      {/* Hero Banner Section */}
      <div className="relative w-full flex flex-col justify-center items-center pt-24 pb-4">
        <div className="relative z-10 max-w-[1200px] w-full mx-auto px-4 md:px-8 flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in-98 duration-1000">
           
           {/* Center Logo or fallback text (More subtle and elegant) */}
           {logoUrl ? (
             <div className="relative w-[260px] sm:w-[380px] md:w-[480px] h-[90px] sm:h-[135px] md:h-[170px] mx-auto mb-1 select-none pointer-events-none">
               <Image src={logoUrl} alt={title} fill className="object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]" priority unoptimized />
             </div>
           ) : (
             <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display leading-[1.1] mb-1 drop-shadow-2xl">
               {title}
             </h1>
           )}

           {/* Subtle Icon-only Actions */}
           <SubtleActionBar 
             item={{ id, type: type as 'movie' | 'tv', title, posterUrl, backdropUrl: backdrop }}
             theme={isAnime ? 'anime' : 'default'}
           />
        </div>
      </div>

      <main className="flex-1 w-full relative z-20">
        
        {/* Main Grid Layout */}
        <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 mb-16 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-8 mb-16 relative z-10">
            
            {/* Left side: Player (lg:col-span-8) */}
            <div id="player-section" className="lg:col-span-8 flex flex-col gap-8 scroll-mt-28">
              <VideoPlayer 
                id={id} 
                type={type} 
                title={title} 
                posterUrl={posterUrl} 
                videoUrl={videoUrl} 
                backdropUrl={backdrop}
                theme={isAnime ? 'anime' : 'default'}
                genres={details.genres?.map((g: any) => g.name) || []}
              />
            </div>

            {/* Right side: Synopsis + Seasons + Cast Carousel (lg:col-span-4) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="flex flex-col gap-4 bg-[#0D0F14]/40 border border-white/5 p-5 md:p-5 rounded-2xl backdrop-blur-md max-w-full overflow-hidden lg:self-stretch lg:overflow-hidden" style={{ maxHeight: 'calc(56.25vw * 0.667)' }}>
                {/* Sinopse */}
                <div className="flex flex-col gap-4">
                   <div>
                      <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-6 rounded-full" style={{ backgroundColor: themeColor, boxShadow: `0 0 10px ${themeColor}` }} />
                        Sinopse
                      </h3>
                      <div className="pr-1">
                        <p className="text-sm text-[#8A93A6] leading-relaxed font-medium">
                          {details.overview || 'Sinopse não disponível para este idioma.'}
                        </p>
                      </div>
                   </div>

                   {details.tagline && (
                     <p className="text-xs italic text-white/40 border-l-2 pl-3 font-medium" style={{ borderColor: themeColor }}>
                       "{details.tagline}"
                     </p>
                   )}

                   {/* Informações Extras (Clean, Minimalista & Sério) */}
                   <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-bold text-white/50 pt-3 border-t border-white/5 uppercase tracking-wider">
                     {year && (
                       <span className="text-white/80">{year}</span>
                     )}
                     {year && (runtime || (type === 'tv' && details.number_of_seasons) || (details.vote_average !== undefined && details.vote_average > 0) || details.original_language) && (
                       <span className="text-white/20 font-light">•</span>
                     )}
                     
                     {runtime && (
                       <span>
                         {type === 'movie' ? `${runtime} min` : `${details.number_of_episodes || '?'} eps`}
                       </span>
                     )}
                     {runtime && ((type === 'tv' && details.number_of_seasons) || (details.vote_average !== undefined && details.vote_average > 0) || details.original_language) && (
                       <span className="text-white/20 font-light">•</span>
                     )}

                     {type === 'tv' && details.number_of_seasons && (
                       <>
                         <span>{details.number_of_seasons} {details.number_of_seasons === 1 ? 'Temp' : 'Temps'}</span>
                         {((details.vote_average !== undefined && details.vote_average > 0) || details.original_language) && (
                           <span className="text-white/20 font-light">•</span>
                         )}
                       </>
                     )}

                     {details.vote_average !== undefined && details.vote_average > 0 && (
                       <span className="flex items-center gap-1 text-[#FFD700] fill-[#FFD700]">
                         <Star className="w-3.5 h-3.5" />
                         {details.vote_average.toFixed(1)}
                       </span>
                     )}
                     {details.vote_average !== undefined && details.vote_average > 0 && details.original_language && (
                       <span className="text-white/20 font-light">•</span>
                     )}

                     {details.original_language && (
                       <span>{details.original_language}</span>
                     )}
                     {details.original_language && details.origin_country && details.origin_country.length > 0 && (
                       <span className="text-white/20 font-light">•</span>
                     )}

                     {details.origin_country && details.origin_country.length > 0 && (
                       <span>{details.origin_country[0]}</span>
                     )}
                   </div>
                </div>

                {/* Temporadas (TV) inside Right Column */}
                {type === 'tv' && seasons.length > 0 && (
                  <div className="pt-4 border-t border-white/5">
                    <h3 className="text-md font-bold mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-4.5 rounded-full" style={{ backgroundColor: themeColor, boxShadow: `0 0 10px ${themeColor}` }} />
                      Temporadas ({seasons.length})
                    </h3>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2 custom-scrollbar mask-image-r-fade">
                      {seasons.map((s: any) => (
                        <div key={s.id} className="group cursor-pointer shrink-0 w-[82px]">
                          <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-[#0A0A16] ring-1 ring-white/5 group-hover:ring-white/20 transition-all mb-1.5 shadow-md">
                            {s.posterPath ? (
                              <Image
                                src={getTmdbImage(s.posterPath, 'w185')}
                                alt={s.name}
                                fill
                                loading="lazy"
                                quality={70}
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                unoptimized
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-white/20 text-xl font-black">
                                {s.number}
                              </div>
                            )}
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-1.5">
                              <span className="text-[8px] font-black text-white/90 bg-white/10 px-1 py-0.5 rounded-sm uppercase tracking-wider">{s.episodeCount} eps</span>
                            </div>
                          </div>
                          <p className="text-[10px] font-bold text-white line-clamp-1 leading-tight">{s.name}</p>
                          {s.airDate && <p className="text-[8px] text-[#8A93A6] mt-0.5">{new Date(s.airDate).getFullYear()}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Elenco Principal */}
                {topCast.length > 0 && (
                  <div className="pt-4 border-t border-white/5">
                    <h3 className="text-md font-bold mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-4.5 rounded-full" style={{ backgroundColor: themeColor, boxShadow: `0 0 10px ${themeColor}` }} />
                      Elenco Principal
                    </h3>
                    {/* Elegant Horizontal Carousel */}
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2 custom-scrollbar mask-image-r-fade">
                       {topCast.map((person: any) => (
                         <div key={person.id} className="shrink-0 group w-[60px] flex flex-col items-center">
                            <div className="relative w-11 h-11 rounded-full overflow-hidden mb-1.5 border border-white/10 transition-all duration-300 shadow-md group-hover:scale-105 group-hover:border-white/20">
                              <Image 
                                src={person.profile_path ? getTmdbImage(person.profile_path, 'w185') : 'https://picsum.photos/seed/actor/150/150'} 
                                alt={person.name} 
                                fill 
                                className="object-cover" 
                                unoptimized
                              />
                            </div>
                            <h4 className="text-[9px] font-bold text-white text-center line-clamp-1 leading-tight w-full">{person.name}</h4>
                            <p className="text-[8px] text-[#8A93A6] text-center line-clamp-1 mt-0.5 italic">{person.character}</p>
                         </div>
                       ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Native Premium Sidebar Ad */}
              <NativeAd placement="sidebar-card" />
            </div>

          </div>

          {/* Veja também */}
          {similarItems.length > 0 && (
            <div className="pt-8 border-t border-white/5">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-1 h-6 rounded-full" style={{ backgroundColor: isAnime ? '#FF3366' : '#3D5AFE' }}></span>
                Veja também
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {similarItems.map((item: any) => (
                  <MediaCard 
                    key={item.id}
                    title={item.title}
                    subtitle={item.subtitle}
                    imageUrl={item.imageUrl}
                    slug={item.slug}
                    href={`/tmdb/${item.type}/${item.id}`}
                    className="w-full"
                    theme={isAnime ? 'anime' : 'default'}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Avaliações / Comentários */}
          <div className="pt-8 mt-8 border-t border-white/5 relative z-20">
            <h3 className="text-xl font-bold mb-10 flex items-center gap-3 text-white">
              <span className="w-1.5 h-6 rounded-full" style={{ backgroundColor: themeColor, boxShadow: `0 0 10px ${themeColor}` }}></span>
              DEIXE SEU COMENTÁRIO
            </h3>
            
            <CommentSection contentId={`tmdb_${id}`} theme={isAnime ? 'anime' : 'default'} />
          </div>
        </div>

      </main>
    </div>
  );
}
