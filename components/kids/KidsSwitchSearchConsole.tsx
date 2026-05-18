'use client';

import React from 'react';
import { Search, Gamepad2 } from 'lucide-react';

interface KidsSwitchSearchConsoleProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function KidsSwitchSearchConsole({ searchQuery, setSearchQuery }: KidsSwitchSearchConsoleProps) {
  return (
    <div className="relative group w-full max-w-2xl mx-auto">
      {/* Dynamic ambient violet glow behind the search box */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-[22px] blur opacity-25 group-hover:opacity-40 transition duration-700 pointer-events-none" />
      
      {/* Sleek Glassmorphic Container */}
      <div className="relative flex items-center rounded-[20px] bg-[#0F0A28]/90 border border-white/10 overflow-hidden shadow-2xl transition-all duration-300 group-hover:border-violet-500/30">
        
        {/* Decorative prefix icon badge */}
        <div className="flex items-center justify-center pl-5 text-indigo-300 shrink-0">
          <Gamepad2 className="size-5 text-violet-400 group-hover:scale-110 transition-transform duration-300" />
        </div>

        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Buscar jogo infantil no StreamVerse Play..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-4.5 pl-3 bg-transparent text-white placeholder-indigo-200/35 font-extrabold text-sm focus:outline-none focus:placeholder-indigo-300/10 transition-all"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          />
          
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-400 hover:text-pink-300 font-extrabold uppercase text-xxs tracking-widest transition-colors"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Dynamic Action Trigger Search Icon */}
        <div className="flex items-center justify-center pr-5 text-yellow-400 shrink-0">
          <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 shadow-inner group-hover:bg-violet-500/25 transition-colors">
            <Search className="size-4 text-yellow-300" />
          </div>
        </div>

      </div>
    </div>
  );
}
