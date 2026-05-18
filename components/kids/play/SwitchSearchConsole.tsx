'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface SwitchSearchConsoleProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function SwitchSearchConsole({ searchQuery, setSearchQuery }: SwitchSearchConsoleProps) {
  return (
    <div className="relative group p-2 rounded-[34px] bg-[#1a0e4c] border-6 border-[#07031A] shadow-[0_12px_0_#07031A]">
      {/* Glowing neon background shadow */}
      <div className="absolute inset-0 bg-yellow-400/10 rounded-[28px] blur-xl group-hover:bg-yellow-400/20 transition-all pointer-events-none" />
      
      <div className="flex items-center relative rounded-[24px] bg-[#100835] overflow-hidden">
        
        {/* Left Switch Joystick (Neon Red style accent) */}
        <div className="hidden sm:flex items-center gap-1.5 px-4 py-2 border-r-4 border-[#07031A] bg-[#221054]">
          <div className="size-5 rounded-full bg-pink-500 border-2 border-[#07031A] shadow-inner" />
          <div className="flex flex-col gap-0.5 opacity-60">
            <span className="w-2.5 h-0.75 bg-indigo-300 rounded" />
            <span className="w-2.5 h-0.75 bg-indigo-300 rounded" />
          </div>
        </div>

        {/* Main Search Input field */}
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Digite o nome do seu jogo favorito..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-5 pl-14 bg-transparent text-white placeholder-violet-300/40 font-black text-lg focus:outline-none focus:placeholder-violet-400/10 transition-all"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          />
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-6 text-yellow-400 group-hover:scale-110 transition-transform" />
          
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-400 hover:text-white font-black uppercase text-sm tracking-wider"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Right Switch Joystick (Neon Blue style accent) */}
        <div className="hidden sm:flex items-center gap-1.5 px-4 py-2 border-l-4 border-[#07031A] bg-[#221054]">
          <div className="flex flex-col gap-0.5 opacity-60 text-xxs font-black text-indigo-300">
            <span>A</span>
            <span>B</span>
          </div>
          <div className="size-5 rounded-full bg-cyan-400 border-2 border-[#07031A] shadow-inner" />
        </div>

      </div>
    </div>
  );
}
