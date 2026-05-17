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

  // Integrated Player States
  const [activeEp, setActiveEp] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerType, setPlayerType] = useState('1');
  const playerRef = useRef<HTMLDivElement>(null);

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

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050510] text-white flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-[80px] w-[calc(100%-80px)] overflow-y-auto h-screen relative">
          <React.Suspense fallback={null}><Navbar /></React.Suspense>
          <div className="flex-1 flex items-center justify-center">
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
    <main className="min-h-screen bg-[#050510] text-white flex overflow-x-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col ml-[80px] w-[calc(100%-80px)] relative pb-20 overflow-y-auto scrollbar-hide">
        <div className="relative z-[100]">
          <React.Suspense fallback={null}><Navbar /></React.Suspense>
        </div>

        {/* Hero Background */}
        <div className="absolute top-0 right-0 w-[85%] h-[800px] z-0 opacity-40 mix-blend-lighten pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-[#050510] via-[#050510]/80 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-transparent to-transparent z-10" />
          <Image src={content.heroImage} alt="bg" fill className="object-cover object-right-top mask-image-radial scale-105" priority />
        </div>

        <div className="relative z-10 px-6 sm:px-10 pt-[80px] max-w-7xl mx-auto w-full">
          <Link href="/" className="inline-flex items-center gap-2 text-[#8A93A6] hover:text-white transition-colors group mb-8">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors border border-white/5">
               <ChevronLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
            </div>
            <span className="text-[14px] font-bold tracking-tight">Voltar para o início</span>
          </Link>

          <div className="flex flex-col md:flex-row gap-10 lg:gap-14 mb-16">
            {/* Poster Card */}
            <div className="w-[280px] sm:w-[320px] shrink-0 mx-auto md:mx-0">
               <div className="relative w-full aspect-[2/3] rounded-[24px] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/10 group ring-1 ring-white/10">
                 <Image src={content.posterImage} alt="poster" fill className="object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                 <button 
                   onClick={handleQuickPlay}
                   className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
                 >
                    <div className="w-16 h-16 rounded-full bg-[#FF3366] text-white flex items-center justify-center shadow-[0_0_30px_#FF3366] scale-75 group-hover:scale-100 transition-transform duration-500">
                      <Play className="size-8 fill-current ml-1" />
                    </div>
                 </button>
               </div>
            </div>

            {/* Content Info */}
            <div className="flex-1 pt-2 flex flex-col justify-center text-center md:text-left items-center md:items-start">
               <div className="flex items-center gap-3 mb-6">
                 <span className="bg-[#FF3366]/20 text-[#FF3366] text-[11px] font-black px-4 py-1.5 rounded-full tracking-[0.1em] border border-[#FF3366]/30 backdrop-blur-md">
                   {content.type?.toUpperCase()}
                 </span>
                 <div className="flex items-center gap-1.5 text-[#10B981] font-bold text-[13px] bg-[#10B981]/10 px-3 py-1 rounded-full border border-[#10B981]/20">
                   <ThumbsUp className="size-3.5" />
                   {content.relevance}
                 </div>
               </div>

               <h1 className="text-[42px] sm:text-[64px] font-display font-black tracking-tighter leading-[1] text-white mb-4 drop-shadow-2xl">
                 {content.title}
               </h1>
               
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-2 text-[#8A93A6] text-[15px] font-bold mb-8">
                 <span className="text-white">{content.year}</span>
                 <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                 <span>{content.seasons ? `${content.seasons} TEMPORADAS` : content.duration}</span>
                 <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                 <div className="flex items-center gap-1.5">
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                    <span className="text-white">{content.score}</span>
                 </div>
               </div>

               <p className="text-[#8A93A6] text-[17px] leading-[1.8] max-w-2xl mb-10 font-medium line-clamp-4 md:line-clamp-none">
                 {content.description}
               </p>

               <div className="flex flex-wrap items-center gap-4">
                 <button 
                   onClick={handleQuickPlay}
                   className="flex items-center justify-center gap-3 bg-white hover:bg-gray-200 text-black h-16 px-12 rounded-[20px] font-black transition-all hover:scale-105 active:scale-95 shadow-[0_15px_30px_rgba(255,255,255,0.15)] group"
                 >
                   <Play className="size-5 fill-black group-hover:scale-110 transition-transform" />
                   ASSISTIR AGORA
                 </button>
                 <button 
                   onClick={handleToggleList}
                   disabled={isListLoading}
                   className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 h-16 px-10 rounded-[20px] font-black transition-all text-white hover:scale-105 active:scale-95 group"
                 >
                   {isInList ? <Check className="size-5 text-[#10B981]" /> : <Plus className="size-5 group-hover:rotate-90 transition-transform" />}
                   {isInList ? 'SALVO NA LISTA' : 'MINHA LISTA'}
                 </button>
                 
                 <Link 
                   href={`/watch/${content.slug}`}
                   className="w-16 h-16 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-[20px] transition-all hover:scale-105 active:scale-95"
                   title="Modo Teatro Fullscreen"
                 >
                   <Maximize className="size-6 text-[#8A93A6] hover:text-white" />
                 </Link>
               </div>
            </div>
          </div>

          {/* Integrated Player Section */}
          {isPlaying && activeEp && (
            <div ref={playerRef} className="mb-20 animate-in zoom-in-95 fade-in duration-500">
               <div className="bg-[#0A0A16] rounded-[32px] overflow-hidden border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.9)] ring-1 ring-white/5">
                 
                 {/* Player Header */}
                 <div className="p-6 sm:px-10 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-white/[0.02] to-transparent">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#FF3366]/10 flex items-center justify-center text-[#FF3366]">
                        <MonitorPlay className="size-6" />
                      </div>
                      <div>
                        <h3 className="text-white font-display font-black text-xl leading-none">
                          {content.type === 'movie' ? 'REPRODUZINDO FILME' : `EPISÓDIO ${activeEp.number}`}
                        </h3>
                        <p className="text-[#8A93A6] text-xs font-bold mt-1.5 uppercase tracking-widest">{activeEp.title || content.title}</p>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-3">
                     <div className="bg-[#131520] p-1 rounded-xl flex gap-1 border border-white/5">
                        <button onClick={() => setPlayerType('1')} className={`px-4 py-2 rounded-lg text-[11px] font-black transition-all ${playerType === '1' ? 'bg-[#FF3366] text-white' : 'text-[#8A93A6] hover:text-white'}`}>PLAYER 1</button>
                        <button onClick={() => setPlayerType('2')} className={`px-4 py-2 rounded-lg text-[11px] font-black transition-all ${playerType === '2' ? 'bg-[#FF3366] text-white' : 'text-[#8A93A6] hover:text-white'}`}>PLAYER 2</button>
                     </div>
                     <button onClick={() => setIsPlaying(false)} className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl transition-colors"><X className="size-5" /></button>
                   </div>
                 </div>

                 {/* The Actual Video */}
                 <div className="aspect-video bg-black relative group">
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
                 <div className="p-4 sm:px-8 border-t border-white/5 bg-[#131520]/50 flex items-center justify-between">
                    <p className="text-[11px] font-black text-[#5C6370] tracking-[0.2em]">CONTINUE ASSISTINDO</p>
                    <div className="flex items-center gap-4">
                       <Link href={`/watch/${content.slug}?ep=${activeEp.number}&player=${playerType}`} className="flex items-center gap-2 text-[12px] font-black text-white hover:text-[#FF3366] transition-colors">
                         <Maximize className="size-4" />
                         MODO TEATRO
                       </Link>
                    </div>
                 </div>
               </div>
            </div>
          )}

          {/* Tabs Section */}
          <div className="relative z-10 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200 fill-mode-both">
             <ContentTabs 
                content={content} 
                related={related} 
                onEpisodeSelect={handleEpisodeSelect} 
                activeEpisodeNumber={activeEp?.number}
             />
          </div>
        </div>
      </div>
    </main>
  );
}
