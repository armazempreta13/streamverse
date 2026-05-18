import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Star, Settings, Search } from 'lucide-react';

interface KidsNavbarProps {
  screenTimeLimit: number;
  timeRemaining: number;
  formatTimeRemaining: () => string;
  onOpenParentGate: () => void;
  showFavoritesOnly?: boolean;
  onToggleShowFavorites?: () => void;
  childGender?: 'boy' | 'girl' | 'neutral';
  onOpenSearch?: () => void;
  backHref?: string;
}

export function KidsNavbar({
  screenTimeLimit,
  timeRemaining,
  formatTimeRemaining,
  onOpenParentGate,
  showFavoritesOnly = false,
  onToggleShowFavorites,
  childGender = 'boy',
  onOpenSearch,
  backHref = '/kids',
}: KidsNavbarProps) {
  return (
    <header className="absolute top-0 left-0 w-full z-50 px-6 py-7 md:px-12 flex items-center justify-between bg-gradient-to-b from-[#03020F]/90 via-[#03020F]/30 to-transparent pointer-events-auto">
      <div className="flex items-center gap-4">
        <Link 
          href={backHref} 
          className="flex items-center justify-center size-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 text-white hover:text-yellow-300 transition-all shadow-md"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex items-center select-none">
            <span className="text-2xl font-black text-white tracking-tighter" style={{ fontFamily: "'Nunito', sans-serif" }}>STREAMVERSE</span>
            <span className="ml-1.5 px-3 py-0.5 rounded-lg bg-gradient-to-r from-[#822BFF] to-[#FF1F6D] text-white text-[10px] font-black uppercase tracking-widest transform -rotate-2 shadow-lg shadow-pink-500/20">KIDS</span>
          </div>
        </div>
      </div>

      {/* Live Timer & Settings controls */}
      <div className="flex items-center gap-3">
        {screenTimeLimit > 0 && timeRemaining > 0 && (
          <div className="hidden sm:flex items-center gap-2 bg-[#FF1F6D]/15 border border-[#FF75A9]/35 px-4 py-2 rounded-full text-xs font-black text-[#FF75A9] uppercase select-none shadow-inner">
            <Clock className="size-4 animate-pulse text-[#FF1F6D]" />
            <span>{formatTimeRemaining()}</span>
          </div>
        )}
        
        {onToggleShowFavorites && (
          <button
            onClick={onToggleShowFavorites}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all hover:scale-105 active:scale-95 shadow-md border ${
              showFavoritesOnly 
                ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-indigo-950 shadow-yellow-500/30 border-yellow-400 font-black' 
                : 'bg-gradient-to-r from-[#FF75A9] to-[#FF1F6D] text-white shadow-[#FF1F6D]/20 border-[#FF75A9]/20 font-black'
            }`}
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            <Star className={`size-4 ${showFavoritesOnly ? 'fill-indigo-950 text-indigo-950' : 'text-white'}`} />
            <span className="hidden sm:inline">
              {showFavoritesOnly ? 'Ver Todos' : 'Meus Favoritos'}
            </span>
          </button>
        )}
        
        <button
          onClick={onOpenParentGate}
          className="flex items-center justify-center size-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/30 hover:text-white/80 transition-all duration-300 shadow-md"
          title="Controles Parentais"
          aria-label="Controles Parentais"
        >
          <Settings className="size-5" />
        </button>
        
        {onOpenSearch ? (
          <button 
            onClick={onOpenSearch}
            className="flex items-center justify-center size-10 rounded-full bg-gradient-to-r from-[#FFE775] to-[#FFD100] text-indigo-950 transition-all hover:scale-105 active:scale-95 shadow-md shadow-[#FFD100]/25 hover:shadow-[#FFD100]/50 border border-[#FFE775]/25 cursor-pointer"
          >
            <Search className="size-5 font-bold text-indigo-955" />
          </button>
        ) : (
          <Link 
            href="/search"
            className="flex items-center justify-center size-10 rounded-full bg-gradient-to-r from-[#FFE775] to-[#FFD100] text-indigo-950 transition-all hover:scale-105 active:scale-95 shadow-md shadow-[#FFD100]/25 hover:shadow-[#FFD100]/50 border border-[#FFE775]/25"
          >
            <Search className="size-5 font-bold text-indigo-955" />
          </Link>
        )}
      </div>
    </header>
  );
}
