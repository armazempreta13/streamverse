'use client';

import React, { Suspense, useEffect, useState, useRef, useMemo } from 'react';
import Image from 'next/image';
import { Play, AlertCircle, Menu, Search, MessageSquare, ListVideo, ArrowLeft, ChevronLeft, ChevronRight, Maximize, Settings, FastForward, X } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { collection, query, where, getDocs, limit } from 'firebase/firestore/lite';
import { db } from '@/lib/firebase';
import { useWatchProgress } from '@/hooks/useWatchProgress';
import { CommentSection } from '@/components/CommentSection';
import { OtakuAtmosphere } from '@/components/OtakuAtmosphere';

function PlayerContent({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // States that replace URL navigation for Binge Watching
  const [epNum, setEpNum] = useState(searchParams.get('ep') ? Number(searchParams.get('ep')) : 1);
  const [seasonNum, setSeasonNum] = useState(searchParams.get('season') ? Number(searchParams.get('season')) : 1);
  const [playerParam, setPlayerParam] = useState(searchParams.get('player') || '1');
  
  const [searchEp, setSearchEp] = useState('');
  const [hasClickedPlay, setHasClickedPlay] = useState(false);
  const [autoPlayCanceled, setAutoPlayCanceled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Sync URL smoothly without full page reload
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('ep', epNum.toString());
    url.searchParams.set('season', seasonNum.toString());
    url.searchParams.set('player', playerParam);
    window.history.replaceState({}, '', url.toString());
  }, [epNum, seasonNum, playerParam]);

  // Reset play state and cancellations when episode changes
  useEffect(() => {
    setHasClickedPlay(false);
    setAutoPlayCanceled(false);
  }, [epNum, seasonNum, playerParam, slug]);

  const isMovie = content?.type === 'movie';
  
  // Memoized current episode data
  const currentEpData = useMemo(() => {
    if (!content) return null;
    if (isMovie) return content;
    return content.episodes?.find((e: any) => e.number === epNum && (e.season || 1) === seasonNum) || content.episodes?.[0];
  }, [content, epNum, seasonNum, isMovie]);

  // Memoized next episode data
  const nextEpData = useMemo(() => {
    if (!content || isMovie || !content.episodes) return null;
    return content.episodes.find((e: any) => e.number === epNum + 1 && (e.season || 1) === seasonNum);
  }, [content, epNum, seasonNum, isMovie]);

  const videoSrc = (playerParam === '2' && currentEpData?.videoUrl2) ? currentEpData.videoUrl2 : (currentEpData?.videoUrl || '');
  const episodeTitle = isMovie ? '' : (currentEpData?.title || 'Episódio');
  const durationStr = currentEpData?.duration || (isMovie ? '120m' : '24m');
  const thumbnail = currentEpData?.thumbnailUrl || content?.heroImage || 'https://picsum.photos/seed/bg/1920/1080';

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
            })).sort((a: any, b: any) => (a.season || 1) === (b.season || 1) ? a.number - b.number : (a.season || 1) - (b.season || 1));
          }
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

  // Fullscreen Listener
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current?.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };

  // AutoPlay Logic
  const timeLeft = Math.max(0, totalSeconds - watchedSeconds);
  const showNextEpOverlay = hasClickedPlay && !isMovie && nextEpData && timeLeft <= 15 && timeLeft > 0 && !autoPlayCanceled;
  
  useEffect(() => {
    if (showNextEpOverlay && timeLeft === 0 && !autoPlayCanceled) {
      handleNextEpisode();
    }
  }, [timeLeft, showNextEpOverlay, autoPlayCanceled]);

  const handleNextEpisode = () => {
    if (nextEpData) {
      setEpNum(nextEpData.number);
      setSeasonNum(nextEpData.season || seasonNum);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEp || !content.episodes) return;
    const num = Number(searchEp);
    const found = content.episodes.find((ep:any) => ep.number === num && (ep.season || 1) === seasonNum);
    if(found) setEpNum(num);
    else alert('Episódio não encontrado nesta temporada!');
  };

  if (loading) {
     return (
       <div className="min-h-screen bg-[#050510] flex items-center justify-center">
         <div className="w-12 h-12 rounded-full border-4 border-[#FF3366] border-t-transparent animate-spin"></div>
       </div>
     );
  }

  if (!content) return <div className="min-h-screen bg-[#050510] text-[#D1D5DB] flex items-center justify-center">Conteúdo não encontrado</div>;

  const isIframeHtml = videoSrc.trim().startsWith('<iframe') || videoSrc.trim().startsWith('<div');

  return (
    <main className="min-h-screen bg-[#050510] text-[#D1D5DB] font-sans relative overflow-x-hidden">
       {isAnimeContent && <OtakuAtmosphere backdropUrl={content?.heroImage} />}
       
       {/* Ambient Ambient Image */}
       <div className="absolute top-0 left-0 w-full h-[600px] z-0 opacity-20 pointer-events-none mix-blend-screen">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050510]/80 to-[#050510] z-10" />
          <Image src={content.heroImage} alt="bg" fill className="object-cover object-top mask-image-radial" priority />
       </div>

       <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-10 flex flex-col lg:flex-row gap-8 relative z-10 animate-in fade-in duration-700">
         
         <div className="flex-1 flex flex-col space-y-6">
            <Link href={`/content/${content.slug}`} className="inline-flex w-fit items-center gap-2 text-[#8A93A6] hover:text-white transition-colors group">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors border border-white/5">
                 <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
              </div>
              <span className="text-sm font-medium tracking-wide">Voltar para a página da obra</span>
            </Link>
            
            <div 
              ref={playerContainerRef}
              className={`bg-[#0A0A16] rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden border border-white/5 relative z-[110] transition-all duration-500 ${isFullscreen ? 'w-screen h-screen rounded-none border-none fixed inset-0 z-[9999]' : ''}`}
            >
               {!isFullscreen && (
                 <div className="p-6 sm:px-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                   <h1 className="text-[20px] sm:text-[28px] font-display font-bold text-white leading-tight">
                      {isMovie ? content.title : `${content.title} - Episódio ${epNum.toString().padStart(2, '0')}`}
                   </h1>
                   <div className="flex items-center gap-3 shrink-0">
                     <button onClick={() => setPlayerParam('1')} className={`px-6 py-2.5 rounded-full text-[13px] font-bold transition-all ${playerParam === '1' ? (isAnimeContent ? 'bg-[#FF3366] text-white shadow-[0_0_15px_rgba(255,51,102,0.4)]' : 'bg-[#8F44FF] text-white shadow-[0_0_15px_rgba(143,68,255,0.4)]') : 'bg-white/5 text-[#8A93A6] hover:bg-white/10 hover:text-white'}`}>PLAYER FHD</button>
                     <button onClick={() => setPlayerParam('2')} className={`px-6 py-2.5 rounded-full text-[13px] font-bold transition-all ${playerParam === '2' ? (isAnimeContent ? 'bg-[#FF3366] text-white shadow-[0_0_15px_rgba(255,51,102,0.4)]' : 'bg-[#8F44FF] text-white shadow-[0_0_15px_rgba(143,68,255,0.4)]') : 'bg-white/5 text-[#8A93A6] hover:bg-white/10 hover:text-white'}`}>PLAYER 2</button>
                   </div>
                 </div>
               )}

               <div className={`w-full bg-black relative flex items-center justify-center group/player overflow-hidden ${isFullscreen ? 'flex-1' : 'aspect-video'}`}>
                 {videoSrc && hasClickedPlay ? (
                    <>
                      {isIframeHtml ? (
                        <div className="w-full h-full object-cover [&_iframe]:w-full [&_iframe]:h-full border-0" dangerouslySetInnerHTML={{ __html: videoSrc }} />
                      ) : (
                        <iframe src={videoSrc} allowFullScreen className="w-full h-full border-0" />
                      )}
                      
                      {/* BINGE WATCH OVERLAY */}
                      {showNextEpOverlay && (
                        <div className="absolute bottom-10 right-10 z-[1000] w-[320px] sm:w-[380px] bg-[#0A0A16]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-in slide-in-from-right-8 fade-in duration-500">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="text-white font-bold text-sm tracking-wide">PRÓXIMO EPISÓDIO</h4>
                              <p className="text-[#FF3366] text-[12px] font-bold mt-0.5 animate-pulse">Iniciando em {timeLeft} segundos...</p>
                            </div>
                            <button onClick={() => setAutoPlayCanceled(true)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                              <X className="size-4 text-[#8A93A6]" />
                            </button>
                          </div>
                          
                          <div className="flex gap-4 p-2 bg-white/5 rounded-xl border border-white/5">
                            <div className="relative w-28 h-16 rounded-lg overflow-hidden shrink-0">
                              <Image src={nextEpData.thumbnailUrl || content.heroImage} alt="Next" fill className="object-cover" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Play className="size-6 text-white/80" />
                              </div>
                            </div>
                            <div className="flex flex-col justify-center min-w-0">
                              <p className="text-white text-[13px] font-bold truncate">EP {nextEpData.number.toString().padStart(2, '0')}</p>
                              <p className="text-[#8A93A6] text-[11px] font-medium truncate">{nextEpData.title}</p>
                              <p className="text-[#5C6370] text-[10px] mt-1 uppercase tracking-tighter">{nextEpData.duration || '24m'}</p>
                            </div>
                          </div>
                          
                          <button 
                            onClick={handleNextEpisode}
                            className="w-full mt-4 bg-white text-black font-black text-xs py-3 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-[0_10px_20px_rgba(255,255,255,0.1)]"
                          >
                            <FastForward className="size-4 fill-current" />
                            ASSISTIR AGORA
                          </button>
                          
                          {/* Progress bar line */}
                          <div className="absolute bottom-0 left-0 h-1 bg-[#FF3366] rounded-b-2xl transition-all duration-1000 ease-linear" style={{ width: `${(timeLeft / 15) * 100}%` }} />
                        </div>
                      )}

                      {/* Floating In-Player Controls (Optional enhancement) */}
                      {isFullscreen && (
                        <div className="absolute top-6 left-6 z-[200] flex items-center gap-4 opacity-0 group-hover/player:opacity-100 transition-opacity duration-300">
                           <button onClick={toggleFullscreen} className="p-3 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-all">
                              <X className="size-5" />
                           </button>
                           <div className="flex flex-col">
                              <h2 className="text-white font-bold text-lg drop-shadow-md">{content.title}</h2>
                              <p className="text-[#8A93A6] text-sm font-medium">Temporada {seasonNum} • Episódio {epNum}</p>
                           </div>
                        </div>
                      )}
                    </>
                 ) : (
                    <div 
                      className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer group/play"
                      onClick={() => { if (videoSrc) setHasClickedPlay(true); else alert('Vídeo não disponível ainda.'); }}
                    >
                      <Image src={thumbnail} alt={content.title} fill className="object-cover opacity-50 group-hover/play:opacity-70 transition-all duration-700 group-hover/play:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 mix-blend-multiply" />
                      <div className={`w-24 h-24 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full flex items-center justify-center z-10 shadow-[0_0_40px_rgba(0,0,0,0.5)] group-hover/play:scale-110 transition-all duration-500 relative ${isAnimeContent ? 'group-hover/play:bg-[#FF3366] group-hover/play:border-[#FF3366] group-hover/play:shadow-[0_0_40px_rgba(255,51,102,0.4)]' : 'group-hover/play:bg-[#8F44FF] group-hover/play:border-[#8F44FF] group-hover/play:shadow-[0_0_40px_rgba(143,68,255,0.4)]'}`}>
                        <Play className="size-12 fill-current ml-2" />
                      </div>
                    </div>
                 )}
               </div>
               
               {/* Custom Player Control Bar */}
               <div className="p-4 sm:px-8 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-[#0A0A16]">
                  <div className="flex items-center gap-8">
                    <button onClick={() => setShowSidebar(!showSidebar)} className={`flex items-center gap-2.5 text-[13px] font-bold transition-colors group ${showSidebar ? 'text-white' : 'text-[#8A93A6] hover:text-white'}`}>
                      <div className={`p-1.5 rounded-full bg-white/5 transition-colors ${showSidebar ? 'bg-white/10 text-white' : 'group-hover:bg-white/10'}`}>
                        <ListVideo className="size-4" />
                      </div>
                      <span className="uppercase tracking-widest hidden sm:inline">EPISÓDIOS</span>
                    </button>
                    <button className="flex items-center gap-2.5 text-[13px] font-bold text-[#8A93A6] hover:text-[#EF4444] transition-colors group">
                      <div className="p-1.5 rounded-full bg-white/5 group-hover:bg-[#EF4444]/20 transition-colors">
                        <AlertCircle className="size-4 group-hover:text-[#EF4444]" />
                      </div>
                      <span className="uppercase tracking-widest hidden sm:inline">REPORTAR</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                    {/* Previous Button */}
                    {content.episodes?.some((e:any) => e.number === epNum - 1 && (e.season || 1) === seasonNum) && (
                      <button 
                        onClick={() => setEpNum(epNum - 1)}
                        className="flex flex-1 sm:flex-none items-center justify-center gap-2 text-[12px] font-black text-white bg-white/5 hover:bg-white/10 py-3 px-6 rounded-full transition-all border border-white/5 group active:scale-95"
                      >
                        <ChevronLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="uppercase tracking-widest">ANTERIOR</span>
                      </button>
                    )}
                    
                    {/* Next Button */}
                    {content.episodes?.some((e:any) => e.number === epNum + 1 && (e.season || 1) === seasonNum) && (
                      <button 
                        onClick={() => setEpNum(epNum + 1)}
                        className={`flex flex-1 sm:flex-none items-center justify-center gap-2 text-[12px] font-black py-3 px-6 rounded-full transition-all group active:scale-95 ${isAnimeContent ? 'bg-[#FF3366] text-white shadow-[0_10px_20px_rgba(255,51,102,0.2)]' : 'bg-[#8F44FF] text-white shadow-[0_10px_20px_rgba(143,68,255,0.2)]'}`}
                      >
                        <span className="uppercase tracking-widest text-[#050510] font-black">PRÓXIMO</span>
                        <ChevronRight className="size-4 text-[#050510] group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}

                    <div className="w-[1px] h-6 bg-white/10 mx-2 hidden sm:block" />
                    
                    <button onClick={toggleFullscreen} className="flex items-center justify-center w-11 h-11 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/5 text-[#8A93A6] hover:text-white">
                      <Maximize className="size-5" />
                    </button>
                  </div>
               </div>
            </div>

            {/* Resume progress bar / notification */}
            <div className="flex flex-col gap-3 mt-2">
              {hasClickedPlay && watchedSeconds > 30 && (
                <div className="bg-[#131520] border border-[#FF3366]/20 px-6 py-4 rounded-2xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isAnimeContent ? 'bg-[#FF3366]/10 text-[#FF3366]' : 'bg-[#8F44FF]/10 text-[#8F44FF]'}`}>
                      <Play className="size-5 fill-current ml-0.5" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Resumo de Reprodução</p>
                      <p className="text-[#8A93A6] text-xs mt-0.5">
                        Você parou em <strong className="text-white">{Math.floor(watchedSeconds / 60)}m {Math.floor(watchedSeconds % 60)}s</strong>.
                        <span className="hidden sm:inline"> Use a barra do vídeo para ajustar se necessário.</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-[#131520] border border-amber-500/20 px-6 py-4 rounded-2xl flex items-start sm:items-center gap-4">
                <div className="w-5 h-5 shrink-0 rounded-full bg-amber-500/20 flex items-center justify-center mt-0.5 sm:mt-0"><span className="text-amber-500 font-black text-xs">!</span></div>
                <p className="text-xs sm:text-sm text-[#8A93A6] leading-relaxed font-medium">
                  <strong className="text-amber-500">AVISO:</strong> O player é fornecido por servidores externos. <strong className="text-white">Recomendamos fechar pop-ups e abas extras imediatamente.</strong>
                </p>
              </div>
            </div>

            {/* Comments Section */}
            <div className="mt-8 pt-10 border-t border-white/5">
              <CommentSection contentId={slug} theme={isAnimeContent ? 'anime' : 'default'} />
            </div>

         </div>

         {/* RIGHT SIDEBAR: EPISODE LIST (Binge Panel) */}
         {!isMovie && content.episodes && (
           <div className={`w-full lg:w-[350px] xl:w-[400px] shrink-0 flex flex-col animate-in fade-in slide-in-from-right-8 duration-700 delay-150 fill-mode-both ${showSidebar ? 'block' : 'lg:block hidden'}`}>
              <div className="bg-[#0A0A16] rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 flex flex-col h-[700px] lg:h-[800px] overflow-hidden sticky top-10">
                
                {/* Header Side Panel */}
                <div className="p-6 bg-[#131520] border-b border-white/5">
                  <h2 className="text-white font-display font-black text-xl tracking-tight mb-4">EPISÓDIOS</h2>
                  
                  {/* Season Selector */}
                  {content.seasons > 1 && (
                    <div className="mb-4">
                       <select 
                          value={seasonNum} 
                          onChange={(e) => setSeasonNum(Number(e.target.value))}
                          className="w-full bg-[#0A0A16] text-[#D1D5DB] text-[13px] font-black p-4 rounded-[16px] outline-none border border-white/10 appearance-none cursor-pointer hover:border-white/20 transition-all focus:ring-1 focus:ring-[#FF3366]"
                       >
                         {Array.from({ length: content.seasons }).map((_, i) => (
                           <option key={i+1} value={i+1}>{i + 1}ª TEMPORADA</option>
                         ))}
                       </select>
                    </div>
                  )}
                  
                  {/* Search EP */}
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <input 
                      type="text" 
                      value={searchEp}
                      onChange={(e) => setSearchEp(e.target.value)}
                      placeholder="Ir para o episódio..."
                      className="w-full bg-[#0A0A16] border border-white/10 rounded-[16px] text-white text-[13px] font-bold placeholder-[#5C6370] outline-none pl-5 pr-12 py-4 transition-all focus:border-[#FF3366]/50"
                    />
                    <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5C6370] hover:text-white transition-colors p-1">
                      <Search className="size-4" />
                    </button>
                  </form>
                </div>

                {/* List Items */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent py-4 px-3">
                  {content.episodes
                    .filter((ep: any) => (ep.season || 1) === seasonNum)
                    .map((ep: any) => {
                    const isActive = ep.number === epNum && (ep.season || 1) === seasonNum;
                    return (
                       <button 
                         key={ep.id}
                         onClick={() => setEpNum(ep.number)}
                         className={`w-full flex items-center gap-4 px-4 py-4 mb-2 rounded-[20px] transition-all group relative overflow-hidden ${isActive ? (isAnimeContent ? 'bg-[#FF3366]/10 border border-[#FF3366]/30 shadow-[0_0_20px_rgba(255,51,102,0.1)]' : 'bg-[#8F44FF]/10 border border-[#8F44FF]/30') : 'hover:bg-white/5 border border-transparent'}`}
                       >
                         {isActive && <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#FF3366] rounded-full shadow-[0_0_10px_#FF3366]" />}
                         
                         <div className="relative w-24 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10 group-hover:border-white/20 transition-colors">
                           <Image src={ep.thumbnailUrl || content.heroImage} alt="Thumb" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                           <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                           {isActive && <div className="absolute inset-0 bg-[#FF3366]/20 flex items-center justify-center"><Play className="size-6 fill-white text-white" /></div>}
                         </div>

                         <div className="flex flex-col items-start min-w-0 flex-1">
                           <span className={`text-[11px] font-black tracking-widest uppercase mb-1 ${isActive ? 'text-[#FF3366]' : 'text-[#5C6370]'}`}>EP {ep.number.toString().padStart(2, '0')}</span>
                           <h3 className={`text-[13px] line-clamp-1 transition-colors ${isActive ? 'text-white font-bold' : 'text-[#8A93A6] font-medium group-hover:text-white'}`}>
                             {ep.title || 'Episódio sem título'}
                           </h3>
                           <p className="text-[10px] text-[#5C6370] font-bold mt-1.5 uppercase">{ep.duration || '24 min'}</p>
                         </div>
                       </button>
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
       <div className="min-h-screen bg-[#050510] flex items-center justify-center">
         <div className="w-12 h-12 rounded-full border-4 border-[#FF3366] border-t-transparent animate-spin"></div>
       </div>
    }>
      <PlayerContent slug={slug} />
    </Suspense>
  );
}
