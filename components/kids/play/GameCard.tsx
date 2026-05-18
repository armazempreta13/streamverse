'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Gamepad2, Sparkles } from 'lucide-react';
import { GameItem } from '@/config/kidsGames';

interface GameCardProps {
  game: any; // Dynamic virtual game item
}

export function GameCard({ game }: GameCardProps) {
  return (
    <div
      className="group relative rounded-[42px] border-4 border-[#07031A] bg-[#150d3f] overflow-hidden transition-all duration-300 hover:-translate-y-2 shadow-[0_8px_0_#07031A] hover:shadow-[0_15px_0_#07031A] flex flex-col h-full"
    >
      {/* Glowing dynamic background shadow based on active category */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Image Cover container */}
      <div className="relative w-full aspect-[16/10] overflow-hidden border-b-4 border-[#07031A] bg-indigo-950">
        <Image
          src={game.thumbnail}
          alt={game.title}
          fill
          className="object-cover group-hover:scale-108 transition-transform duration-500"
          sizes="(max-w-768px) 100vw, (max-w-1200px) 50vw, 33vw"
        />
        
        {/* Rating age label */}
        <span className="absolute top-4 left-4 px-3.5 py-1.5 rounded-2xl bg-yellow-400 border-2 border-[#07031A] text-indigo-955 text-xs font-black uppercase tracking-wider select-none shadow-[0_2px_0_#07031A]">
          ⭐ {game.ageRating}
        </span>
        
        {/* Players live count */}
        <span className="absolute top-4 right-4 px-3 py-1.5 rounded-2xl bg-[#07031A]/85 text-yellow-300 text-xs font-black border border-yellow-400/25 select-none flex items-center gap-1.5">
          <Gamepad2 className="size-3.5 animate-pulse text-yellow-400" />
          {game.playersCount || "10K jogando"}
        </span>
        <div className="absolute inset-0 bg-gradient-to-t from-[#150d3f] via-transparent to-transparent opacity-60 pointer-events-none" />
      </div>

      {/* Card Content details */}
      <div className="p-6 flex flex-col justify-between flex-grow space-y-4 relative z-10">
        <div className="space-y-2">
          <span className="text-violet-400 text-xs font-black uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="size-3 text-pink-400 animate-spin" />
            {game.category}
          </span>
          <h3 
            className="text-2xl font-black text-white tracking-tight leading-tight group-hover:text-yellow-400 transition-colors" 
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            {game.title}
          </h3>
          <p className="text-indigo-200/80 text-sm leading-relaxed font-bold line-clamp-3">
            {game.description}
          </p>
        </div>

        {/* Tags & Action Button */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-wrap gap-1.5">
            {game.tags.slice(0, 3).map((tag: string, i: number) => (
              <span key={i} className="px-3 py-1 rounded-xl bg-[#201456] border border-indigo-500/30 text-indigo-300 text-xxs font-black uppercase tracking-wide">
                #{tag}
              </span>
            ))}
          </div>

          <Link href={`/kids/play/${game.id}`} className="block w-full">
            <button
              className={`w-full py-4 rounded-[22px] bg-gradient-to-r ${game.bgColor || "from-pink-500 to-rose-600"} border-4 border-[#07031A] text-white font-black text-base uppercase tracking-wider shadow-[0_5px_0_#07031A] hover:shadow-[0_8px_0_#07031A] active:translate-y-1 active:shadow-[0_0_0_#07031A] hover:brightness-110 active:brightness-95 transition-all flex items-center justify-center gap-2.5`}
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              <Gamepad2 className="size-5 animate-pulse text-white" />
              Jogar Agora!
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
