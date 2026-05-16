import { Navbar } from '@/components/Navbar';
import { getDetails, getSimilar, formatTmdbToCard, getTmdbImage, getCredits, getKeywords } from '@/lib/tmdb-service';
import { Metadata } from 'next';
import { ArrowLeft, Play, Info, Star, Plus, Download, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { MediaCard } from '@/components/Cards';
import { VideoPlayer } from '@/components/VideoPlayer';
import { CommentSection } from '@/components/CommentSection';
import { OtakuAtmosphere } from '@/components/OtakuAtmosphere';
import { BackButton } from '@/components/BackButton';

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
  const backdrop = details.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : '';
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

  // Detecção de Anime: É série/tv, o país de origem inclui Japão (JP) e tem o gênero Animação (id 16)
  const isAnime = type === 'tv' && 
                  details.origin_country?.includes('JP') && 
                  details.genres?.some((g: any) => g.id === 16);

  const themeColor = isAnime ? '#FF3366' : '#8F44FF';
  const themeGlow = isAnime ? 'rgba(255,51,102,0.4)' : 'rgba(143,68,255,0.4)';

  return (
    <div className="min-h-screen bg-[#0A0C10] text-white flex flex-col font-sans relative overflow-x-hidden">
      {isAnime && <OtakuAtmosphere />}
      
      <div className="relative z-10">
        <Navbar />
      </div>
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 md:px-8 py-8 mt-16 md:mt-20 relative z-10">
        
        {/* Breadcrumb & Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-[#8A93A6] mb-4">
            <Link href="/" className="hover:text-white transition-colors">Início</Link>
            <span>&gt;</span>
            <Link href={`/search?type=${type}`} className="hover:text-white transition-colors">
              {type === 'movie' ? 'Filmes' : 'Séries'}
            </Link>
            <span>&gt;</span>
            <span className="text-white truncate">{title}</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black mb-4 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: themeColor, boxShadow: `0 0 15px ${themeGlow}` }}>★</div>
             {title}
          </h1>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <BackButton />
            <button className="bg-[#131520] hover:bg-[#1A1D2D] border border-white/10 text-white w-10 h-10 rounded-lg flex items-center justify-center transition-colors">
               <Plus className="size-5" />
            </button>
            <button className="bg-[#131520] hover:bg-[#1A1D2D] border border-white/10 text-white w-10 h-10 rounded-lg flex items-center justify-center transition-colors">
               <Download className="size-5" />
            </button>
            <div className="flex-1" />
            <button className="bg-transparent hover:bg-white/5 text-[#8A93A6] hover:text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
               <Share2 className="size-4" /> Compartilhar
            </button>
          </div>
        </div>

        {/* Player and Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Main Player Area */}
          <VideoPlayer 
            id={id} 
            type={type} 
            title={title} 
            posterUrl={posterUrl} 
            videoUrl={videoUrl} 
            backdropUrl={backdrop}
            theme={isAnime ? 'anime' : 'default'}
          />

          {/* Sidebar Area */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            <div className="bg-[#131520] border border-white/5 p-6 rounded-xl relative overflow-hidden">
               {backdrop && (
                 <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <Image src={backdrop} alt={title} fill className="object-cover" unoptimized/>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#131520] to-transparent" />
                 </div>
               )}
               <div className="relative z-10">
                 <h3 className="font-bold text-lg mb-4 text-white">Sobre a Obra</h3>
                 
                 <div className="flex flex-col gap-3 mb-6">
                   <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg">
                     <span className="text-sm text-[#8A93A6]">Avaliação</span>
                     <span className="text-sm font-bold flex items-center gap-1" style={{ color: isAnime ? '#FF3366' : '#FBBF24' }}>
                       <Star className="size-4 fill-current" /> {details.vote_average?.toFixed(1)}
                     </span>
                   </div>
                   <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg">
                     <span className="text-sm text-[#8A93A6]">Ano lançamento</span>
                     <span className="text-sm font-medium text-white">{year}</span>
                   </div>
                   {runtime ? (
                     <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg">
                       <span className="text-sm text-[#8A93A6]">Duração</span>
                       <span className="text-sm font-medium text-white">{runtime} min</span>
                     </div>
                   ) : null}
                 </div>

                 <div className="mb-6">
                   <h4 className="text-sm font-semibold text-[#8A93A6] mb-2 uppercase tracking-wider">Gêneros</h4>
                   <div className="flex flex-wrap gap-2">
                     {genres.split(', ').map((g: string) => g && g !== '' ? (
                       <span key={g} className="px-3 py-1 rounded-full text-xs font-medium border" style={{ 
                         backgroundColor: isAnime ? 'rgba(255,51,102,0.1)' : 'rgba(61,90,254,0.1)',
                         borderColor: isAnime ? 'rgba(255,51,102,0.3)' : 'rgba(61,90,254,0.3)',
                         color: isAnime ? '#FF3366' : '#3D5AFE'
                       }}>
                         {g}
                       </span>
                     ) : null)}
                   </div>
                 </div>

                 <div>
                   <h4 className="text-sm font-semibold text-[#8A93A6] mb-2 uppercase tracking-wider">Sinopse</h4>
                   <p className="text-sm text-gray-300 leading-relaxed max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                     {details.overview || 'Sinopse não disponível para este idioma.'}
                   </p>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Elenco Principal */}
        {topCast.length > 0 && (
          <div className="mb-12 pt-8 border-t border-white/5">
             <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
               <span className="w-1.5 h-6 rounded-full" style={{ backgroundColor: themeColor, boxShadow: `0 0 10px ${themeColor}` }}></span>
               Elenco Principal
             </h3>
             <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide -mx-4 md:-mx-8 px-4 md:px-8">
               {topCast.map((person: any) => (
                 <div key={person.id} className="shrink-0 group w-[110px] md:w-[130px]">
                   <div className={`relative aspect-[1/1.2] rounded-full overflow-hidden mb-3 border-2 border-white/5 transition-all duration-500 shadow-xl ${isAnime ? 'group-hover:border-[#FF3366]' : 'group-hover:border-[#8F44FF]'}`}>
                     <Image 
                       src={person.profile_path ? getTmdbImage(person.profile_path, 'w300') : 'https://picsum.photos/seed/actor/300/450'} 
                       alt={person.name} 
                       fill 
                       className="object-cover group-hover:scale-110 transition-transform duration-700" 
                       unoptimized
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>
                   <div className="text-center">
                      <h4 className={`text-[13px] font-bold text-white transition-colors line-clamp-1 leading-tight ${isAnime ? 'group-hover:text-[#FF3366]' : 'group-hover:text-[#A661FF]'}`}>{person.name}</h4>
                      <p className="text-[10px] text-[#8A93A6] line-clamp-1 mt-1 font-medium tracking-tight italic">{person.character}</p>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        )}

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

      </main>
    </div>
  );
}
