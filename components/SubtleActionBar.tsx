'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Share2, Check, Bookmark } from 'lucide-react';
import { useWatchlist } from '@/contexts/WatchlistContext';
import clsx from 'clsx';

interface SubtleActionBarProps {
  item: {
    id: string;
    type: 'movie' | 'tv';
    title: string;
    posterUrl: string;
    backdropUrl?: string;
  };
  theme?: 'default' | 'anime';
}

export function SubtleActionBar({ item, theme = 'default' }: SubtleActionBarProps) {
  const router = useRouter();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const [copied, setCopied] = React.useState(false);

  const inList = isInWatchlist(item.id, item.type);

  const handleShare = async () => {
    const shareData = {
      title: item.title,
      text: `Assista ${item.title} online no StreamVerse!`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Error copying to clipboard:', err);
      }
    }
  };

  return (
    <div className="flex items-center justify-center gap-4 mt-2">
      {/* Back Button */}
      <button 
        onClick={() => router.back()} 
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/10 bg-[#0D0F14]/40 hover:bg-white/10 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md backdrop-blur-md group"
        title="Voltar"
      >
        <ArrowLeft className="size-4 sm:size-5 transition-transform group-hover:-translate-x-0.5" />
      </button>

      {/* Bookmark (Watchlist) Button */}
      <button
        onClick={() => toggleWatchlist(item)}
        className={clsx(
          "w-10 h-10 sm:w-12 sm:h-12 rounded-full border flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md backdrop-blur-md",
          inList 
            ? (theme === 'anime' ? "bg-[#FF3366]/20 border-[#FF3366]/50 text-[#FF3366]" : "bg-[#8F44FF]/20 border-[#8F44FF]/50 text-[#A661FF]")
            : "bg-[#0D0F14]/40 border-white/10 hover:bg-white/10 text-white/70 hover:text-white"
        )}
        title={inList ? "Remover da Lista" : "Adicionar à Lista"}
      >
        {inList ? (
          <Check className="size-4 sm:size-5" />
        ) : (
          <Bookmark className="size-4 sm:size-5" />
        )}
      </button>

      {/* Share Button */}
      <button 
        onClick={handleShare}
        className={clsx(
          "w-10 h-10 sm:w-12 sm:h-12 rounded-full border flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md backdrop-blur-md",
          copied
            ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
            : "bg-[#0D0F14]/40 border-white/10 hover:bg-white/10 text-white/70 hover:text-white"
        )}
        title={copied ? "Link Copiado!" : "Compartilhar"}
      >
        {copied ? (
          <Check className="size-4 sm:size-5" />
        ) : (
          <Share2 className="size-4 sm:size-5" />
        )}
      </button>
    </div>
  );
}
