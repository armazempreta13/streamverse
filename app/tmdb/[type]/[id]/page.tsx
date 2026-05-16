import { Navbar } from '@/components/Navbar';
import { getDetails, getSimilar, formatTmdbToCard, getTmdbImage } from '@/lib/tmdb-service';
import { ArrowLeft, Play, Info, Star, Plus, Download, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { MediaCard } from '@/components/Cards';
import { SaveWatchProgress } from '@/components/SaveWatchProgress';

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
  const originalTitle = type === 'movie' ? details.original_title : details.original_name;
  const date = type === 'movie' ? details.release_date : details.first_air_date;
  const year = date ? date.split('-')[0] : '';
  const backdrop = details.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : '';
  const posterUrl = details.poster_path ? getTmdbImage(details.poster_path) : 'https://picsum.photos/seed/1/400/600';
  const genres = details.genres?.map((g: any) => g.name).join(', ') || '';
  const runtime = type === 'movie' ? details.runtime : (details.episode_run_time?.[0] || '');

  // API do EmbedMovies
  const videoUrl = type === 'movie' 
    ? `https://myembed.biz/filme/${id}` 
    : `https://myembed.biz/serie/${id}`;

  const similarData = await getSimilar(type as 'movie' | 'tv', id);
  const similarItems = similarData.slice(0, 10).map((item: any) => formatTmdbToCard({ ...item, media_type: type }));

  return (
    <div className="min-h-screen bg-[#0A0C10] text-white flex flex-col font-sans">
      <Navbar />
      <SaveWatchProgress id={id} type={type} title={title} posterUrl={posterUrl} />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 md:px-8 py-8 mt-16 md:mt-20">
        
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
             <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">★</div>
             {title}
          </h1>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Link href={`/search?type=${type}`} className="bg-[#131520] hover:bg-[#1A1D2D] border border-white/10 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2">
               <ArrowLeft className="size-4" /> Voltar
            </Link>
            <button className="bg-[#131520] hover:bg-[#1A1D2D] border border-white/10 text-white w-10 h-10 rounded-lg flex items-center justify-center transition-colors pointer-events-none">
               <Plus className="size-5" />
            </button>
            <button className="bg-[#131520] hover:bg-[#1A1D2D] border border-white/10 text-white w-10 h-10 rounded-lg flex items-center justify-center transition-colors pointer-events-none">
               <Download className="size-5" />
            </button>
            <div className="flex-1" />
            <button className="bg-transparent hover:bg-white/5 text-[#8A93A6] hover:text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 pointer-events-none">
               <Share2 className="size-4" /> Compartilhar
            </button>
          </div>
        </div>

        {/* Player and Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Main Player Area */}
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col relative z-[110]">
            <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/5 relative">
              <iframe 
                src={videoUrl}
                className="w-full h-full border-none"
                allowFullScreen
              />
            </div>
            
            {/* Context Actions / Notice under player */}
            <div className="bg-[#131520] border border-white/5 px-6 py-4 rounded-xl mt-4 flex items-center gap-4">
              <Info className="size-5 text-[#3D5AFE] shrink-0" />
              <p className="text-sm text-[#8A93A6]">
                <strong className="text-white">INFORMAÇÃO:</strong> O player acima é fornecido pelo EmbedMovies. Pode conter anúncios de terceiros sobre os quais não temos controle.
              </p>
            </div>
          </div>

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
                     <span className="text-sm font-bold text-[#FBBF24] flex items-center gap-1">
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
                       <span key={g} className="bg-[#3D5AFE]/10 border border-[#3D5AFE]/30 text-[#3D5AFE] px-3 py-1 rounded-full text-xs font-medium">
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
            
            <div className="bg-[#131520] border border-white/5 p-6 rounded-xl">
               <h3 className="font-bold text-lg mb-4 text-white">Opções de Áudio</h3>
               <div className="grid grid-cols-2 gap-2">
                 <button className="bg-[#3D5AFE] text-white py-2 rounded-lg font-bold text-sm hover:bg-[#324BE6] transition-colors">DUBLADO</button>
                 <button className="bg-[#2A2E3D] hover:bg-[#3A3F53] text-[#8A93A6] hover:text-white py-2 rounded-lg font-bold text-sm transition-colors border border-white/5">LEGENDADO</button>
               </div>
               <p className="text-xs text-[#8A93A6] mt-4 text-center">
                  O provedor atual detecta a melhor opção automaticamente, ou oferece a escolha dentro do player.
               </p>
            </div>
          </div>
        </div>

        {/* Veja também */}
        {similarItems.length > 0 && (
          <div className="pt-8 border-t border-white/5">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-[#3D5AFE] rounded-full"></span>
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
                />
              ))}
            </div>
          </div>
        )}

        {/* Avaliações / Comentários */}
        <div className="pt-8 mt-8 border-t border-white/5">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
            <span className="w-1 h-6 bg-[#3D5AFE] rounded-full"></span>
            DEIXE SEU COMENTÁRIO
          </h3>
          <div className="bg-[#131520] border border-white/5 p-8 rounded-xl flex flex-col items-center justify-center text-center">
            <p className="text-[#8A93A6] mb-4">Para interagir nesta página é necessário ter uma conta.</p>
            <button className="bg-[#3D5AFE] hover:bg-[#324BE6] text-white px-6 py-2.5 rounded-lg font-bold transition-colors shadow-lg">
               Fazer Login
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
