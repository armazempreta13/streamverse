'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Gamepad2, Sparkles, Heart } from 'lucide-react';

interface KidsGameCardProps {
  game: any;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string, e: React.MouseEvent) => void;
}

export function KidsGameCard({ game, isFavorite = false, onToggleFavorite }: KidsGameCardProps) {
  // Map category to a specific glowing gradient theme
  const getGlowTheme = (cat: string) => {
    switch (cat) {
      case "Aventuras Divertidas": return "hover:border-sky-400 hover:shadow-[0_20px_40px_rgba(56,189,248,0.25)]";
      case "Espaço & Robôs": return "hover:border-indigo-400 hover:shadow-[0_20px_40px_rgba(129,140,248,0.25)]";
      case "Jogos Inteligentes": return "hover:border-emerald-400 hover:shadow-[0_20px_40px_rgba(52,211,153,0.25)]";
      case "Criatividade": return "hover:border-pink-400 hover:shadow-[0_20px_40px_rgba(244,114,182,0.25)]";
      case "Corridas Divertidas": return "hover:border-orange-400 hover:shadow-[0_20px_40px_rgba(251,146,60,0.25)]";
      default: return "hover:border-violet-400 hover:shadow-[0_20px_40px_rgba(167,139,250,0.25)]";
    }
  };

  const glowClass = getGlowTheme(game.category);

  return (
    <div
      className={`group relative cursor-pointer overflow-hidden rounded-[28px] border bg-[#0F0A28]/95 p-3 transition-all duration-500 hover:-translate-y-2.5 hover:scale-[1.03] active:scale-95 hover:rotate-0.5 shadow-lg border-white/5 flex flex-col h-full ${glowClass}`}
    >
      {/* Background radial gradient overlay on hover */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Image Cover container */}
      <div className="relative w-full aspect-[16/10] rounded-[20px] overflow-hidden bg-[#0C0626] select-none shadow-inner border border-white/5">
        <Image
          src={game.thumbnail}
          alt={game.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-w-768px) 100vw, (max-w-1200px) 50vw, 33vw"
        />
        
        {/* Rating age label */}
        <span className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-yellow-400/90 text-indigo-955 text-[10px] font-extrabold uppercase shadow-md backdrop-blur-sm select-none">
          ⭐ {game.ageRating}
        </span>
        
        {/* Players live count */}
        <span className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-black/60 text-yellow-300 text-[10px] font-bold border border-white/10 select-none flex items-center gap-1.5 backdrop-blur-sm">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
          {game.playersCount || "10K jogando"}
        </span>

        {/* Favorite Heart Button over thumbnail */}
        {onToggleFavorite && (
          <button
            onClick={(e) => onToggleFavorite(game.id, e)}
            className="absolute bottom-3 right-3 p-2 rounded-xl bg-[#0F0A28]/85 border border-white/10 hover:border-pink-500/30 text-white hover:text-pink-500 transition-all z-20 pointer-events-auto hover:scale-110 active:scale-90 shadow-md"
          >
            <Heart className={`size-4 transition-all ${isFavorite ? 'fill-pink-500 text-pink-500 scale-110' : 'text-indigo-200'}`} />
          </button>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0A28] via-transparent to-transparent opacity-60 pointer-events-none" />
      </div>

      {/* Card Content details */}
      <div className="p-4 flex flex-col justify-between flex-grow space-y-4 relative z-10 text-left">
        <div className="space-y-2">
          <span className="text-violet-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 leading-none">
            <Sparkles className="size-3 text-pink-400 animate-pulse" />
            {game.category}
          </span>
          <h3 
            className="text-xl font-black text-white tracking-tight leading-tight group-hover:text-yellow-400 transition-colors" 
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            {game.title}
          </h3>
          <p className="text-indigo-200/80 text-xs leading-relaxed font-bold line-clamp-3">
            {game.description}
          </p>
        </div>

        {/* Tags & Action Button */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-wrap gap-1.5">
            {game.tags.slice(0, 3).map((tag: string, i: number) => (
              <span key={i} className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-extrabold uppercase tracking-wide">
                #{tag}
              </span>
            ))}
          </div>

          <Link href={`/kids/play/${game.id}`} className="block w-full">
            <button
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              <Gamepad2 className="size-4 animate-pulse text-white" />
              Jogar Agora!
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
