'use client';

import React from 'react';
import { CATEGORIES_LIST } from '@/config/kidsGames';

interface CategoryPillsSelectorProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export function CategoryPillsSelector({ selectedCategory, setSelectedCategory }: CategoryPillsSelectorProps) {
  // Helper to map category display names to pretty labels & emojis
  const getCategoryDetails = (cat: string) => {
    switch (cat) {
      case "Aventuras Divertidas": return { icon: "🏃‍♂️", label: "Aventuras", activeBg: "bg-sky-400 border-sky-500 text-sky-950 shadow-[0_5px_0_#07031A]" };
      case "Jogos Inteligentes": return { icon: "🧩", label: "Raciocínio", activeBg: "bg-emerald-400 border-emerald-500 text-emerald-955 shadow-[0_5px_0_#07031A]" };
      case "Pintar & Criar": return { icon: "🎨", label: "Criar & Pintar", activeBg: "bg-pink-400 border-pink-500 text-pink-955 shadow-[0_5px_0_#07031A]" };
      case "Animais Fofos": return { icon: "🐱", label: "Animais", activeBg: "bg-yellow-400 border-yellow-500 text-yellow-955 shadow-[0_5px_0_#07031A]" };
      case "Corridas Malucas": return { icon: "🏎️", label: "Corridas", activeBg: "bg-orange-400 border-orange-500 text-orange-955 shadow-[0_5px_0_#07031A]" };
      default: return { icon: "🕹️", label: cat, activeBg: "bg-indigo-400 border-indigo-500 text-indigo-955 shadow-[0_5px_0_#07031A]" };
    }
  };

  return (
    <div className="flex items-center gap-3.5 overflow-x-auto pb-4 scrollbar-hide px-2 -mx-4 justify-start lg:justify-center">
      {/* Tudo Button */}
      <button
        onClick={() => setSelectedCategory("Tudo")}
        className={`px-6 py-4 rounded-[26px] font-black text-sm uppercase tracking-wider transition-all border-4 border-[#07031A] flex items-center gap-2.5 shrink-0 ${
          selectedCategory === "Tudo"
            ? 'bg-yellow-400 text-indigo-955 shadow-[0_5px_0_#07031A] -translate-y-1'
            : 'bg-[#1b1050] hover:bg-[#25186b] text-indigo-200 shadow-[0_3px_0_#07031A] hover:-translate-y-0.5'
        }`}
        style={{ fontFamily: "'Baloo 2', cursive" }}
      >
        🚀 Tudo
      </button>
      
      {/* Category Loop */}
      {CATEGORIES_LIST.map((cat, idx) => {
        const isSelected = selectedCategory === cat;
        const details = getCategoryDetails(cat);
        
        const buttonClass = isSelected 
          ? details.activeBg + ' -translate-y-1'
          : 'bg-[#1b1050] hover:bg-[#25186b] text-indigo-200 shadow-[0_3px_0_#07031A] hover:-translate-y-0.5';
          
        return (
          <button
            key={idx}
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-4 rounded-[26px] font-black text-sm uppercase tracking-wider transition-all whitespace-nowrap border-4 border-[#07031A] flex items-center gap-2.5 shrink-0 ${buttonClass}`}
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            <span className="text-lg">{details.icon}</span>
            <span>{details.label}</span>
          </button>
        );
      })}
    </div>
  );
}
