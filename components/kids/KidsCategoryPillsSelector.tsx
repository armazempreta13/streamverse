'use client';

import React from 'react';
import { CATEGORIES_LIST } from '@/config/kidsGames';

interface KidsCategoryPillsSelectorProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export function KidsCategoryPillsSelector({ selectedCategory, setSelectedCategory }: KidsCategoryPillsSelectorProps) {
  const getCategoryDetails = (cat: string) => {
    switch (cat) {
      case "Aventuras Divertidas": return { icon: "🎮", label: "Aventuras", activeBg: "bg-gradient-to-r from-sky-400 to-blue-500 border-sky-400 text-white shadow-lg shadow-sky-500/20" };
      case "Espaço & Robôs": return { icon: "🚀", label: "Espaço & Robôs", activeBg: "bg-gradient-to-r from-indigo-400 to-blue-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/20" };
      case "Jogos Inteligentes": return { icon: "🧩", label: "Raciocínio", activeBg: "bg-gradient-to-r from-emerald-400 to-teal-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20" };
      case "Criatividade": return { icon: "🎨", label: "Criatividade", activeBg: "bg-gradient-to-r from-pink-400 to-rose-500 border-pink-400 text-white shadow-lg shadow-pink-500/20" };
      case "Dinossauros": return { icon: "🦖", label: "Dinossauros", activeBg: "bg-gradient-to-r from-amber-500 to-orange-600 border-amber-500 text-white shadow-lg shadow-amber-500/20" };
      case "Fantasia": return { icon: "🏰", label: "Fantasia", activeBg: "bg-gradient-to-r from-purple-400 to-indigo-600 border-purple-400 text-white shadow-lg shadow-purple-500/20" };
      case "Relaxantes": return { icon: "🐼", label: "Relaxantes", activeBg: "bg-gradient-to-r from-teal-300 to-cyan-500 border-teal-300 text-[#030F0A] shadow-lg shadow-teal-500/20" };
      case "Música & Ritmo": return { icon: "🎵", label: "Música & Ritmo", activeBg: "bg-gradient-to-r from-fuchsia-400 to-pink-600 border-fuchsia-400 text-white shadow-lg shadow-fuchsia-500/20" };
      case "Corridas Divertidas": return { icon: "🏎️", label: "Corridas", activeBg: "bg-gradient-to-r from-orange-400 to-red-500 border-orange-400 text-white shadow-lg shadow-orange-500/20" };
      case "Arcade Mágico": return { icon: "👾", label: "Arcade Mágico", activeBg: "bg-gradient-to-r from-violet-500 to-indigo-600 border-violet-400 text-white shadow-lg shadow-violet-500/20" };
      default: return { icon: "🕹️", label: cat, activeBg: "bg-gradient-to-r from-violet-500 to-indigo-600 border-violet-400 text-white shadow-lg shadow-violet-500/20" };
    }
  };

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide px-2 -mx-4 justify-start lg:justify-center select-none">
      <button
        onClick={() => setSelectedCategory("Tudo")}
        className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border shrink-0 flex items-center gap-2 ${
          selectedCategory === "Tudo"
            ? 'bg-gradient-to-r from-yellow-400 to-amber-500 border-yellow-400 text-indigo-955 shadow-lg shadow-yellow-500/20 -translate-y-0.5'
            : 'bg-[#0F0A28]/85 border-white/5 hover:border-violet-500/30 text-indigo-200 hover:text-white shadow-md hover:-translate-y-0.5'
        }`}
        style={{ fontFamily: "'Nunito', sans-serif" }}
      >
        🌟 Tudo
      </button>
      
      {CATEGORIES_LIST.map((cat, idx) => {
        const isSelected = selectedCategory === cat;
        const details = getCategoryDetails(cat);
        
        const buttonClass = isSelected 
          ? details.activeBg + ' -translate-y-0.5'
          : 'bg-[#0F0A28]/85 border-white/5 hover:border-violet-500/30 text-indigo-200 hover:text-white shadow-md hover:-translate-y-0.5';
          
        return (
          <button
            key={idx}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap border flex items-center gap-2 shrink-0 ${buttonClass}`}
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            <span className="text-base">{details.icon}</span>
            <span>{details.label}</span>
          </button>
        );
      })}
    </div>
  );
}
