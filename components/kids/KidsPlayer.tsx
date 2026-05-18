import React from 'react';
import { ArrowLeft, Gamepad } from 'lucide-react';
import Link from 'next/link';
import { KIDS_GAMES_CATALOG } from '@/config/kidsGames';

interface KidsPlayerProps {
  title: string;
  iframeUrl: string;
  onClose: () => void;
}

export function KidsPlayer({ title, iframeUrl, onClose }: KidsPlayerProps) {
  // Simple algorithm to recommend highly matching game based on cartoon title
  const getRelatedGame = (movieTitle: string) => {
    const titleLower = movieTitle.toLowerCase();
    if (titleLower.includes('espaço') || titleLower.includes('nave') || titleLower.includes('astro') || titleLower.includes('lego')) {
      return KIDS_GAMES_CATALOG.find(g => g.id === 'slope-racing-3d') || KIDS_GAMES_CATALOG[3];
    }
    if (titleLower.includes('corrida') || titleLower.includes('moto') || titleLower.includes('carro')) {
      return KIDS_GAMES_CATALOG.find(g => g.id === 'moto-x3m-spooky-land') || KIDS_GAMES_CATALOG[4];
    }
    if (titleLower.includes('boneca') || titleLower.includes('maquiagem') || titleLower.includes('lol')) {
      return KIDS_GAMES_CATALOG.find(g => g.id === 'lol-surprise-insta-party') || KIDS_GAMES_CATALOG[5];
    }
    // Default to the legendary Cut the Rope 1!
    return KIDS_GAMES_CATALOG[0];
  };

  const relatedGame = getRelatedGame(title);

  return (
    <div className="fixed inset-0 z-[50000] bg-black/95 flex flex-col justify-between animate-in fade-in duration-500 select-none">
      {/* Interactive header connecting cartoon to games */}
      <div className="px-6 py-4 bg-gradient-to-b from-[#03020F] to-transparent flex items-center justify-between z-10 gap-4">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-6 rounded-full bg-[#B47FFF] shadow-[0_0_8px_#822BFF]" />
          <h3 className="text-white text-xs sm:text-sm font-black tracking-tight uppercase" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Assistindo: <span className="text-[#B47FFF]">{title}</span>
          </h3>
        </div>

        <div className="flex items-center gap-3">
          {relatedGame && (
            <Link href={`/kids/play/${relatedGame.id}`} onClick={onClose}>
              <button 
                className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#61F2C2] to-[#00DF93] text-[#030F0A] font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-md shadow-[#00DF93]/20 border border-[#61F2C2]/20 animate-button-bloom"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                <Gamepad className="size-4 text-[#030F0A]" />
                <span>Jogar Game do Desenho! 🎮</span>
              </button>
            </Link>
          )}

          <button
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-md"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            <ArrowLeft className="size-4" />
            <span>Voltar</span>
          </button>
        </div>
      </div>

      {/* Clean Player Sandbox */}
      <div className="flex-1 w-full bg-black relative flex items-center justify-center">
        <iframe
          src={iframeUrl}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0 z-0"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
        />
      </div>

      {/* Interactive recommendation bottom bar */}
      <div className="px-6 py-4 bg-gradient-to-t from-[#03020F] to-transparent text-center z-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-black uppercase text-indigo-300/80">
        <div>StreamVerse Kids • Ambiente blindado livre de anúncios e compras</div>
        
        {relatedGame && (
          <Link href={`/kids/play/${relatedGame.id}`} onClick={onClose} className="md:hidden">
            <button 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#61F2C2] to-[#00DF93] text-[#030F0A] font-black tracking-wider transition-all"
            >
              <Gamepad className="size-3.5" />
              <span>Jogar Game do Desenho! 🎮</span>
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
