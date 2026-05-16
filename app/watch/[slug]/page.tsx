'use client';

import React, { Suspense, useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Play, Pause, AlertCircle, Info, ChevronLeft, Menu, Search, MessageSquare, ListVideo, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { collection, query, where, getDocs, limit } from 'firebase/firestore/lite';
import { db } from '@/lib/firebase';
import { useWatchProgress } from '@/hooks/useWatchProgress';
import { CommentSection } from '@/components/CommentSection';
import { OtakuAtmosphere } from '@/components/OtakuAtmosphere';

function PlayerContent({ slug }: { slug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const epParam = searchParams.get('ep');
  const seasonParam = searchParams.get('season');
  const playerParam = searchParams.get('player') || '1';
  
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchEp, setSearchEp] = useState('');
  const [hasClickedPlay, setHasClickedPlay] = useState(false);

  const epNum = epParam ? Number(epParam) : 1;
  const urlSeasonNum = seasonParam ? Number(seasonParam) : 1;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasClickedPlay(false);
  }, [epNum, urlSeasonNum, playerParam, slug]);

  const [activeSeason, setActiveSeason] = useState(urlSeasonNum);
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveSeason(urlSeasonNum);
  }, [urlSeasonNum]);

  let videoSrc = '';
  let episodeTitle = '';
  let durationStr = '24m';
  let seasonNum = activeSeason;
  const isMovie = content?.type === 'movie';
  
  if (content && isMovie) {
     videoSrc = playerParam === '2' && content.videoUrl2 ? content.videoUrl2 : (content.videoUrl || '');
     durationStr = content.duration || '120m';
  } else if (content && content.episodes && content.episodes.length > 0) {
     const ep = content.episodes.find((e: any) => e.number === epNum && (e.season || 1) === seasonNum) || content.episodes[0];
     if (ep) {
       videoSrc = playerParam === '2' && ep.videoUrl2 ? ep.videoUrl2 : (ep.videoUrl || '');
       episodeTitle = ep.title ? ep.title : 'Episódio';
       durationStr = ep.duration || '24m';
       seasonNum = ep.season || 1;
     }
  }

  if (!videoSrc && content?.videoUrl) {
    videoSrc = content.videoUrl;
  }

  const { watchedSeconds, totalSeconds } = useWatchProgress({
    contentSlug: slug,
    episodeNumber: epNum,
    episodeTitle,
    seasonNumber: seasonNum,
    contentTitle: content?.title || '',
    contentImage: content?.heroImage || '',
    durationStr,
    isMovie,
    isActive: hasClickedPlay
  });

  const isAnimeContent = content?.type === 'anime' || 
                         (content?.categories && Array.isArray(content.categories) && content.categories.some((c: string) => c.toLowerCase() === 'anime')) || 
                         content?.genres?.toLowerCase().includes('anime');

  const themeColor = isAnimeContent ? '#FF3366' : '#8F44FF';
  const themeGlow = isAnimeContent ? 'rgba(255,51,102,0.4)' : 'rgba(143,68,255,0.4)';

  useEffect(() => {
    const fetchContent = async () => {
      try {
        let fetchedContent: any = null;
        const q = query(collection(db, 'contents'), where('slug', '==', slug), limit(1));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const data = doc.data();
          fetchedContent = {
            id: doc.id,
            ...data,
            heroImage: data.coverImage || data.thumbnailImage || 'https://picsum.photos/seed/hero/1920/1080',
          };

          if (data.type !== 'movie') {
            const epRef = collection(db, `contents/${doc.id}/episodes`);
            const epSnapshot = await getDocs(epRef);
            fetchedContent.episodes = epSnapshot.docs.map((epDoc: any) => ({
              id: epDoc.id,
              ...epDoc.data(),
            })).sort((a: any, b: any) => a.season === b.season ? b.number - a.number : b.season - a.season);
          }
        }

        if (!fetchedContent) {
           throw new Error("Content not found");
        }
        setContent(fetchedContent);
      } catch (e) {
         console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [slug]);

  if (loading) {
     return (
       <div className="min-h-screen bg-[#050510] text-[#D1D5DB] flex items-center justify-center">
         <div className="animate-pulse flex flex-col items-center">
           <div className={`w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mb-4 ${isAnimeContent ? 'border-[#FF3366]' : 'border-[#8F44FF]'}`}></div>
           <p className="text-[#8A93A6] font-medium">Carregando player...</p>
         </div>
       </div>
     );
  }

  if (!content) {
    return <div className="min-h-screen bg-[#050510] text-[#D1D5DB] flex items-center justify-center">Conteúdo não encontrado</div>;
  }

  const isIframeHtml = videoSrc.trim().startsWith('<iframe') || videoSrc.trim().startsWith('<div');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEp || !content.episodes) return;
    const num = Number(searchEp);
    if (!isNaN(num)) {
       const found = content.episodes.find((ep:any) => ep.number === num);
       if(found) {
         router.push(`/watch/${content.slug}?player=${playerParam}&ep=${num}`);
       } else {
         alert('Episódio não encontrado!');
       }
    }
  };

  const getFullTitle = () => {
    if (isMovie) return content.title;
    return `${content.title} Episódio ${epNum.toString().padStart(2, '0')}`;
  };

  return (
    <main className="min-h-screen bg-[#050510] text-[#D1D5DB] overflow-y-auto font-sans relative overflow-x-hidden">
       {isAnimeContent && <OtakuAtmosphere backdropUrl={content?.heroImage} />}
       
       {/* Ambient Backgound Image */}
       <div className="absolute top-0 left-0 w-full h-[600px] z-0 opacity-20 pointer-events-none mix-blend-screen">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050510]/80 to-[#050510] z-10" />
          <Image
            src={content.heroImage}
            alt="bg"
            fill
            className="object-cover object-top mask-image-radial"
            priority
          />
       </div>

       <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-10 flex flex-col lg:flex-row gap-8 relative z-10 animate-in fade-in duration-700">
         
         {/* Left Column: Player & Info */}
         <div className="flex-1 flex flex-col space-y-6">

            {/* Back Button */}
            <div className="flex items-center">
              <Link href={`/content/${content.slug}`} className="inline-flex items-center gap-2 text-[#8A93A6] hover:text-white transition-colors group">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors border border-white/5">
                   <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                </div>
                <span className="text-sm font-medium tracking-wide">Voltar para a página da obra</span>
              </Link>
            </div>
            
            {/* Main Player Box */}
            <div className="bg-[#0A0A16] rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden border border-white/5 relative z-[110]">
               {/* Title & Player Selector */}
               <div className="p-6 sm:px-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <h1 className="text-[20px] sm:text-[28px] font-display font-bold text-white leading-tight">
                    {getFullTitle()}
                 </h1>
                 <div className="flex items-center gap-3 shrink-0">
                   <Link 
                     href={`/watch/${content.slug}?player=1${!isMovie ? `&ep=${epNum}` : ''}`}
                     className={`px-6 py-2.5 rounded-full text-[13px] font-bold transition-all ${playerParam === '1' ? (isAnimeContent ? 'bg-[#FF3366] text-white shadow-[0_0_15px_rgba(255,51,102,0.4)]' : 'bg-[#8F44FF] text-white shadow-[0_0_15px_rgba(143,68,255,0.4)]') : 'bg-white/5 text-[#8A93A6] hover:bg-white/10 hover:text-white'}`}
                   >
                     PLAYER FHD
                   </Link>
                   <Link 
                     href={`/watch/${content.slug}?player=2${!isMovie ? `&ep=${epNum}` : ''}`}
                     className={`px-6 py-2.5 rounded-full text-[13px] font-bold transition-all ${playerParam === '2' ? (isAnimeContent ? 'bg-[#FF3366] text-white shadow-[0_0_15px_rgba(255,51,102,0.4)]' : 'bg-[#8F44FF] text-white shadow-[0_0_15px_rgba(143,68,255,0.4)]') : 'bg-white/5 text-[#8A93A6] hover:bg-white/10 hover:text-white'}`}
                   >
                     PLAYER 2
                   </Link>
                 </div>
               </div>

               {/* Video Frame */}
               <div className="w-full aspect-video bg-black relative flex items-center justify-center group overflow-hidden">
                 {videoSrc && hasClickedPlay ? (
                    isIframeHtml ? (
                      <div className="w-full h-full object-cover [&_iframe]:w-full [&_iframe]:h-full border-0" dangerouslySetInnerHTML={{ __html: videoSrc }} />
                    ) : (
                      <iframe src={videoSrc} allowFullScreen className="w-full h-full border-0" />
                    )
                 ) : (
                    <div 
                      className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer group/play"
                      onClick={() => {
                        if (videoSrc) setHasClickedPlay(true);
                        else alert('Vídeo não disponível ainda.');
                      }}
                    >
                      <Image
                        src={content?.episodes?.find((e:any) => e.number === epNum)?.thumbnailUrl || content.heroImage || 'https://picsum.photos/seed/bg/1920/1080'}
                        alt={content.title}
                        fill
                        className="object-cover opacity-50 group-hover/play:opacity-70 transition-all duration-700 group-hover/play:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none mix-blend-multiply" />
                      
                      <div className={`w-20 h-20 sm:w-24 sm:h-24 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full flex items-center justify-center z-10 shadow-[0_0_40px_rgba(0,0,0,0.5)] group-hover/play:scale-110 transition-all duration-500 relative ${
                        isAnimeContent 
                          ? 'group-hover/play:bg-[#FF3366] group-hover/play:border-[#FF3366] group-hover/play:shadow-[0_0_60px_rgba(255,51,102,0.6)]' 
                          : 'group-hover/play:bg-[#8F44FF] group-hover/play:border-[#8F44FF] group-hover/play:shadow-[0_0_60px_rgba(143,68,255,0.6)]'
                      }`}>
                        <Play className="size-10 sm:size-12 fill-current ml-2" />
                      </div>
                      
                      {/* Fake Controls */}
                      <div className="absolute bottom-0 inset-x-0 p-4 sm:px-8 sm:py-6 flex flex-col gap-4 opacity-50 relative z-10 pointer-events-none bg-gradient-to-t from-black to-transparent">
                          <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                             <div className={`w-0 h-full ${isAnimeContent ? 'bg-[#FF3366]' : 'bg-[#8F44FF]'}`} />
                          </div>
                      </div>
                    </div>
                 )}
               </div>
               
               {/* Bottom Control Bar */}
               <div className="p-4 sm:px-8 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-[#0A0A16]">
                  <div className="flex items-center gap-8">
                    <button className="flex items-center gap-2.5 text-[13px] font-bold text-[#8A93A6] hover:text-white transition-colors group">
                      <div className="p-1.5 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                        <Menu className="size-4" />
                      </div>
                      <span className="uppercase tracking-widest">INFO</span>
                    </button>
                    <button className="flex items-center gap-2.5 text-[13px] font-bold text-[#8A93A6] hover:text-[#EF4444] transition-colors group">
                      <div className="p-1.5 rounded-full bg-white/5 group-hover:bg-[#EF4444]/20 transition-colors">
                        <AlertCircle className="size-4 group-hover:text-[#EF4444]" />
                      </div>
                      <span className="uppercase tracking-widest">REPORTAR ERRO</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                    {/* Previous Button */}
                    {content.episodes && content.episodes.some((e:any) => e.number === epNum - 1 && (e.season || 1) === seasonNum) && (
                      <Link 
                        href={`/watch/${content.slug}?player=${playerParam}&season=${seasonNum}&ep=${epNum - 1}`}
                        className="flex flex-1 sm:flex-none items-center justify-center gap-2 text-[13px] font-bold text-white bg-white/5 hover:bg-white/10 py-2.5 px-6 rounded-full transition-colors border border-white/5 group"
                      >
                        <ChevronLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="uppercase tracking-widest">ANT</span>
                      </Link>
                    )}
                    
                    <button className="flex items-center justify-center w-11 h-11 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/5 text-[#8A93A6] hover:text-white">
                      <ListVideo className="size-5" />
                    </button>

                    {/* Next Button */}
                    {content.episodes && content.episodes.some((e:any) => e.number === epNum + 1 && (e.season || 1) === seasonNum) && (
                      <Link 
                        href={`/watch/${content.slug}?player=${playerParam}&season=${seasonNum}&ep=${epNum + 1}`}
                        className="flex flex-1 sm:flex-none items-center justify-center gap-2 text-[13px] font-bold text-[#050510] bg-white hover:bg-gray-200 py-2.5 px-6 rounded-full transition-colors group"
                      >
                        <span className="uppercase tracking-widest">PRÓX</span>
                        <ChevronLeft className="size-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    )}
                  </div>
               </div>
            </div>

            {/* Context Actions / Notice under player */}
            <div className="flex flex-col gap-3 mt-2">
              <div className="bg-[#131520] border border-white/5 px-6 py-4 rounded-xl flex items-start sm:items-center gap-4">
                <Info className={`size-5 mt-0.5 sm:mt-0 shrink-0 ${isAnimeContent ? 'text-[#FF3366]' : 'text-[#8F44FF]'}`} />
                <p className="text-sm text-[#8A93A6]">
                  <strong className="text-white">DICA PREMIUM:</strong> Ao iniciar o player, o progresso será salvo automaticamente em seu <span className={isAnimeContent ? 'text-[#FF3366]' : 'text-[#A661FF]'}>Continuar Assistindo</span>.
                </p>
              </div>
              
              <div className="bg-[#131520] border border-amber-500/20 px-6 py-4 rounded-xl flex items-start sm:items-center gap-4">
                <div className="w-5 h-5 shrink-0 rounded-full bg-amber-500/20 flex items-center justify-center mt-0.5 sm:mt-0">
                  <span className="text-amber-500 font-black text-xs">!</span>
                </div>
                <p className="text-sm text-[#8A93A6] leading-relaxed">
                  <strong className="text-amber-500">AVISO SOBRE ANÚNCIOS:</strong> O player acima é fornecido por servidores de terceiros. Nós não temos controle sobre pop-ups ou anúncios que possam abrir ao clicar. <strong className="text-white">Recomendamos fechar as novas guias imediatamente e retornar ao player.</strong>
                </p>
              </div>
            </div>

            {/* Comments Section */}
            <div className="mt-12 pt-8 border-t border-white/5">
              <div className="flex items-center gap-3 text-white font-display font-bold text-[24px] mb-8 tracking-wide">
                 <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${themeColor}33`, boxShadow: `0 0 15px ${themeColor}33` }}>
                    <MessageSquare className="size-5 fill-current" style={{ color: themeColor }} />
                 </div>
                 COMENTÁRIOS
              </div>
              <CommentSection contentId={slug} theme={isAnimeContent ? 'anime' : 'default'} />
            </div>

         </div>

         {/* Right Column: Episode List */}
         {!isMovie && content.episodes && content.episodes.length > 0 && (
           <div className="w-full lg:w-[350px] xl:w-[400px] shrink-0 flex flex-col animate-in fade-in slide-in-from-right-8 duration-700 delay-150 fill-mode-both">
              <div className="bg-[#0A0A16] rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 flex flex-col h-[600px] lg:h-[750px] overflow-hidden">
                
                {/* Season Selector */}
                {content.seasons > 1 && (
                  <div className="p-5 border-b border-white/5 shrink-0 bg-white/5">
                     <select 
                        value={activeSeason} 
                        onChange={(e) => setActiveSeason(Number(e.target.value))}
                        className="w-full bg-[#0A0A16] text-[#D1D5DB] text-[14px] font-bold p-3.5 rounded-[12px] outline-none border border-white/10 appearance-none cursor-pointer hover:border-white/20 transition-colors"
                     >
                       {Array.from({ length: content.seasons }).map((_, i) => (
                         <option key={i+1} value={i+1}>
                           {i + 1}ª Temporada
                         </option>
                       ))}
                     </select>
                  </div>
                )}
                
                {/* Search Bar */}
                <div className="p-5 border-b border-white/5 shrink-0 bg-white/5">
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <input 
                      type="text" 
                      value={searchEp}
                      onChange={(e) => setSearchEp(e.target.value)}
                      placeholder="Número do EP (ex: 5) + ENTER"
                      className={`w-full bg-[#0A0A16] border border-white/10 rounded-[12px] text-white text-[14px] font-medium placeholder-[#666B7D] outline-none pl-5 pr-12 py-3.5 transition-colors ${
                        isAnimeContent ? 'focus:border-[#FF3366]/50' : 'focus:border-[#8F44FF]/50'
                      }`}
                    />
                    <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666B7D] hover:text-white transition-colors p-1">
                      <Search className="size-4.5" />
                    </button>
                  </form>
                </div>

                {/* List Items */}
                <div className="flex-1 overflow-y-auto scrollbar-hide py-3 px-3">
                  {content.episodes
                    .filter((ep: any) => (ep.season || 1) === activeSeason)
                    .map((ep: any) => {
                    const isActive = ep.number === epNum && (ep.season || 1) === seasonNum;
                    return (
                       <Link 
                         key={ep.id}
                         href={`/watch/${content.slug}?player=${playerParam}&season=${activeSeason}&ep=${ep.number}`}
                         className={`flex items-center px-5 py-4 mb-2 rounded-[12px] transition-all group ${isActive ? (isAnimeContent ? 'bg-[#FF3366]/10 border border-[#FF3366]/30' : 'bg-[#8F44FF]/10 border border-[#8F44FF]/30') : 'hover:bg-white/5 border border-transparent'}`}
                       >
                         <span className={`text-[18px] font-display font-bold w-12 shrink-0 ${isActive ? (isAnimeContent ? 'text-[#FF3366]' : 'text-[#A661FF]') : 'text-[#8A93A6] group-hover:text-white transition-colors'}`}>
                           {ep.number.toString().padStart(2, '0')}
                         </span>
                         <span className={`text-[14px] line-clamp-2 ${isActive ? 'text-white font-bold' : 'text-[#8A93A6] font-medium group-hover:text-[#D1D5DB] transition-colors'}`}>
                           {ep.title || 'Episódio sem título'}
                         </span>
                         {isActive && (
                            <Play className={`size-4 fill-current ml-auto shrink-0 ${isAnimeContent ? 'text-[#FF3366]' : 'text-[#A661FF]'}`} />
                         )}
                       </Link>
                    )
                  })}
                </div>
              </div>
           </div>
         )}
         
       </div>
    </main>
  );
}

export default function PlayerPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  if (!slug) return null;

  return (
    <Suspense fallback={
       <div className="min-h-screen bg-[#050510] text-[#D1D5DB] flex items-center justify-center">
         <div className="animate-pulse flex flex-col items-center">
           <div className="w-12 h-12 rounded-full border-4 border-[#8F44FF] border-t-transparent animate-spin mb-4"></div>
           <p className="text-[#8A93A6] font-medium">Carregando player...</p>
         </div>
       </div>
    }>
      <PlayerContent slug={slug} />
    </Suspense>
  );
}
