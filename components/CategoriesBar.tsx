'use client';

import React, { useState } from 'react';
import { LayoutGrid, Film, Tv, Flame, Star, Zap, Heart, Search } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';

const categories = [
  { id: 'todos', label: 'Início', icon: LayoutGrid, href: '/' },
  { id: 'movies', label: 'Filmes', icon: Film, href: '/search?type=movie' },
  { id: 'series', label: 'Séries', icon: Tv, href: '/search?type=tv' },
  { id: 'trending', label: 'Em Alta', icon: Flame, href: '/search?type=movie&sort=trending' },
  { id: 'popular', label: 'Populares', icon: Star, href: '/search?type=movie&sort=popular' },
  { id: 'action', label: 'Ação', icon: Zap, href: '/search?type=movie&genre=28&genreName=Ação' },
  { id: 'romance', label: 'Romance', icon: Heart, href: '/search?type=movie&genre=10749&genreName=Romance' },
];

export function CategoriesBar() {
  const [active, setActive] = useState('todos');

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 md:px-10 mt-4 mb-8 overflow-x-auto scrollbar-hide relative">
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#050510] to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#050510] to-transparent pointer-events-none z-10" />
      
      <div className="flex items-center gap-6 md:gap-10 border-b border-white/[0.05] pb-5 min-w-max">
        {categories.map((cat) => {
          const isActive = active === cat.id;
          const Icon = cat.icon;
          return (
            <Link
              href={cat.href}
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className="flex flex-col items-center gap-2 group relative cursor-pointer"
            >
              <div className={clsx(
                "p-3.5 rounded-2xl transition-all duration-500 relative",
                isActive 
                  ? "text-white bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.1)] ring-1 ring-white/20" 
                  : "text-[#8A93A6] group-hover:text-white group-hover:bg-white/5 ring-1 ring-transparent group-hover:ring-white/10"
              )}>
                <Icon className={clsx("size-[22px]", isActive && "drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]")} strokeWidth={isActive ? 2.5 : 1.5} />
              </div>
              <span className={clsx(
                "text-[11px] uppercase tracking-widest font-bold transition-all duration-300 mt-1",
                isActive ? "text-white" : "text-[#8A93A6] group-hover:text-white"
              )}>
                {cat.label}
              </span>
              
              {isActive && (
                <div className="absolute -bottom-[21px] w-[140%] left-1/2 -translate-x-1/2 h-[3px] bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_12px_#ffffff] rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
