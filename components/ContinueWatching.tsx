'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Play, ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore/lite';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface ContinueWatchingProps {
  theme?: 'default' | 'anime';
}

export function ContinueWatching({ theme = 'default' }: ContinueWatchingProps = {}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [dataList, setDataList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) { 
        // Fallback para localStorage
        try {
          const localProgress = JSON.parse(localStorage.getItem('streamverse_progress') || '[]');
          setDataList(localProgress);
        } catch (e) {}
        setLoading(false);
        return; 
      }
      try {
        const q = query(
          collection(db, 'users', user.uid, 'progress'),
          orderBy('updatedAt', 'desc'),
          limit(12) // Limite aumentado para preencher melhor o grid
        );
        const snapshot = await getDocs(q);
        
        // Mecânica de Deduplicação: Agrupar por slug e pegar apenas o mais recente
        const uniqueItems = new Map<string, any>();
        
        snapshot.docs.forEach(doc => {
          const d = doc.data();
          if (!uniqueItems.has(d.contentSlug)) {
            uniqueItems.set(d.contentSlug, d);
          }
        });

        const progressData = Array.from(uniqueItems.values()).map(d => {
          const isTmdb = d.contentSlug?.startsWith('tmdb/');
          let href = d.isMovie
            ? `/watch/${d.contentSlug}`
            : `/watch/${d.contentSlug}?season=${d.seasonNumber || 1}&ep=${d.episodeNumber || 1}`;
          if (isTmdb) href = `/${d.contentSlug}`;
          return {
            title: d.contentTitle || 'Desconhecido',
            subtitle: d.subtitle || (d.isMovie ? 'Filme' : 'Série'),
            imageUrl: d.contentImage || 'https://picsum.photos/seed/thumb/300/169',
            progress: d.progressPercentage || 0,
            slug: d.contentSlug,
            href,
          };
        });
        setDataList(progressData);
      } catch (e) {
        console.error('Failed to load continue watching', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <section className="relative px-6 sm:px-10 pt-6 pb-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-48 h-7 bg-white/5 animate-pulse rounded" />
        </div>
        <div className="flex gap-4 sm:gap-5 overflow-x-hidden -mx-6 sm:-mx-10 px-6 sm:px-10">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-[240px] sm:w-[280px] aspect-video bg-[#0A0A16] rounded-xl animate-pulse shrink-0" />
          ))}
        </div>
      </section>
    );
  }

  if (dataList.length === 0) return null;

  return (
    <section className="relative px-6 sm:px-10 pt-6 pb-4 group/section">

      {/* Título da seção (Estilo idêntico ao TmdbCarousel, porém mais sutil) */}
      <div className="flex items-center gap-2 mb-6">
        <h3 className="text-[20px] font-display font-bold text-white/90 tracking-wide">
          Continue Assistindo
        </h3>
        <ChevronRight className={`size-4 opacity-70 ${theme === 'anime' ? 'text-[#FF3366]' : 'text-[#8F44FF]'}`} />
      </div>

      <div className="relative border border-transparent">
        {/* Navigation Buttons */}
        <button 
          onClick={scrollLeft}
          className={`absolute left-[-24px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center z-20 opacity-0 group-hover/section:opacity-100 transition-all duration-300 text-white hover:scale-110 shadow-[0_0_20px_rgba(0,0,0,0.5)] ${
            theme === 'anime' ? 'hover:bg-[#FF3366] hover:border-[#FF3366]' : 'hover:bg-[#8F44FF] hover:border-[#8F44FF]'
          }`}
        >
          <ChevronLeft className="size-6 ml-[-2px]" />
        </button>
        
        <button 
          onClick={scrollRight}
          className={`absolute right-[-24px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center z-20 opacity-0 group-hover/section:opacity-100 transition-all duration-300 text-white hover:scale-110 shadow-[0_0_20px_rgba(0,0,0,0.5)] ${
            theme === 'anime' ? 'hover:bg-[#FF3366] hover:border-[#FF3366]' : 'hover:bg-[#8F44FF] hover:border-[#8F44FF]'
          }`}
        >
          <ChevronRight className="size-6 mr-[-2px]" />
        </button>

        {/* Layout em linha (flex) com scroll horizontal, alinhado à esquerda */}
        <div 
          ref={scrollRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x -mx-6 sm:-mx-10 px-6 sm:px-10"
        >
        {dataList.map((item, idx) => {
          const remainingMins = Math.max(1, Math.floor((100 - (item.progress || 0)) * 0.45));
          const remainingText = remainingMins > 60
            ? `${Math.floor(remainingMins / 60)}h ${remainingMins % 60}m`
            : `${remainingMins}m`;

          return (
            <Link
              key={idx}
              href={item.href}
              className="group cursor-pointer block relative shrink-0 snap-start w-[240px] sm:w-[280px]"
            >
              <div className="bg-[#0A0A16] rounded-xl ring-1 ring-white/5 overflow-hidden transition-all duration-300 group-hover:ring-white/20 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
                {/* Image Area */}
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Overlay Escuro sutil */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

                  {/* Play icon centralizado - Estilo Premium com Blur */}
                  <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center transform group-hover:scale-110 transition-all duration-500 shadow-xl">
                       <Play className="size-4 fill-white text-white ml-0.5" />
                     </div>
                  </div>

                  {/* Barra de progresso integrada na base da imagem */}
                  {item.progress !== undefined && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10 z-20">
                      <div
                        className={`h-full ${theme === 'anime' ? 'bg-[#FF3366] shadow-[0_0_8px_#FF3366]' : 'bg-[#8F44FF] shadow-[0_0_8px_#8F44FF]'}`}
                        style={{ width: `${item.progress || 8}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Info Area (Fundo mais claro que a página) */}
                <div className="p-4 bg-[#0F0F1E]/80 backdrop-blur-md">
                   <h3 className={`text-white text-[13px] font-bold tracking-wide truncate transition-colors mb-1 ${
                     theme === 'anime' ? 'group-hover:text-[#FF3366]' : 'group-hover:text-[#A661FF]'
                   }`}>
                     {item.title}
                   </h3>
                   <div className="flex items-center justify-between">
                     <p className="text-[#8F8F9D] text-[10px] font-medium tracking-wide uppercase">{item.subtitle}</p>
                     <p className="text-[#8F8F9D] text-[10px] font-medium">
                       {remainingText} restantes
                     </p>
                   </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  </section>
);
}
