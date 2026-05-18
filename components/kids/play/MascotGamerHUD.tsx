'use client';

import React from 'react';
import Image from 'next/image';
import { ShieldCheck, Heart, Monitor } from 'lucide-react';

export function MascotGamerHUD() {
  return (
    <div className="w-full bg-[#1b1050]/95 backdrop-blur-xl border-4 border-[#07031A] rounded-[38px] shadow-[0_12px_0_#07031A] relative overflow-visible group select-none mt-4 p-6 md:p-8">
      {/* Top decorative neon trim */}
      <div className="absolute inset-x-0 -top-1 h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 rounded-t-full opacity-80" />
      
      <div className="flex flex-col md:flex-row items-center gap-6 relative z-10 overflow-visible">
        
        {/* Pop-out 3D Mascot overlapping boundary */}
        <div className="relative md:absolute md:-left-8 md:-top-16 size-28 md:size-36 shrink-0 hover:scale-115 transition-transform duration-500 ease-out select-none self-center">
          <div className="absolute inset-0 bg-yellow-400/25 rounded-full blur-xl animate-pulse" />
          <Image
            src="/kids/mascote.png"
            alt="Mascote Gamer"
            fill
            className="object-contain drop-shadow-[0_12px_24px_rgba(234,179,8,0.85)] animate-bounce"
            style={{ animationDuration: '3.5s' }}
          />
        </div>
        
        {/* Text Area offset to prevent overlap on desktop */}
        <div className="text-center md:text-left space-y-4 md:pl-32 flex-grow">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
            <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-emerald-400 border-2 border-[#07031A] text-emerald-950 text-xs font-black uppercase tracking-wider shadow-[0_3px_0_#07031A] hover:scale-105 transition-transform">
              <ShieldCheck className="size-4" />
              100% Protegido
            </span>
            <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-pink-500 border-2 border-[#07031A] text-white text-xs font-black uppercase tracking-wider shadow-[0_3px_0_#07031A] hover:scale-105 transition-transform">
              <Heart className="size-4 fill-current animate-pulse" />
              COPPA Aprovado
            </span>
            <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-cyan-400 border-2 border-[#07031A] text-cyan-950 text-xs font-black uppercase tracking-wider shadow-[0_3px_0_#07031A] hover:scale-105 transition-transform">
              <Monitor className="size-4" />
              Sem Instalar Nada
            </span>
          </div>
          
          {/* Speech Text Bubble */}
          <p 
            className="text-base md:text-xl font-black text-white leading-relaxed drop-shadow-sm"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            "Ei, campeão! Escolha seu jogo favorito na lista abaixo, use as setinhas ou clique na tela para quebrar todos os recordes espaciais! 👾🎮"
          </p>
        </div>

      </div>
    </div>
  );
}
