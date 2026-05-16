'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Star, ThumbsUp, MessageSquare } from 'lucide-react';
import clsx from 'clsx';
import { TrendingCard } from '@/components/Cards';
import { ContentData } from '@/lib/data';

interface ContentTabsProps {
  content: ContentData;
  related: ContentData[];
}

export function ContentTabs({ content, related }: ContentTabsProps) {
  const TABS = content.type === 'movie' 
    ? ['Sobre', 'Detalhes', 'Elenco', 'Avaliações'] 
    : ['Episódios', 'Sobre', 'Detalhes', 'Elenco', 'Avaliações'];

  const [activeTab, setActiveTab] = useState(TABS[0]);

  // Gather info fields
  const info: Record<string, string> = {
    Tipo: content.type === 'movie' ? 'Filme' : content.type === 'series' ? 'Série' : 'Anime',
    Lançamento: String(content.year || '2024'),
    Status: content.status || 'Finalizado',
    Estúdio: content.studio || 'Desconhecido',
    Classificação: content.classification || '14',
    Áudio: content.audio || 'Original',
    Legendas: content.subtitles || 'Português',
  };

  const cast = content.cast || [];

  return (
    <div className="pb-20 flex flex-col lg:flex-row gap-12 relative z-20">
      {/* Left Column */}
      <div className="flex-1">
        {/* Tabs */}
        <div className="flex items-center gap-8 overflow-x-auto scrollbar-hide border-b border-white/10 pb-4 mb-8 -mx-6 px-6 sm:mx-0 sm:px-0">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                "pb-3 font-display font-bold text-[16px] transition-all relative shrink-0",
                activeTab === tab
                  ? "text-white after:content-[''] after:absolute after:-bottom-[17px] after:left-0 after:w-full after:h-[3px] after:bg-[#8F44FF] after:rounded-t-full after:shadow-[0_-4px_12px_rgba(143,68,255,0.5)]"
                  : "text-[#8A93A6] hover:text-white"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'Episódios' && (
          content.episodes && content.episodes.length > 0 ? (
            <div className="bg-[#0A0A16] rounded-[24px] p-6 sm:p-8 border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in duration-500">
              <div className="flex justify-between items-center mb-8">
                <select className="bg-white/5 border border-white/10 rounded-[12px] px-5 py-3 text-white outline-none cursor-pointer hover:border-white/20 focus:border-[#8F44FF] transition-colors appearance-none font-medium">
                  {Array.from({ length: content.seasons || 1 }).map((_, i) => (
                    <option key={i} value={i + 1} className="bg-[#0A0A16]">Temporada {i + 1}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-4">
                {content.episodes.map((ep) => (
                  <div key={ep.id} className="group flex flex-col sm:flex-row gap-5 sm:items-center p-4 rounded-[16px] hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/10">
                    <div className="relative w-full sm:w-[200px] aspect-video sm:h-auto shrink-0 rounded-[12px] overflow-hidden shadow-lg">
                      <Image src={ep.thumbnail} alt={ep.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                          <Play className="size-5 text-white fill-white ml-1" />
                        </div>
                      </div>
                      {ep.progress !== undefined && (
                         <div className="absolute bottom-0 left-0 w-full h-[4px] bg-black/60">
                           <div className="h-full bg-[#8F44FF] transition-all" style={{ width: `${ep.progress}%` }} />
                         </div>
                      )}
                    </div>
                    <div className="flex-1 py-1">
                      <div className="flex justify-between items-center gap-4 mb-2">
                        <h4 className="text-white font-display font-bold text-[18px] line-clamp-1">{ep.number}. {ep.title}</h4>
                        <span className="text-[#8A93A6] text-[13px] shrink-0 font-medium bg-white/5 px-2.5 py-1 rounded-full">{ep.duration}</span>
                      </div>
                      <p className="text-[#8A93A6] text-[14px] line-clamp-2 mt-2 group-hover:text-[#D1D5DB] transition-colors leading-[1.6]">
                        {ep.description}
                      </p>
                    </div>
                    <div className="hidden sm:flex shrink-0 w-16 justify-center">
                      <Link href={`/watch/${content.slug}?ep=${ep.number}`} className="w-12 h-12 rounded-full bg-white/5 group-hover:bg-[#8F44FF] border border-white/10 group-hover:border-[#8F44FF] flex items-center justify-center text-white transition-all shadow-none group-hover:shadow-[0_0_20px_rgba(143,68,255,0.4)] hover:scale-110">
                        <Play className="size-5 fill-current ml-1" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-[#0A0A16] rounded-[24px] p-12 border border-white/5 text-center text-[#8A93A6] flex flex-col items-center justify-center min-h-[300px]">
               <Play className="size-12 opacity-20 mb-4" />
               <p className="text-[18px] font-medium text-white mb-1">Nenhum episódio disponível</p>
               <p className="text-[14px]">Os episódios desta obra ainda não foram adicionados.</p>
            </div>
          )
        )}

        {activeTab === 'Sobre' && (
          <div className="bg-[#0A0A16] rounded-[24px] p-8 border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in duration-500">
            <h3 className="font-display font-bold text-[28px] text-white mb-6">Sobre a Obra</h3>
            <p className="text-[#8A93A6] text-[16px] sm:text-[18px] leading-[1.8] font-medium mb-10">
              {content.fullSynopsis || content.description}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white/5 border border-white/5 rounded-[16px] p-5">
                <span className="block text-[#8A93A6] text-[11px] font-bold mb-1.5 uppercase tracking-widest">Lançamento</span>
                <span className="text-white font-display font-bold text-[20px]">{content.year}</span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-[16px] p-5">
                <span className="block text-[#8A93A6] text-[11px] font-bold mb-1.5 uppercase tracking-widest">Avaliação</span>
                <div className="flex items-center gap-1.5 text-white font-display font-bold text-[20px]">
                  <Star className="size-5 text-[#FFD700] fill-[#FFD700]" />
                  {content.score}
                </div>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-[16px] p-5">
                <span className="block text-[#8A93A6] text-[11px] font-bold mb-1.5 uppercase tracking-widest">Estúdio</span>
                <span className="text-white font-display font-bold text-[20px] truncate block">{info.Estúdio || 'Desconhecido'}</span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-[16px] p-5">
                <span className="block text-[#8A93A6] text-[11px] font-bold mb-1.5 uppercase tracking-widest">Aprovação</span>
                <div className="flex items-center gap-1.5 text-[#10B981] font-display font-bold text-[20px]">
                  <ThumbsUp className="size-5" />
                  {content.relevance || '95%'}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Detalhes' && (
          <div className="bg-[#0A0A16] rounded-[24px] p-8 md:p-10 border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in duration-500">
            <h3 className="font-display font-bold text-[28px] text-white mb-8">Ficha Técnica</h3>
            
            <div className="space-y-6">
              {Object.entries(info).map(([key, value]) => (
                <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-2 border-b border-white/5 pb-6 last:pb-0 last:border-0">
                  <span className="text-[#8A93A6] font-medium capitalize w-48 shrink-0">{key === 'classification' ? 'Classificação Indicativa' : key}</span>
                  <div className="flex-1">
                    {key === 'classification' ? (
                      <span className="bg-[#FFA500] text-black font-bold px-2 py-0.5 rounded-[4px] text-[13px] tracking-wide inline-block">{value}</span>
                    ) : (
                      <span className="text-white font-semibold text-[16px]">{value}</span>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 border-b border-white/5 pb-6">
                <span className="text-[#8A93A6] font-medium w-48 shrink-0">Título Original</span>
                <span className="text-white font-semibold text-[16px]">{content.originalTitle || content.title}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 pb-2">
                <span className="text-[#8A93A6] font-medium w-48 shrink-0">Gêneros</span>
                <div className="flex flex-wrap gap-2">
                  {(content.genres || []).map(g => (
                    <span key={g} className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-[13px] text-white font-bold">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Elenco' && (
          <div className="bg-[#0A0A16] rounded-[24px] p-8 md:p-10 border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in duration-500">
            <h3 className="font-display font-bold text-[28px] text-white mb-8">Elenco e Personagens</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {cast.map((c: any, index: number) => (
                <div key={`${c.name}-${index}`} className="flex items-center gap-5 bg-white/5 hover:bg-white/10 p-4 rounded-[16px] border border-white/5 transition-colors group cursor-pointer">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-[#050510] relative shrink-0 border-2 border-transparent group-hover:border-[#8F44FF] transition-all">
                    <Image src={c.avatar} alt={c.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[16px] text-white font-bold mb-0.5">{c.name}</span>
                    <span className="text-[14px] text-[#A661FF] font-medium">{c.role}</span>
                  </div>
                </div>
              ))}
              {(!cast || cast.length === 0) && (
                 <div className="col-span-1 border border-white/5 border-dashed rounded-[16px] p-8 flex flex-col items-center justify-center text-center">
                    <p className="text-[#8A93A6] text-[15px]">Informações de elenco não disponíveis.</p>
                 </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'Avaliações' && (
          <div className="bg-[#0A0A16] rounded-[24px] p-8 md:p-10 border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
              <h3 className="font-display font-bold text-[28px] text-white items-center flex gap-4">
                <div className="w-12 h-12 rounded-full bg-[#8F44FF]/20 flex items-center justify-center">
                   <MessageSquare className="size-6 text-[#A661FF]" />
                </div>
                Avaliações
              </h3>
              <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-yellow-500/30 px-5 py-3 rounded-[16px]">
                <Star className="size-6 text-[#FFD700] fill-[#FFD700]" />
                <span className="text-white font-display font-bold text-[24px]">{content.score}</span>
                <span className="text-[#8A93A6] text-[14px] ml-1 font-medium">/ 10</span>
              </div>
            </div>

            <div className="border border-white/5 border-dashed rounded-[16px] p-12 flex flex-col items-center justify-center text-center">
              <p className="text-[#8A93A6] text-[16px]">Seja o primeiro a avaliar esta obra!</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Column (Info widget) */}
      <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-6">
        <div className="bg-[#0A0A16] rounded-[24px] p-8 border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <h3 className="font-display font-bold text-[20px] mb-6 text-white border-b border-white/10 pb-4">Resumo Rápido</h3>
          <div className="flex flex-col gap-5 text-[15px]">
            {Object.entries(info).slice(0, 5).map(([k, v]) => (
              <div key={k} className="flex justify-between items-start gap-4">
                <span className="text-[#8A93A6] font-medium capitalize">{k === 'classification' ? 'Classificação' : k}</span>
                {k === 'classification' ? (
                  <span className="bg-[#FFA500] text-black font-bold px-2 py-0.5 rounded-[4px] text-[11px] uppercase tracking-wider shadow-sm">{v}</span>
                ) : (
                  <span className="text-white text-right max-w-[160px] font-bold">{v}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {cast && cast.length > 0 && (
          <div className="bg-[#0A0A16] rounded-[24px] p-8 border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h3 className="font-display font-bold text-[20px] text-white">Elenco Principal</h3>
              <button onClick={() => setActiveTab('Elenco')} className="text-[13px] text-[#A661FF] font-bold hover:text-[#8F44FF] transition-colors rounded-full bg-[#8F44FF]/10 px-3 py-1">Ver todos</button>
            </div>
            <div className="flex flex-col gap-5">
              {cast.slice(0, 3).map((c: any, index: number) => (
                <div key={`${c.name}-${index}`} className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[#050510] relative shrink-0 border border-white/10 group-hover:border-[#8F44FF] transition-colors">
                    <Image src={c.avatar} alt={c.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[15px] text-white font-bold line-clamp-1">{c.name}</span>
                    <span className="text-[13px] text-[#8A93A6] line-clamp-1 font-medium mt-0.5">{c.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {related && related.length > 0 && (
          <div className="bg-[#0A0A16] rounded-[24px] p-6 sm:p-8 border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center">
             <h3 className="font-display font-bold text-[20px] mb-6 text-white text-center">Mais Recomendações</h3>
             <div className="w-full flex justify-center">
                 <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x w-full">
                  {related.map((item, index) => (
                    <div key={item.id} className="w-[130px] shrink-0 snap-center mb-2">
                       <Link href={`/content/${item.slug}`} className="block relative aspect-[2/3] rounded-[12px] overflow-hidden border border-white/10 group shadow-lg">
                          <Image src={item.posterImage || 'https://picsum.photos/seed/fallback/400/600'} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                       </Link>
                       <p className="text-white text-[13px] font-bold mt-3 text-center line-clamp-1">{item.title}</p>
                    </div>
                  ))}
                 </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
