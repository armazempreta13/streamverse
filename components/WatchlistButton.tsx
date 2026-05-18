'use client';

import React from 'react';
import { Plus, Check } from 'lucide-react';
import { useWatchlist } from '@/contexts/WatchlistContext';
import clsx from 'clsx';

interface WatchlistButtonProps {
  item: {
    id: string;
    type: 'movie' | 'tv';
    title: string;
    posterUrl: string;
    backdropUrl?: string;
  };
  className?: string;
  theme?: 'default' | 'anime';
}

export function WatchlistButton({ item, className, theme = 'default' }: WatchlistButtonProps) {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  
  const inList = isInWatchlist(item.id, item.type);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWatchlist(item);
      }}
      className={clsx(
        "flex items-center gap-3 px-7 lg:px-8 py-3.5 lg:py-4 rounded-[8px] font-semibold text-[15px] transition-all duration-300 hover:scale-[1.03] active:scale-95 backdrop-blur-md",
        inList 
          ? (theme === 'anime' ? "bg-[#FF3366]/20 border border-[#FF3366]/40 text-white shadow-[0_0_15px_rgba(255,51,102,0.15)]" : "bg-[#8F44FF]/20 border border-[#8F44FF]/40 text-white shadow-[0_0_15px_rgba(143,68,255,0.15)]")
          : "bg-white/[0.02] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 text-white/60 hover:text-white",
        className
      )}
    >
      {inList ? (
        <>
          <Check className={clsx("size-5 shrink-0", theme === 'anime' ? "text-[#FF3366]" : "text-[#A661FF]")} />
          <span>Na Lista</span>
        </>
      ) : (
        <>
          <Plus className="size-5 text-white/60 shrink-0" />
          <span>Minha Lista</span>
        </>
      )}
    </button>
  );
}
