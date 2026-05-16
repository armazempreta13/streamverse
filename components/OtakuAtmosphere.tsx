'use client';

import React from 'react';
import { siteConfig } from '@/config/site';

export function OtakuAtmosphere() {
  if (!siteConfig.features.otakuPremium) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* 1. Ambient Glow de Estúdio (Cinematográfico e não-intrusivo) */}
      <div className="absolute top-[-10%] right-[-5%] w-[70%] h-[700px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FF3366]/5 via-[#FF3366]/1 to-transparent blur-[120px] mix-blend-screen" />
      <div className="absolute top-[20%] left-[-10%] w-[50%] h-[600px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#8F44FF]/5 via-[#8F44FF]/1 to-transparent blur-[140px] mix-blend-screen" />
      
      {/* 2. Textura sutil (Seigaiha Wave Pattern / Dots Premium) */}
      <div className="absolute inset-0 opacity-[0.04] mix-blend-screen" 
        style={{ 
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)', 
          backgroundSize: '32px 32px' 
        }} 
      />

      {/* Marca D'água Vertical Kanji (Direita) - Estilo Poster Japonês */}
      <div className="absolute top-[15%] right-8 flex flex-col gap-8 opacity-[0.03] mix-blend-screen pointer-events-none select-none z-0">
         <span className="text-[120px] leading-[0.8] font-black text-white transform rotate-90 origin-center tracking-[0.2em]" style={{ writingMode: 'vertical-rl' }}>呪術廻戦</span>
      </div>

      {/* 3. Partículas de Sakura Realistas (CSS Base) */}
      <div className="absolute inset-0 opacity-80 pointer-events-none overflow-hidden z-[5]">
         {[...Array(30)].map((_, i) => {
           const size = Math.random() * 6 + 6;
           return (
             <div 
               key={i}
               className="absolute shadow-[0_0_15px_rgba(255,166,201,0.4)] mix-blend-screen"
               style={{
                 width: `${size}px`,
                 height: `${size * 1.2}px`,
                 background: 'linear-gradient(135deg, #FFA6C9 0%, #FF80B3 100%)',
                 left: `${Math.random() * 100}%`,
                 top: `-50px`,
                 opacity: Math.random() * 0.7 + 0.3,
                 // Perfect petal shape using border-radius
                 borderRadius: '50% 0 50% 50%',
                 transform: `rotate(${Math.random() * 360}deg)`,
                 animation: `sakuraFall ${Math.random() * 12 + 10}s cubic-bezier(0.4, 0, 0.2, 1) infinite`,
                 animationDelay: `-${Math.random() * 20}s`
               }}
             />
           )
         })}
      </div>

      <style jsx>{`
        @keyframes sakuraFall {
          0% {
            transform: translate3d(0, -50px, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(-100px, 50vh, 0) rotate(180deg);
          }
          100% {
            transform: translate3d(-250px, 110vh, 0) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
