'use client';

import React, { useState } from 'react';
import { LayoutGrid, Swords, Compass, Smile, Flame, Wand2, Heart, Rocket, Ghost, Coffee } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';

// Mapping categories exactly as in the screenshot
const categories = [
  { id: 'todos', label: 'Todos', icon: LayoutGrid },
  { id: '10759', label: 'Ação', icon: Swords },       // Action & Adventure in TMDB
  { id: '10765', label: 'Fantasia', icon: Wand2 },    // Sci-Fi & Fantasy
  { id: '35', label: 'Comédia', icon: Smile },
  { id: '18', label: 'Drama', icon: Flame },
  { id: '10749', label: 'Romance', icon: Heart },
  { id: '878', label: 'Sci-Fi', icon: Rocket },
  { id: '27', label: 'Terror', icon: Ghost },
  { id: '36', label: 'Slice of Life', icon: Coffee },
];

export function AnimeCategoriesBar() {
  const [active, setActive] = useState('todos');

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 md:px-10 mt-2 mb-10 overflow-x-auto scrollbar-hide relative">
      {/* Sombras suaves nas laterais para indicar scroll */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#050510] to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#050510] to-transparent pointer-events-none z-10" />
      
      <div className="flex items-center gap-8 md:gap-12 border-b border-white/[0.03] pb-5 min-w-max">
        {categories.map((cat) => {
          const isActive = active === cat.id;
          const Icon = cat.icon;
          return (
            <Link
              href={cat.id === 'todos' ? '/animes' : `/search?type=tv&genre=${cat.id}&genreName=${cat.label}`}
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className="flex flex-col items-center gap-2 group relative cursor-pointer"
            >
              <div className={clsx(
                "p-3.5 rounded-2xl transition-all duration-500 relative",
                isActive 
                  ? "text-[#8F44FF] bg-gradient-to-br from-[#8F44FF]/20 to-[#8F44FF]/5 shadow-[0_0_20px_rgba(143,68,255,0.15)] ring-1 ring-[#8F44FF]/20" 
                  : "text-[#8A93A6] group-hover:text-white group-hover:bg-white/5 ring-1 ring-transparent group-hover:ring-white/10"
              )}>
                <Icon className={clsx("size-[22px]", isActive && "drop-shadow-[0_0_8px_rgba(143,68,255,0.8)]")} strokeWidth={isActive ? 2.5 : 1.5} />
              </div>
              <span className={clsx(
                "text-[11px] uppercase tracking-widest font-bold transition-all duration-300 mt-1",
                isActive ? "text-white" : "text-[#8A93A6] group-hover:text-white"
              )}>
                {cat.label}
              </span>
              
              {/* Active Indicator Line */}
              {isActive && (
                <div className="absolute -bottom-[21px] w-[140%] left-1/2 -translate-x-1/2 h-[3px] bg-gradient-to-r from-transparent via-[#8F44FF] to-transparent shadow-[0_0_12px_#8F44FF] rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
