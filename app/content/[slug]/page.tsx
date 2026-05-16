'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Play, Plus, Check, ChevronLeft, Star, ThumbsUp, X, MonitorPlay } from 'lucide-react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import clsx from 'clsx';
import { ContentTabs } from './ContentTabs';
import { collection, query, where, getDocs, limit, doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export default function ContentPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user, loading: authLoading } = useAuth();
  
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [related, setRelated] = useState<any[]>([]);
  const [isInList, setIsInList] = useState(false);
  const [isListLoading, setIsListLoading] = useState(false);

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
            })).sort((a: any, b: any) => a.season === b.season ? a.number - b.number : a.season - b.season);
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

    if (slug) {
      fetchContent();
    }
  }, [slug]);

  const handleToggleList = async () => {
    if (!user) {
      alert("Você precisa estar logado para adicionar à sua lista.");
      return;
    }
    if (!content || isListLoading) return;

    setIsListLoading(true);
    try {
      const docRef = doc(db, 'users', user.uid, 'watchlist', content.slug);
      if (isInList) {
        await deleteDoc(docRef);
        setIsInList(false);
      } else {
        await setDoc(docRef, {
          title: content.title,
          slug: content.slug,
          posterImage: content.posterImage,
          type: content.type,
          addedAt: serverTimestamp(),
        });
        setIsInList(true);
      }
    } catch (err) {
      console.error(err);
      alert("Ocorreu um erro ao atualizar sua lista.");
    } finally {
      setIsListLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050510] text-white flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-[80px] w-[calc(100%-80px)] overflow-y-auto h-screen scrollbar-hide relative">
          <React.Suspense fallback={<div className="h-[80px]" />}><Navbar /></React.Suspense>
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-4 border-[#8F44FF] border-t-transparent animate-spin mb-4"></div>
              <p className="text-[#8A93A6] font-medium">Carregando conteúdo...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!content) {
    return (
      <main className="min-h-screen bg-[#050510] text-white flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-[80px] w-[calc(100%-80px)] overflow-y-auto h-screen scrollbar-hide relative">
          <React.Suspense fallback={<div className="h-[80px]" />}><Navbar /></React.Suspense>
          <div className="flex-1 flex flex-col items-center justify-center">
            <h2 className="text-4xl font-display font-bold mb-4">404 - Não Encontrado</h2>
            <p className="mb-8 text-[#8A93A6]">O conteúdo procurado não existe ou foi removido.</p>
            <Link href="/" className="bg-[#8F44FF] hover:bg-[#7B2EFF] text-white px-8 py-3.5 rounded-full font-bold transition-colors">
              Voltar ao Início
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050510] text-white flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-[80px] w-[calc(100%-80px)] overflow-y-auto h-screen scrollbar-hide relative pb-20">
        <div className="relative z-50">
          <React.Suspense fallback={<div className="h-[80px]" />}>
            <Navbar />
          </React.Suspense>
        </div>

        {/* Background Hero Image */}
        <div className="absolute top-0 right-0 w-[80%] h-[800px] z-0 opacity-40 mix-blend-screen">
          <div className="absolute inset-0 bg-gradient-to-r from-[#050510] via-[#050510]/80 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-transparent to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050510] via-transparent to-transparent z-10 opacity-80" />
          <Image
            src={content.heroImage}
            alt={content.title}
            fill
            className="object-cover object-right-top mask-image-radial"
            priority
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="relative z-10 px-6 sm:px-10 pt-[100px] max-w-7xl mx-auto w-full animate-in fade-in duration-700">
          <Link href="/" className="inline-flex items-center gap-2 text-[#8A93A6] hover:text-white transition-colors group mb-8">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
               <ChevronLeft className="size-4" />
            </div>
            <span className="text-[14px] font-medium tracking-wide">Voltar</span>
          </Link>

          <div className="flex flex-col md:flex-row gap-10 lg:gap-14">
            {/* Poster */}
            <div className="w-[280px] sm:w-[320px] shrink-0 mx-auto md:mx-0">
               <div className="relative w-full aspect-[2/3] rounded-[16px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/5 group ring-1 ring-white/10">
                 <Image
                    src={content.posterImage}
                    alt={`${content.title} Poster`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#050510]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
               </div>
            </div>

            {/* Info */}
            <div className="flex-1 pt-4 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-5">
                 <span className="bg-[#8F44FF]/20 text-[#A661FF] text-[11px] uppercase font-bold px-3 py-1.5 rounded-full tracking-wider border border-[#8F44FF]/30 backdrop-blur-md">
                   {content.type === 'movie' ? 'FILME' : content.type === 'anime' ? 'ANIME' : 'SÉRIE'}
                 </span>
                 <div className="flex items-center gap-1.5 text-[#10B981] font-bold text-[13px] bg-[#10B981]/10 px-2.5 py-1 rounded-full border border-[#10B981]/20">
                   <ThumbsUp className="size-3.5" />
                   {content.relevance} Relevante
                 </div>
              </div>

              <h1 className="text-[40px] sm:text-[56px] font-display font-bold tracking-tight leading-[1.1] text-white mb-2 shadow-black drop-shadow-xl">
                {content.title}
              </h1>
              {content.originalTitle && content.originalTitle !== content.title && (
                 <h2 className="text-[20px] sm:text-[24px] font-medium text-[#8A93A6] mb-6 shadow-black drop-shadow-md font-display">
                   {content.originalTitle}
                 </h2>
              )}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[#D1D5DB] text-[15px] font-medium mb-6">
                <span>{content.year}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#8A93A6]/50" />
                <span>{content.seasons ? `${content.seasons} Temporadas` : content.duration || '24m'}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#8A93A6]/50" />
                <span className="text-[#A661FF]">{(content.genres || []).join(', ')}</span>
              </div>

              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center gap-1.5">
                  <Star className="size-5 fill-[#FBBF24] text-[#FBBF24]" />
                  <Star className="size-5 fill-[#FBBF24] text-[#FBBF24]" />
                  <Star className="size-5 fill-[#FBBF24] text-[#FBBF24]" />
                  <Star className="size-5 fill-[#FBBF24] text-[#FBBF24]" />
                  <Star className="size-5 fill-[#FBBF24] text-[#FBBF24] opacity-40" />
                  <span className="font-bold text-white text-[16px] ml-1">{content.score}</span>
                  <span className="text-[#8A93A6] text-[14px] ml-1">({content.reviews} avaliações)</span>
                </div>
              </div>

              <p className="text-[#8A93A6] text-[16px] sm:text-[18px] leading-[1.7] max-w-3xl mb-10 font-medium">
                {content.description}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button 
                  onClick={() => setIsPlayerModalOpen(true)}
                  className="flex items-center justify-center gap-2.5 bg-white hover:bg-gray-200 text-black h-14 px-10 rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                >
                  <Play className="size-5 fill-black" />
                  <span className="text-[16px]">Assistir Agora</span>
                </button>
                <button 
                  onClick={handleToggleList}
                  disabled={isListLoading}
                  className="flex items-center justify-center gap-2.5 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 h-14 px-8 rounded-full font-bold transition-all text-white hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isInList ? <Check className="size-5 text-[#10B981]" /> : <Plus className="size-5" />}
                  <span className="text-[16px]">{isInList ? 'Na Sua Lista' : 'Minha Lista'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body / Tabs */}
        <div className="relative z-10 w-full max-w-7xl mx-auto mt-16 px-6 sm:px-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
           <ContentTabs content={content} related={related} />
        </div>
      </div>

      {/* Player Selection Modal */}
      {isPlayerModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#0A0A16] border border-white/10 rounded-[24px] w-full max-w-lg overflow-hidden shadow-[0_0_80px_rgba(143,68,255,0.2)] animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
              <h3 className="text-xl font-display font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#8F44FF]/20 flex items-center justify-center">
                  <MonitorPlay className="size-5 text-[#A661FF]" />
                </div>
                Selecione o Player
              </h3>
              <button 
                onClick={() => setIsPlayerModalOpen(false)}
                className="text-[#8A93A6] hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2.5 rounded-full"
              >
                <X className="size-5" />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-4">
              <Link
                href={`/watch/${content.slug}?player=1`}
                className="flex items-center gap-5 p-5 rounded-[16px] bg-white/5 hover:bg-[#8F44FF]/10 border border-white/5 hover:border-[#8F44FF]/50 transition-all duration-300 group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-full bg-[#8F44FF]/20 flex items-center justify-center text-[#A661FF] group-hover:bg-[#8F44FF] group-hover:text-white transition-colors shadow-lg">
                  <Play className="size-6 fill-current ml-1" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-display font-bold text-[18px]">Player Principal</h4>
                  <p className="text-[#8A93A6] text-[14px] mt-1 font-medium">Servidor mais rápido. Opções de leg/dub se disponíveis.</p>
                </div>
              </Link>
              
              <Link
                href={`/watch/${content.slug}?player=2`}
                className="flex items-center gap-5 p-5 rounded-[16px] bg-white/5 hover:bg-[#8F44FF]/10 border border-white/5 hover:border-[#8F44FF]/50 transition-all duration-300 group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-full bg-[#8F44FF]/20 flex items-center justify-center text-[#A661FF] group-hover:bg-[#8F44FF] group-hover:text-white transition-colors shadow-lg">
                  <Play className="size-6 fill-current ml-1" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-display font-bold text-[18px]">Player Alternativo</h4>
                  <p className="text-[#8A93A6] text-[14px] mt-1 font-medium">Recomendado caso o player principal apresente lentidão.</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
