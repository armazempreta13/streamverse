'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Play, Plus, Check, ChevronLeft, Star, ThumbsUp, X, MonitorPlay, Maximize, FastForward, Info } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import clsx from 'clsx';
import { ContentTabs } from './ContentTabs';
import { SpidermanAnimation } from '@/components/SpidermanAnimation';
import { AmbientLighting } from '@/components/ambient-lighting';
import { collection, query, where, getDocs, limit, doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore/lite';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export default function ContentPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useAuth();
  
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<any[]>([]);
  const [isInList, setIsInList] = useState(false);
  const [isListLoading, setIsListLoading] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  // Integrated Player States
  const [activeEp, setActiveEp] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerType, setPlayerType] = useState('1');
  const playerRef = useRef<HTMLDivElement>(null);

  // Close trailer modal on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowTrailer(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const fetchListStatus = async () => {
      if (!user || !content) return;
      try {
        const docRef = doc(db, 'users', user.uid, 'watchlist', content.slug);
        const docSnap = await getDoc(docRef);
        setIsInList(docSnap.exists());
      } catch (err) {
        console.error("Error checking list status", err);
      }
    };
    fetchListStatus();
  }, [user, content]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        let fetchedContent: any = null;
        const q = query(collection(db, 'contents'), where('slug', '==', slug), limit(1));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const contentDoc = snapshot.docs[0];
          const data = contentDoc.data();
          
          fetchedContent = {
            id: contentDoc.id,
            ...data,
            heroImage: data.coverImage || data.thumbnailImage || 'https://picsum.photos/seed/hero/1920/1080',
            posterImage: data.thumbnailImage || data.coverImage || 'https://picsum.photos/seed/poster/400/600',
            originalTitle: data.title,
            genres: Array.isArray(data.categories) ? data.categories : (typeof data.categories === 'string' ? data.categories.split(',').map((c:string) => c.trim()) : []),
            score: data.score || '9.0',
            reviews: data.reviews || '10K+',
            relevance: data.relevance || '95%',
            relatedSlugs: data.relatedSlugs || [],
            seasons: data.seasons || 0,
            duration: data.duration || '',
            description: data.description || '',
          };

          if (data.type !== 'movie') {
            const epRef = collection(db, `contents/${contentDoc.id}/episodes`);
            const epSnapshot = await getDocs(epRef);
            fetchedContent.episodes = epSnapshot.docs.map((epDoc: any) => ({
              id: epDoc.id,
              ...epDoc.data(),
              thumbnail: epDoc.data().thumbnailUrl || 'https://picsum.photos/seed/ep/300/200'
            })).sort((a: any, b: any) => (a.season || 1) === (b.season || 1) ? a.number - b.number : (a.season || 1) - (b.season || 1));
          }
        }

        setContent(fetchedContent);
      } catch(error) {
        console.error("Firebase error", error);
        setContent(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchContent();
  }, [slug]);

  const handleToggleList = async () => {
    if (!user) { alert("Faça login para salvar na lista."); return; }
    if (!content || isListLoading) return;
    setIsListLoading(true);
    try {
      const docRef = doc(db, 'users', user.uid, 'watchlist', content.slug);
      if (isInList) { await deleteDoc(docRef); setIsInList(false); }
      else { await setDoc(docRef, { title: content.title, slug: content.slug, posterImage: content.posterImage, type: content.type, addedAt: serverTimestamp() }); setIsInList(true); }
    } catch (err) { console.error(err); } finally { setIsListLoading(false); }
  };

  const handleEpisodeSelect = (ep: any) => {
    setActiveEp(ep);
    setIsPlaying(true);
    setTimeout(() => {
      playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleQuickPlay = () => {
    if (content.type === 'movie') {
      setActiveEp(content);
      setIsPlaying(true);
    } else if (content.episodes && content.episodes.length > 0) {
      handleEpisodeSelect(content.episodes[0]);
    }
  };

  // Build YouTube embed URL from any YouTube link format
  const buildTrailerEmbedUrl = (url: string): string => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) return url.replace('watch?v=', 'embed/').split('&')[0] + '?autoplay=1&rel=0';
    if (url.includes('youtu.be/')) return 'https://www.youtube.com/embed/' + url.split('youtu.be/')[1].split('?')[0] + '?autoplay=1&rel=0';
    if (url.includes('youtube.com/embed/')) return url + (url.includes('?') ? '&autoplay=1' : '?autoplay=1');
    return url;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050510] text-white flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col w-full md:ml-[80px] overflow-y-auto h-screen relative">
          <React.Suspense fallback={null}><Navbar /></React.Suspense>
          <div className="flex-1 flex items-center justify-center pb-20 md:pb-0">
            <div className="w-12 h-12 rounded-full border-4 border-[#FF3366] border-t-transparent animate-spin"></div>
          </div>
        </div>
      </main>
    );
  }

  if (!content) return <div className="min-h-screen bg-[#050510] text-white flex items-center justify-center">404 - Conteúdo não encontrado</div>;

  const videoSrc = (playerType === '2' && activeEp?.videoUrl2) ? activeEp.videoUrl2 : (activeEp?.videoUrl || '');
  const isIframeHtml = videoSrc?.trim().startsWith('<iframe') || videoSrc?.trim().startsWith('<div');

  return (
    <main className="min-h-screen bg-[#0A0C10] text-white flex flex-col font-sans relative overflow-x-hidden">
      <AmbientLighting 
        imageUrl={content.posterImage} 
        contentId={content.id} 
        contentType={content.type === 'anime' ? 'anime' : (content.type === 'movie' ? 'movie' : 'series')} 
        genres={content.genres || []}
      />
      <Sidebar />
      <SpidermanAnimation title={content.title || ''} slug={slug} />
      
      <div className="flex-1 flex flex-col w-full md:ml-[80px] relative">
        <div className="relative z-[100]">
          <React.Suspense fallback={null}><Navbar /></React.Suspense>
        </div>

        {/* Hero Banner Section */}
        <div className="relative w-full flex items-center pt-24 pb-12 md:pt-28 md:pb-24 lg:pb-32">
          {/* Background Backdrop */}
          <div className="absolute inset-0 z-0 opacity-40">
            <Image src={content.heroImage} alt="bg" fill className="object-cover object-top scale-105" priority unoptimized />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0C10] via-[#0A0C10]/70 to-transparent" />
          </div>

          <div className="relative z-10 max-w-[1600px] w-full mx-auto px-4 md:px-8 flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-16">
            
            {/* Poster Image */}
            <div className="shrink-0 w-[160px] sm:w-[220px] lg:w-[340px] animate-in fade-in slide-in-from-left-10 duration-1000">
               <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.9)] border border-white/10 relative group ring-1 ring-white/5">
                  <Image src={content.posterImage} alt={content.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               </div>
            </div>

            {/* Info Details */}
            <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left pt-4 lg:pt-8 animate-in fade-in slide-in-from-right-10 duration-1000">
               
               {/* Badges */}
               <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6">
                  <span className="bg-white/5 backdrop-blur-md px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] rounded-full border border-white/10 text-[#FF3366]">
                    {content.type?.toUpperCase()}
                  </span>
                  <span className="flex items-center gap-1.5 font-black bg-[#FBBF24]/10 px-4 py-1.5 rounded-full border border-[#FBBF24]/20 text-[#FBBF24]">
                    <Star className="size-4 fill-current drop-shadow-md" /> {content.score}
                  </span>
                  <span className="flex items-center gap-1.5 font-black bg-[#10B981]/10 px-4 py-1.5 rounded-full border border-[#10B981]/20 text-[#10B981]">
                    <ThumbsUp className="size-4 drop-shadow-md" /> {content.relevance}
                  </span>
                  <span className="bg-white/5 backdrop-blur-md px-4 py-1.5 text-sm font-bold rounded-full border border-white/10 text-white">
                    {content.year || 'N/D'}
                  </span>
                  <span className="bg-white/5 backdrop-blur-md px-4 py-1.5 text-sm font-bold rounded-full border border-white/10 text-white">
                    {content.seasons ? `${content.seasons} Temporadas` : content.duration}
                  </span>
               </div>

               {/* Title */}
               <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black font-display leading-[1.1] mb-5 drop-shadow-2xl">
                 {content.title}
               </h1>

               {/* Genres */}
               <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-8">
                 {content.genres.map((g: string) => g && g !== '' ? (
                   <span key={g} className="px-3 py-1 rounded-lg text-xs font-bold transition-colors border bg-white/[0.03] border-white/5 text-white/70 hover:text-white">
                     {g}
                   </span>
                 ) : null)}
               </div>

               {/* Synopsis */}
               <p className="text-base sm:text-lg text-[#8A93A6] leading-relaxed max-w-4xl mb-10 font-medium">
                 {content.description || 'Sinopse não disponível para este idioma. Estamos trabalhando para atualizar nosso banco de dados.'}
               </p>

               {/* Action Buttons */}
               <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 w-full">
                  {/* Watch Button -> Scroll to Player */}
                  <button 
                    onClick={() => {
                      if (!isPlaying) handleQuickPlay();
                      document.getElementById('player-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }} 
                    className="h-14 sm:h-16 px-8 sm:px-12 text-white rounded-2xl font-black text-sm sm:text-base tracking-wide flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-[0_10px_40px_-10px_rgba(255,51,102,0.6)] group"
                    style={{ backgroundColor: '#FF3366' }}
                  >
                     <Play className="size-5 sm:size-6 fill-current group-hover:scale-110 transition-transform" /> 
                     ASSISTIR AGORA
                  </button>
                  
                  {content.trailerUrl && (
                    <button
                      onClick={() => setShowTrailer(true)}
                      className="h-14 sm:h-16 px-6 sm:px-8 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 font-bold transition-all text-white hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                      <svg className="size-4 sm:size-5 fill-current shrink-0" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> Trailer
                    </button>
                  )}

                  <button 
                    onClick={handleToggleList}
                    disabled={isListLoading}
                    className="h-14 sm:h-16 px-6 sm:px-8 rounded-2xl bg-[#8F44FF]/20 hover:bg-[#8F44FF]/30 backdrop-blur-md border border-[#8F44FF]/50 font-bold transition-all text-white hover:scale-105 active:scale-95 flex items-center gap-2"
                  >
                    {isInList ? <Check className="size-5 text-[#8F44FF]" /> : <Plus className="size-5 text-[#8F44FF]" />}
                    <span className="hidden sm:inline">{isInList ? 'Na Lista' : 'Minha Lista'}</span>
                  </button>
                  
                  <Link href="/" className="h-14 sm:h-16 px-6 rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-white/10 hidden sm:flex items-center justify-center font-bold">
                     Voltar
                  </Link>
               </div>
            </div>
          </div>
        </div>

        <div className="w-full relative z-20 flex-1">
          
          {/* Cinematic Video Player Section */}
          <div id="player-section" className="max-w-[1400px] w-full mx-auto px-4 md:px-8 -mt-24 mb-20 relative z-30">
            {isPlaying && activeEp ? (
               <div ref={playerRef} className="w-full shadow-[0_30px_100px_rgba(0,0,0,0.8)] rounded-2xl overflow-hidden ring-1 ring-white/10 bg-black animate-in zoom-in-95 fade-in duration-500">
                 {/* Player Header */}
                 <div className="p-4 sm:px-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-white/[0.02] to-transparent">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#8F44FF]/20 flex items-center justify-center text-[#8F44FF]">
                        <MonitorPlay className="size-5" />
                      </div>
                      <div>
                        <h3 className="text-white font-display font-black text-lg leading-none">
                          {content.type === 'movie' ? 'REPRODUZINDO FILME' : `EPISÓDIO ${activeEp.number}`}
                        </h3>
                        <p className="text-[#8A93A6] text-[10px] font-bold mt-1 uppercase tracking-widest">{activeEp.title || content.title}</p>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-3">
                     <div className="bg-[#131520] p-1 rounded-lg flex gap-1 border border-white/5">
                        <button onClick={() => setPlayerType('1')} className={`px-3 py-1.5 rounded-md text-[10px] font-black transition-all ${playerType === '1' ? 'bg-[#8F44FF] text-white' : 'text-[#8A93A6] hover:text-white'}`}>PLAYER 1</button>
                        <button onClick={() => setPlayerType('2')} className={`px-3 py-1.5 rounded-md text-[10px] font-black transition-all ${playerType === '2' ? 'bg-[#8F44FF] text-white' : 'text-[#8A93A6] hover:text-white'}`}>PLAYER 2</button>
                     </div>
                     <button onClick={() => setIsPlaying(false)} className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-[#FF3366]/20 hover:text-[#FF3366] rounded-lg transition-colors"><X className="size-4" /></button>
                   </div>
                 </div>

                 {/* The Actual Video */}
                 <div className="aspect-video bg-black relative w-full">
                    {videoSrc ? (
                      isIframeHtml ? (
                        <div className="w-full h-full [&_iframe]:w-full [&_iframe]:h-full" dangerouslySetInnerHTML={{ __html: videoSrc }} />
                      ) : (
                        <iframe src={videoSrc} className="w-full h-full border-0" allowFullScreen />
                      )
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-[#8A93A6] gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center animate-pulse"><X className="size-8" /></div>
                        <p className="font-bold">Vídeo não disponível neste servidor.</p>
                      </div>
                    )}
                 </div>
                 
                 {/* Quick Watch Navigation Bar */}
                 <div className="p-3 sm:px-6 border-t border-white/5 bg-[#131520] flex items-center justify-between">
                    <p className="text-[10px] font-black text-[#5C6370] tracking-[0.2em]">CONTINUE ASSISTINDO</p>
                    <Link href={`/watch/${content.slug}?ep=${activeEp.number}&player=${playerType}`} className="flex items-center gap-1.5 text-[11px] font-black text-white hover:text-[#8F44FF] transition-colors">
                      <Maximize className="size-3.5" />
                      MODO TEATRO
                    </Link>
                 </div>
               </div>
            ) : null}
          </div>

          {/* Extra Content Container */}
          <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 mb-16 relative z-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
             <ContentTabs 
                content={content} 
                related={related} 
                onEpisodeSelect={handleEpisodeSelect} 
                activeEpisodeNumber={activeEp?.number}
             />
          </div>
          
          {/* ── Trailer Modal ── */}
          {showTrailer && content.trailerUrl && (
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8"
              onClick={(e) => { if (e.target === e.currentTarget) setShowTrailer(false); }}
              style={{ background: 'rgba(5,5,16,0.95)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
            >
              <div className="relative w-full max-w-5xl animate-in zoom-in-95 fade-in duration-300">
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-6 rounded-full bg-[#FF3366] shadow-[0_0_12px_#FF3366]" />
                    <div>
                      <p className="text-white font-black text-base sm:text-lg tracking-tight leading-none">{content.title}</p>
                      <p className="text-[#5C6370] text-xs font-bold uppercase tracking-widest mt-1">Trailer Oficial</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowTrailer(false)}
                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.9)] bg-black" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={buildTrailerEmbedUrl(content.trailerUrl)}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full border-0"
                  />
                </div>

                <p className="text-center text-[#3C4050] text-xs font-medium mt-4">
                  Pressione ESC ou clique fora para fechar
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
