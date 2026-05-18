'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Search, Sparkles, Star, Play, AlertCircle } from 'lucide-react';

interface KidsItem {
  id: string | number;
  title: string;
  posterUrl: string;
  backdropUrl: string;
  type: 'movie' | 'tv';
  score?: string;
  overview?: string;
  year?: string;
}

interface KidsSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayContent: (item: KidsItem) => void;
  childGender?: 'boy' | 'girl' | 'neutral';
  childName?: string;
}

export function KidsSearchModal({
  isOpen,
  onClose,
  onPlayContent,
  childGender = 'boy',
  childName = '',
}: KidsSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<KidsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [correction, setCorrection] = useState<{
    wasCorrected: boolean;
    correctedQuery: string;
    originalQuery: string;
  } | null>(null);

  // Search Debouncer
  useEffect(() => {
    if (!isOpen) return;
    if (!query.trim()) {
      setResults([]);
      setCorrection(null);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        // Search API is automatically filtered by kids_active cookie
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          const items = (data.results || []).map((item: any) => ({
            id: item.id,
            title: item.title || item.name,
            posterUrl: item.posterPath ? `https://image.tmdb.org/t/p/w500${item.posterPath}` : '',
            backdropUrl: item.backdropPath ? `https://image.tmdb.org/t/p/original${item.backdropPath}` : '',
            type: item.mediaType === 'tv' ? 'tv' : 'movie',
            score: item.voteAverage ? item.voteAverage.toFixed(1) : '8.5',
            overview: item.overview,
            year: item.releaseDate ? item.releaseDate.split('-')[0] : (item.firstAirDate ? item.firstAirDate.split('-')[0] : '')
          }));
          
          setResults(items);

          if (data.wasCorrected) {
            setCorrection({
              wasCorrected: true,
              correctedQuery: data.correctedQuery,
              originalQuery: data.originalQuery,
            });
          } else {
            setCorrection(null);
          }
        }
      } catch (err) {
        console.error('Kids search overlay error', err);
      } finally {
        setLoading(false);
      }
    }, 450);

    return () => clearTimeout(delayDebounce);
  }, [query, isOpen]);

  // Clean state on open/close
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setCorrection(null);
    }
  }, [isOpen]);

  // Block body scroll on open to avoid double scrollbars
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isGirl = childGender === 'girl';
  const mascotSrc = isGirl ? '/kids/mascotemeninas.png' : '/kids/mascote.png';

  const handleConfirmCorrection = () => {
    if (correction) {
      setQuery(correction.correctedQuery);
      setCorrection(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-[#03020F]/65 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 md:p-8 animate-in fade-in duration-300 select-none">
      
      {/* 🎪 Floating Centered Kids Dialog Box */}
      <div className={`relative w-full max-w-3xl max-h-[85vh] bg-[#0C0827]/96 border-2 rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 ${
        isGirl ? 'border-pink-500/35 shadow-pink-950/20' : 'border-indigo-500/35 shadow-indigo-950/30'
      }`}>
        
        {/* 🔮 Subtle Inner Glowing Aura */}
        <div className={`absolute top-[-20%] left-[20%] w-[60%] h-[40%] rounded-full blur-[80px] pointer-events-none opacity-20 ${
          isGirl ? 'bg-pink-500' : 'bg-violet-600'
        }`} />

        {/* ✖ Close Circle Button in Card Header */}
        <button
          onClick={onClose}
          className={`absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center border transition-all hover:scale-110 active:scale-90 cursor-pointer shadow-md z-50 ${
            isGirl 
              ? 'bg-pink-500/10 border-pink-500/25 hover:bg-pink-500/25 text-pink-300' 
              : 'bg-indigo-500/10 border-indigo-500/25 hover:bg-indigo-500/25 text-indigo-300'
          }`}
        >
          <X className="size-5" />
        </button>

        <style dangerouslySetInnerHTML={{
          __html: `
            .kids-modal-scroll::-webkit-scrollbar {
              width: 10px;
            }
            .kids-modal-scroll::-webkit-scrollbar-track {
              background: rgba(12, 8, 39, 0.5);
              border-radius: 999px;
            }
            .kids-modal-scroll::-webkit-scrollbar-thumb {
              background: ${isGirl ? 'linear-gradient(to bottom, #EC4899, #F43F5E)' : 'linear-gradient(to bottom, #6366F1, #8B5CF6)'};
              border-radius: 999px;
              border: 2px solid #0C0827;
            }
            .kids-modal-scroll::-webkit-scrollbar-thumb:hover {
              background: ${isGirl ? 'linear-gradient(to bottom, #F43F5E, #E11D48)' : 'linear-gradient(to bottom, #8B5CF6, #7C3AED)'};
            }
          `
        }} />

        {/* Scrollable Container for dialog elements */}
        <div className="w-full flex flex-col items-center gap-5 p-6 md:p-8 overflow-y-auto max-h-[80vh] z-10 kids-modal-scroll">

          {/* 🤖 Playful Mascot Header */}
          <div className="flex flex-col items-center text-center gap-2 animate-bounce" style={{ animationDuration: '5s' }}>
            <div className="relative w-16 h-16">
              <Image src={mascotSrc} alt="Mascote Busca" fill className="object-contain drop-shadow-[0_6px_12px_rgba(99,102,241,0.4)]" />
            </div>
            <div>
              <h3 className="text-yellow-300 font-black text-base md:text-xl tracking-wide uppercase" style={{ fontFamily: "'Baloo 2', cursive" }}>
                {childName ? `O que vamos encontrar hoje, ${childName}? 🚀` : 'O que vamos encontrar hoje? 🚀'}
              </h3>
              <p className="text-indigo-200 text-xxs md:text-xs font-bold">Pesquise seus desenhos e filmes favoritos!</p>
            </div>
          </div>

          {/* 🔍 Corrected Non-misspelled Placeholder Search Bar */}
          <div className="w-full max-w-xl relative">
            <div className="absolute inset-y-0 left-4.5 flex items-center pointer-events-none">
              <Search className={`size-5 ${isGirl ? 'text-pink-400' : 'text-yellow-400'}`} />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Digite o nome aqui... (ex: Patrulha Canina)"
              className={`w-full py-3.5 pl-12 pr-6 rounded-[24px] bg-[#08051E]/90 border-2 font-black text-xs md:text-sm outline-none transition-all placeholder:text-indigo-300/35 text-white ${
                isGirl 
                  ? 'border-pink-500/25 focus:border-pink-400 focus:shadow-[0_0_20px_rgba(236,72,153,0.25)]' 
                  : 'border-indigo-500/25 focus:border-yellow-400 focus:shadow-[0_0_20px_rgba(250,204,21,0.3)]'
              }`}
              style={{ fontFamily: "'Nunito', sans-serif" }}
              autoFocus
            />
          </div>

          {/* ✏️ Educational, Non-Spammy Spelling Correction Widget */}
          {correction && correction.wasCorrected && (
            <div
              className={`w-full max-w-lg p-2.5 px-4 rounded-xl border flex items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-300 shadow-md ${
                isGirl 
                  ? 'bg-pink-500/10 border-pink-500/15 text-pink-200' 
                  : 'bg-yellow-400/10 border-yellow-400/15 text-yellow-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className={`size-4.5 shrink-0 ${isGirl ? 'text-pink-400' : 'text-yellow-400'} animate-pulse`} />
                <span className="text-[10px] md:text-xs font-black tracking-wide leading-tight">
                  Que legal! Que tal aprendermos a escrever certinho? Escreve-se: <strong className="text-white font-extrabold underline decoration-wavy decoration-yellow-400 pl-0.5 pr-0.5">{correction.correctedQuery}</strong> 😉
                </span>
              </div>
              <button
                onClick={handleConfirmCorrection}
                className={`px-2.5 py-1 rounded-lg font-black text-[8px] uppercase tracking-wider transition-all border shrink-0 hover:scale-105 active:scale-95 cursor-pointer ${
                  isGirl 
                    ? 'bg-pink-500/20 hover:bg-pink-500/35 border-pink-500/30 text-white' 
                    : 'bg-yellow-400/25 hover:bg-yellow-400/40 border-yellow-400/30 text-indigo-950 font-black'
                }`}
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                Corrigir ✏️
              </button>
            </div>
          )}

          {/* 🎬 Results Catalog (Inline Flow) */}
          <div className="w-full mt-2 flex-grow pr-1">
            {loading ? (
              <div className="w-full py-12 flex flex-col items-center justify-center gap-3 text-white">
                <div className={`w-10 h-10 border-4 border-indigo-500/20 rounded-full animate-spin ${
                  isGirl ? 'border-t-pink-500' : 'border-t-yellow-400'
                }`}></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300" style={{ fontFamily: "'Baloo 2', cursive" }}>Buscando a mágica...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-6">
                {results.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onPlayContent(item);
                      onClose();
                    }}
                    className={`group relative rounded-xl overflow-hidden border cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-md flex flex-col ${
                      isGirl 
                        ? 'border-pink-500/15 hover:border-pink-400/30 shadow-pink-950/5' 
                        : 'border-white/5 hover:border-violet-500/20 shadow-indigo-950/10'
                    }`}
                  >
                    {/* Poster Thumbnail */}
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-indigo-950/40">
                      {item.posterUrl ? (
                        <img
                          src={item.posterUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center gap-1.5">
                          <AlertCircle className="size-6 text-indigo-400/25" />
                          <span className="text-[9px] text-indigo-300/30 font-bold uppercase tracking-wider">Sem Imagem</span>
                        </div>
                      )}
                      
                      {/* Glowing Hover Play Trigger */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FFE775] to-[#FFD100] flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
                          <Play className="size-4.5 fill-indigo-950 text-indigo-955 ml-0.5" />
                        </div>
                      </div>

                      {/* Rating Score Badge */}
                      <div className="absolute top-2.5 left-2.5 bg-[#0F0A28]/95 backdrop-blur-md border border-white/5 px-1.5 py-0.5 rounded-lg flex items-center gap-0.5">
                        <Star className="size-2.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-[8px] font-black text-white">{item.score || '8.5'}</span>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="p-2.5 bg-[#0D082A] flex flex-col justify-between">
                      <h4 className="text-white text-[10px] md:text-xs font-black tracking-wide line-clamp-1 group-hover:text-yellow-300 transition-colors" style={{ fontFamily: "'Nunito', sans-serif" }}>
                        {item.title}
                      </h4>
                      <div className="flex items-center justify-between mt-1 text-[8px] text-indigo-300 font-extrabold uppercase tracking-wider">
                        <span>{item.type === 'tv' ? 'Série' : 'Filme'}</span>
                        <span>{item.year || ''}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : query.trim() ? (
              <div className="w-full py-12 flex flex-col items-center text-center gap-1.5 text-indigo-300/50 font-bold text-[10px] md:text-xs">
                <AlertCircle className="size-6 text-indigo-400/20 animate-pulse" />
                <p>Nenhum desenho mágico encontrado com este nome.</p>
                <p className="text-[9px] text-indigo-400/30 font-medium">Dica: Busque por "Patrulha", "Bob Esponja" ou "Carros"!</p>
              </div>
            ) : (
              <div className="w-full py-12 flex flex-col items-center text-center gap-1.5 text-indigo-300/30 font-bold text-[9px] md:text-xs uppercase tracking-widest select-none">
                <Sparkles className="size-6 text-yellow-400/15 mb-1 animate-pulse" />
                <span>Digite para iniciar a busca mágica!</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
