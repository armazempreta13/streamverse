'use client';

import React from 'react';
import { siteConfig } from '@/config/site';

const KANJI = ['鬼', '剣', '夢', '力', '空', '火', '風', '雷', '闇', '光', '魂', '命', '竜', '忍', '神'];

export function OtakuAtmosphere() {
  if (!siteConfig.features.otakuPremium) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">

      {/* ═══════════════════════════════════════════════
          LAYER 0 — Japanese Scenery with Parallax Drift
          ═══════════════════════════════════════════════ */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-[-30px] bg-cover bg-center bg-no-repeat opacity-[0.12] animate-sceneDrift will-change-transform"
          style={{ 
            backgroundImage: 'url(/bd.png)',
            mixBlendMode: 'screen',
          }} 
        />
        {/* Overlay to replace expensive CSS filters, using normal blend to ensure darkness */}
        <div className="absolute inset-0 bg-[#050510]/85" />
        {/* Edge fade — melts into darkness at borders */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-transparent to-[#050510]/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050510]/60 via-transparent to-[#050510]/60" />
      </div>

      {/* ═══════════════════════════════════════════════
          LAYER 1 — Cinematic Ambient Glow Orbs
          ═══════════════════════════════════════════════ */}
      <div className="absolute top-[-10%] right-[-5%] w-[70%] h-[700px] bg-[radial-gradient(ellipse_at_center,_rgba(255,51,102,0.15)_0%,_rgba(255,51,102,0.02)_40%,_transparent_70%)] mix-blend-screen animate-glowPulse will-change-[opacity,transform]" />
      <div className="absolute top-[20%] left-[-10%] w-[50%] h-[600px] bg-[radial-gradient(ellipse_at_center,_rgba(143,68,255,0.15)_0%,_rgba(143,68,255,0.02)_40%,_transparent_70%)] mix-blend-screen animate-glowPulse2 will-change-[opacity,transform]" />
      <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[500px] bg-[radial-gradient(ellipse_at_center,_rgba(255,51,102,0.1)_0%,_transparent_70%)] mix-blend-screen animate-glowPulse will-change-[opacity,transform]" />
      
      {/* Warm lantern glow — bottom center, like the lanterns in the image */}
      <div className="absolute bottom-[25%] left-[35%] w-[200px] h-[200px] bg-[radial-gradient(circle,_rgba(255,160,64,0.15)_0%,_rgba(255,128,32,0.05)_40%,_transparent_70%)] animate-lanternGlow will-change-opacity" />
      <div className="absolute bottom-[30%] left-[55%] w-[150px] h-[150px] bg-[radial-gradient(circle,_rgba(255,160,64,0.1)_0%,_transparent_70%)] animate-lanternGlow2 will-change-opacity" />

      {/* ═══════════════════════════════════════════════
          LAYER 2 — Subtle Dot Grid Texture
          ═══════════════════════════════════════════════ */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-screen" 
        style={{ 
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)', 
          backgroundSize: '32px 32px' 
        }} 
      />

      {/* ═══════════════════════════════════════════════
          LAYER 3 — Vertical Kanji Watermarks (Poster-style)
          ═══════════════════════════════════════════════ */}
      <div className="absolute top-[12%] right-8 opacity-[0.025] mix-blend-screen select-none">
         <span className="text-[120px] leading-[0.8] font-black text-white" style={{ writingMode: 'vertical-rl' }}>呪術廻戦</span>
      </div>
      <div className="absolute top-[35%] left-6 opacity-[0.018] select-none">
        <span className="text-[100px] font-black text-[#FF3366]" style={{ writingMode: 'vertical-rl' }}>進撃</span>
      </div>

      {/* ═══════════════════════════════════════════════
          LAYER 4 — Manga Panel Accent Lines
          ═══════════════════════════════════════════════ */}
      <div className="absolute top-0 right-[8%] w-[1px] h-[35%] bg-gradient-to-b from-transparent via-[#FF3366]/15 to-transparent" />
      <div className="absolute top-[15%] right-[12%] w-[1px] h-[25%] bg-gradient-to-b from-transparent via-[#8F44FF]/10 to-transparent" />
      <div className="absolute bottom-0 left-[6%] w-[1px] h-[30%] bg-gradient-to-t from-transparent via-[#FF3366]/10 to-transparent" />

      {/* ═══════════════════════════════════════════════
          LAYER 5 — Floating Kanji Characters
          ═══════════════════════════════════════════════ */}
      {KANJI.map((k, i) => (
        <div
          key={i}
          className="absolute text-white/[0.018] font-bold select-none"
          style={{
            fontSize: `${40 + (i % 5) * 15}px`,
            left: `${(i * 7) % 90}%`,
            top: `${10 + (i * 6) % 80}%`,
            fontFamily: 'serif',
            animation: `floatK ${12 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
          }}
        >
          {k}
        </div>
      ))}

      {/* ═══════════════════════════════════════════════
          LAYER 6 — Sakura Petals (Realistic Falling)
          ═══════════════════════════════════════════════ */}
      <div className="absolute inset-0 opacity-70 overflow-hidden z-[5]">
         {[...Array(15)].map((_, i) => {
           const size = Math.random() * 6 + 4;
           const isLarge = i < 8;
           return (
             <div 
               key={i}
               className="absolute mix-blend-screen"
               style={{
                 width: `${isLarge ? size * 1.8 : size}px`,
                 height: `${(isLarge ? size * 1.8 : size) * 1.2}px`,
                 background: isLarge 
                   ? 'linear-gradient(135deg, #FFB8D4 0%, #FF90B8 100%)' 
                   : 'linear-gradient(135deg, #FFA6C9 0%, #FF80B3 100%)',
                 left: `${Math.random() * 110 - 5}%`,
                 top: `-60px`,
                 opacity: Math.random() * 0.5 + (isLarge ? 0.4 : 0.15),
                 borderRadius: '50% 0 50% 50%',
                 transform: `rotate(${Math.random() * 360}deg)`,
                 boxShadow: isLarge ? '0 0 8px rgba(255,166,201,0.2)' : 'none',
                 animation: `sakuraFall${isLarge ? 'Slow' : ''} ${Math.random() * 12 + (isLarge ? 16 : 10)}s cubic-bezier(0.4, 0, 0.2, 1) infinite`,
                 animationDelay: `-${Math.random() * 25}s`,
                 willChange: 'transform'
               }}
             />
           )
         })}
      </div>

      {/* ═══════════════════════════════════════════════
          LAYER 7 — Fireflies / Particles (Anime Night Feel)
          ═══════════════════════════════════════════════ */}
      <div className="absolute inset-0 z-[6] pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div
            key={`ff-${i}`}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 3 + 2}px`,
              height: `${Math.random() * 3 + 2}px`,
              background: i % 3 === 0 ? '#FFA040' : i % 3 === 1 ? '#FF3366' : '#8F44FF',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0,
              boxShadow: `0 0 4px ${i % 3 === 0 ? '#FFA040' : i % 3 === 1 ? '#FF3366' : '#8F44FF'}`,
              animation: `fireflyFloat ${8 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 12}s`,
              willChange: 'transform, opacity'
            }}
          />
        ))}
      </div>

      {/* ═══════════════════════════════════════════════
          LAYER 8 — Shooting Star / Comet (Rare, Cinematic)
          ═══════════════════════════════════════════════ */}
      <div className="absolute top-[15%] left-[10%] w-[200px] h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent rotate-[35deg] opacity-0 animate-shootingStar z-[7]" />
      <div className="absolute top-[40%] right-[20%] w-[150px] h-[1px] bg-gradient-to-r from-transparent via-[#FF3366]/50 to-transparent rotate-[25deg] opacity-0 animate-shootingStar2 z-[7]" />

      {/* ═══════════════════════════════════════════════
          LAYER 9 — Atmospheric Fog / Mist
          ═══════════════════════════════════════════════ */}
      <div className="absolute bottom-0 left-0 w-full h-[40%] bg-gradient-to-t from-[#0D0015]/30 via-[#0D0015]/10 to-transparent animate-fogDrift z-[3] will-change-transform" />
      <div className="absolute bottom-[5%] left-[-10%] w-[120%] h-[20%] bg-gradient-to-t from-[#1a0025]/20 to-transparent animate-fogDrift2 z-[3] will-change-transform" />

      {/* ═══════════════════════════════════════════════
          LAYER 10 — Sakura Branch Silhouette (SVG)
          ═══════════════════════════════════════════════ */}
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] opacity-[0.035]">
        <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M400 400 C350 350, 300 380, 280 340 C260 300, 290 260, 250 240 C210 220, 230 180, 200 160 C180 145, 190 120, 170 100" 
                stroke="#FF3366" strokeWidth="2" fill="none" opacity="0.8" />
          {[
            { cx: 280, cy: 340 }, { cx: 250, cy: 240 }, { cx: 200, cy: 160 }, { cx: 170, cy: 100 },
            { cx: 265, cy: 310 }, { cx: 235, cy: 220 }, { cx: 185, cy: 140 }
          ].map((pos, i) => (
            <g key={i}>
              {[0, 72, 144, 216, 288].map((deg, j) => (
                <ellipse
                  key={j}
                  cx={pos.cx} cy={pos.cy} rx="8" ry="16"
                  fill="#FF3366"
                  transform={`rotate(${deg}, ${pos.cx}, ${pos.cy})`}
                  opacity="0.5"
                />
              ))}
            </g>
          ))}
        </svg>
      </div>

      {/* ═══════════════════════════════════════════════
          LAYER 11 — Cinematic Vignette
          ═══════════════════════════════════════════════ */}
      <div className="absolute inset-0 z-[8]" style={{
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(5,5,16,0.4) 100%)'
      }} />

      {/* ═══════════════════════════════════════════════
          ANIMATIONS
          ═══════════════════════════════════════════════ */}
      <style jsx>{`
        @keyframes sakuraFall {
          0% { transform: translate3d(0, -60px, 0) rotate(0deg); }
          25% { transform: translate3d(-50px, 25vh, 0) rotate(90deg); }
          50% { transform: translate3d(-120px, 50vh, 0) rotate(180deg); }
          75% { transform: translate3d(-80px, 75vh, 0) rotate(270deg); }
          100% { transform: translate3d(-200px, 110vh, 0) rotate(360deg); }
        }
        @keyframes sakuraFallSlow {
          0% { transform: translate3d(0, -60px, 0) rotate(0deg) scale(1); }
          25% { transform: translate3d(40px, 25vh, 0) rotate(-60deg) scale(1.1); }
          50% { transform: translate3d(-80px, 50vh, 0) rotate(-150deg) scale(0.95); }
          75% { transform: translate3d(20px, 75vh, 0) rotate(-240deg) scale(1.05); }
          100% { transform: translate3d(-60px, 110vh, 0) rotate(-360deg) scale(1); }
        }
        @keyframes floatK {
          0%, 100% { transform: translateY(0px); opacity: 0.018; }
          50% { transform: translateY(-18px); opacity: 0.035; }
        }
        @keyframes sceneDrift {
          0%, 100% { transform: scale(1.05) translate(0px, 0px); }
          25% { transform: scale(1.06) translate(5px, -3px); }
          50% { transform: scale(1.07) translate(-3px, -6px); }
          75% { transform: scale(1.06) translate(-5px, -2px); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        @keyframes glowPulse2 {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes lanternGlow {
          0%, 100% { opacity: 1; }
          30% { opacity: 0.5; }
          60% { opacity: 0.8; }
          80% { opacity: 0.4; }
        }
        @keyframes lanternGlow2 {
          0%, 100% { opacity: 0.6; }
          40% { opacity: 1; }
          70% { opacity: 0.3; }
        }
        @keyframes fireflyFloat {
          0% { opacity: 0; transform: translate(0, 0) scale(0.5); }
          15% { opacity: 0.8; transform: translate(15px, -20px) scale(1); }
          30% { opacity: 0.3; transform: translate(-10px, -35px) scale(0.8); }
          50% { opacity: 0.9; transform: translate(25px, -15px) scale(1.2); }
          70% { opacity: 0.2; transform: translate(-5px, -40px) scale(0.6); }
          85% { opacity: 0.7; transform: translate(10px, -25px) scale(1); }
          100% { opacity: 0; transform: translate(0, -50px) scale(0.5); }
        }
        @keyframes shootingStar {
          0%, 92%, 100% { opacity: 0; transform: rotate(35deg) translateX(0); }
          94% { opacity: 0.6; transform: rotate(35deg) translateX(100px); }
          96% { opacity: 0; transform: rotate(35deg) translateX(300px); }
        }
        @keyframes shootingStar2 {
          0%, 85%, 100% { opacity: 0; transform: rotate(25deg) translateX(0); }
          87% { opacity: 0.5; transform: rotate(25deg) translateX(80px); }
          89% { opacity: 0; transform: rotate(25deg) translateX(250px); }
        }
        @keyframes fogDrift {
          0%, 100% { transform: translateX(0); opacity: 0.3; }
          50% { transform: translateX(30px); opacity: 0.15; }
        }
        @keyframes fogDrift2 {
          0%, 100% { transform: translateX(0); opacity: 0.2; }
          50% { transform: translateX(-40px); opacity: 0.1; }
        }

        .animate-sceneDrift { animation: sceneDrift 25s ease-in-out infinite; }
        .animate-glowPulse { animation: glowPulse 8s ease-in-out infinite; }
        .animate-glowPulse2 { animation: glowPulse2 10s ease-in-out infinite; }
        .animate-lanternGlow { animation: lanternGlow 4s ease-in-out infinite; }
        .animate-lanternGlow2 { animation: lanternGlow2 5s ease-in-out infinite; }
        .animate-shootingStar { animation: shootingStar 18s linear infinite; }
        .animate-shootingStar2 { animation: shootingStar2 25s linear infinite; }
        .animate-fogDrift { animation: fogDrift 20s ease-in-out infinite; }
        .animate-fogDrift2 { animation: fogDrift2 16s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
