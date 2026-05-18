'use client';

import React from 'react';

interface KidsBackgroundDecorationsProps {
  childGender?: 'boy' | 'girl' | 'neutral';
}

const STARS_DATA = [
  // Top region
  { top: 4, left: 12, size: 1.5, opacity: 0.6, delay: 0 },
  { top: 7, left: 45, size: 1, opacity: 0.45, delay: 2 },
  { top: 11, left: 78, size: 2, opacity: 0.7, delay: 1.5 },
  { top: 14, left: 22, size: 1, opacity: 0.35, delay: 3.2 },
  { top: 18, left: 58, size: 1.5, opacity: 0.5, delay: 0.8 },
  { top: 21, left: 88, size: 1, opacity: 0.4, delay: 4.1 },
  { top: 25, left: 33, size: 2, opacity: 0.6, delay: 1.9 },
  // Mid region
  { top: 31, left: 15, size: 1, opacity: 0.35, delay: 2.5 },
  { top: 34, left: 68, size: 1.5, opacity: 0.55, delay: 1.1 },
  { top: 38, left: 48, size: 1, opacity: 0.45, delay: 3.6 },
  { top: 41, left: 82, size: 2, opacity: 0.65, delay: 0.5 },
  { top: 44, left: 28, size: 1.5, opacity: 0.5, delay: 2.7 },
  { top: 47, left: 95, size: 1, opacity: 0.35, delay: 4.8 },
  { top: 51, left: 60, size: 2, opacity: 0.7, delay: 1.6 },
  { top: 55, left: 10, size: 1, opacity: 0.4, delay: 3.1 },
  // Lower region (above clouds)
  { top: 61, left: 40, size: 1.5, opacity: 0.5, delay: 0.3 },
  { top: 64, left: 75, size: 1, opacity: 0.35, delay: 2.2 },
  { top: 67, left: 20, size: 2, opacity: 0.6, delay: 1.4 },
  { top: 71, left: 85, size: 1.5, opacity: 0.45, delay: 3.9 },
  { top: 74, left: 52, size: 1, opacity: 0.3, delay: 4.5 },
  { top: 77, left: 92, size: 2, opacity: 0.65, delay: 0.9 },
  { top: 81, left: 30, size: 1, opacity: 0.4, delay: 2.8 },
  { top: 84, left: 65, size: 1.5, opacity: 0.55, delay: 1.2 },
  { top: 88, left: 16, size: 1, opacity: 0.35, delay: 3.4 }
];

const EXTRA_GLOWING_STARS = [
  { top: 8, left: 18, size: 13, delay: 0 },
  { top: 26, left: 84, size: 11, delay: -2 },
  { top: 48, left: 14, size: 14, delay: -4 },
  { top: 68, left: 76, size: 11, delay: -1 },
  { top: 84, left: 45, size: 13, delay: -3.5 }
];

const DUST_PARTICLES = [
  { top: 12, left: 25, size: 2, delay: 0 },
  { top: 28, left: 60, size: 3, delay: -4 },
  { top: 40, left: 15, size: 2, delay: -8 },
  { top: 55, left: 80, size: 3.5, delay: -2 },
  { top: 72, left: 35, size: 2, delay: -12 },
  { top: 84, left: 70, size: 3, delay: -6 }
];

// Saturn style Ringed Planet
const SaturnPlanet = ({ isGirl }: { isGirl: boolean }) => (
  <div className="absolute top-[16%] right-[11%] pointer-events-none select-none z-0 animate-slow-space-drift">
    <div className="relative flex items-center justify-center">
      {/* Planet Glow Aura */}
      <div className={`absolute w-10 h-10 rounded-full blur-md opacity-35 ${isGirl ? 'bg-pink-400' : 'bg-indigo-400'}`} />
      
      {/* Planet Sphere */}
      <div className={`relative w-6 h-6 rounded-full bg-gradient-to-br border z-10 ${
        isGirl 
          ? 'from-pink-400/40 via-rose-500/35 to-pink-900/30 border-pink-400/20' 
          : 'from-indigo-400/40 via-violet-500/35 to-indigo-900/30 border-indigo-400/20'
      }`} />
      
      {/* Saturn Ring */}
      <div className={`absolute w-12 h-3 border-2 rounded-full transform rotate-[-20deg] z-20 opacity-60 ${
        isGirl ? 'border-pink-300/40' : 'border-indigo-300/40'
      }`} />
    </div>
  </div>
);

// Gaseous Crater Cartoon Planet
const CyanPlanet = ({ isGirl }: { isGirl: boolean }) => (
  <div className="absolute top-[48%] left-[7%] pointer-events-none select-none z-0 animate-slow-space-drift" style={{ animationDelay: '-12s' }}>
    <div className="relative w-5 h-5 rounded-full flex items-center justify-center">
      {/* Glow */}
      <div className={`absolute w-8 h-8 rounded-full blur-md opacity-25 ${isGirl ? 'bg-pink-400/40' : 'bg-cyan-400/30'}`} />
      
      {/* Sphere */}
      <div className={`w-5 h-5 rounded-full bg-gradient-to-br border ${
        isGirl
          ? 'from-fuchsia-500/45 via-pink-600/35 to-fuchsia-900/30 border-fuchsia-400/20'
          : 'from-cyan-500/45 via-blue-600/35 to-cyan-900/30 border-cyan-400/20'
      }`} />
      
      {/* Moon style Crescent Shadow overlay */}
      <div className="absolute inset-0.5 rounded-full bg-gradient-to-tl from-black/50 to-transparent pointer-events-none" />
    </div>
  </div>
);

// Cartoon Crescent Moon SVG
const CrescentMoon = ({ isGirl }: { isGirl: boolean }) => (
  <div className="absolute top-[8%] left-[13%] pointer-events-none select-none z-0 animate-slow-space-drift" style={{ animationDelay: '-6s' }}>
    <div className="relative">
      <svg className={`size-5 transform rotate-[-15deg] transition-colors duration-1000 ${
        isGirl ? 'text-pink-200/30 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]' : 'text-yellow-100/25 drop-shadow-[0_0_8px_rgba(253,224,71,0.25)]'
      }`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.3 22h-.1c-5.5 0-10-4.5-10-10C2.2 6.7 6.5 2.2 11.8 2c.6-.1 1.2.4 1.1 1.1-.1.6-.6 1-1.2 1.1-3.9.5-6.8 3.8-6.8 7.8 0 4.4 3.6 8 8 8 2.2 0 4.3-.9 5.8-2.5.4-.4 1.1-.4 1.4 0 .4.4.3 1.1-.1 1.4-2.1 2-4.9 3.1-7.7 3.1z" />
      </svg>
    </div>
  </div>
);

export function KidsBackgroundDecorations({ childGender = 'boy' }: KidsBackgroundDecorationsProps) {
  const isGirl = childGender === 'girl';

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      
      {/* ── 🌌 CINEMATIC DEEP PORTAL BACKGROUND GRADIENT (Disney/Pixar style) ── */}
      <div 
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: isGirl
            ? 'radial-gradient(circle at 50% 12%, #22061e 0%, #0c020a 65%, #050104 100%)'
            : 'radial-gradient(circle at 50% 12%, #0a0624 0%, #03020e 65%, #010005 100%)'
        }}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes nebulaBreathe {
          0%, 100% { opacity: 0.65; transform: scale(1) translate(0px, 0px); }
          50% { opacity: 0.85; transform: scale(1.04) translate(12px, -8px); }
        }
        @keyframes slowTwinkle {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.75; }
        }
        @keyframes shootingStar1 {
          0% { transform: translate(-100px, -100px) rotate(32deg) scale(0.6); opacity: 0; }
          1% { opacity: 0.95; }
          3% { transform: translate(380px, 200px) rotate(32deg) scale(1.1); opacity: 0; }
          100% { transform: translate(380px, 200px) rotate(32deg) scale(1.1); opacity: 0; }
        }
        @keyframes shootingStar2 {
          0% { transform: translate(120px, -100px) rotate(36deg) scale(0.5); opacity: 0; }
          1% { opacity: 0.9; }
          3.5% { transform: translate(-300px, 200px) rotate(36deg) scale(1.0); opacity: 0; }
          100% { transform: translate(-300px, 200px) rotate(36deg) scale(1.0); opacity: 0; }
        }
        @keyframes slowSpaceDrift {
          0% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          50% { transform: translateY(-16px) translateX(12px) rotate(3deg); }
          100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
        }
        @keyframes dustDrift {
          0% { transform: translate(0px, 0px); opacity: 0.08; }
          50% { opacity: 0.48; }
          100% { transform: translate(75px, -75px); opacity: 0.08; }
        }
        .animate-nebula-breathe {
          animation: nebulaBreathe 22s ease-in-out infinite;
        }
        .animate-twinkle-star {
          animation: slowTwinkle infinite ease-in-out;
        }
        .animate-shooting-star-1 {
          animation: shootingStar1 26s cubic-bezier(0.25, 0.1, 0.25, 1) infinite;
        }
        .animate-shooting-star-2 {
          animation: shootingStar2 34s cubic-bezier(0.25, 0.1, 0.25, 1) infinite;
        }
        .animate-slow-space-drift {
          animation: slowSpaceDrift 28s ease-in-out infinite;
        }
        .animate-dust-drift {
          animation: dustDrift 18s linear infinite;
        }
      `}} />

      {/* ── 🔮 NEBULA COLOR BLOB BREATHING GLOWS (Cinematic volumetric clouds) ── */}
      {/* Top Left Nebula */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[55vw] h-[55vw] rounded-full animate-nebula-breathe filter blur-3xl pointer-events-none transition-all duration-1000" 
        style={{
          background: isGirl
            ? 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)'
        }}
      />
      
      {/* Mid Right Nebula */}
      <div 
        className="absolute top-[25%] right-[-15%] w-[60vw] h-[60vw] rounded-full animate-nebula-breathe filter blur-3xl pointer-events-none transition-all duration-1000" 
        style={{ 
          animationDelay: '-6s',
          background: isGirl
            ? 'radial-gradient(circle, rgba(244,63,94,0.06) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)'
        }} 
      />

      {/* Bottom Left Nebula */}
      <div 
        className="absolute bottom-[10%] left-[-12%] w-[50vw] h-[50vw] rounded-full animate-nebula-breathe filter blur-3xl pointer-events-none transition-all duration-1000" 
        style={{ 
          animationDelay: '-12s',
          background: isGirl
            ? 'radial-gradient(circle, rgba(232,121,249,0.05) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)'
        }} 
      />

      {/* ── ☄️ RARE CINEMATIC METEOR SHOOTING STARS (Sparse and extremely smooth) ── */}
      <div 
        className={`absolute top-[18%] left-[24%] w-36 h-[1.5px] rounded-full pointer-events-none z-0 transform rotate-[32deg] origin-left animate-shooting-star-1 ${
          isGirl 
            ? 'bg-gradient-to-r from-transparent via-pink-400/80 to-white/95' 
            : 'bg-gradient-to-r from-transparent via-cyan-400/80 to-white/95'
        }`} 
      />
      <div 
        className={`absolute top-[45%] right-[20%] w-28 h-[1.5px] rounded-full pointer-events-none z-0 transform rotate-[36deg] origin-left animate-shooting-star-2 ${
          isGirl 
            ? 'bg-gradient-to-r from-transparent via-rose-400/70 to-white/95' 
            : 'bg-gradient-to-r from-transparent via-indigo-400/70 to-white/95'
        }`} 
      />

      {/* ── 🪐 INTEGRATED CARTOON PLANETS & MOONS (Discreet & Slightly Blurred) ── */}
      <CrescentMoon isGirl={isGirl} />
      <SaturnPlanet isGirl={isGirl} />
      <CyanPlanet isGirl={isGirl} />

      {/* ── ✨ TWINKLING COSMIC STARS GRID (Balanced Sizes and Twinkle rates) ── */}
      {STARS_DATA.map((star, idx) => (
        <div
          key={`star-${idx}`}
          className="absolute rounded-full bg-white animate-twinkle-star pointer-events-none"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDelay: `${star.delay}s`,
            animationDuration: `${4 + (idx % 3) * 2.5}s`
          }}
        />
      ))}

      {/* ── 🌟 FOUR-POINT EXTRA GLOWING NINTENDO STYLE STARS ── */}
      {EXTRA_GLOWING_STARS.map((star, idx) => (
        <svg
          key={`glow-star-${idx}`}
          className={`absolute animate-twinkle-star pointer-events-none transition-colors duration-1000 ${
            isGirl ? 'text-pink-300/30' : 'text-yellow-200/25'
          }`}
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
            animationDuration: `${5.5 + (idx % 2) * 3}s`
          }}
        >
          <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
        </svg>
      ))}

      {/* ── 🌫️ SLOW DRifting COSMIC DUST PARTICLES ── */}
      {DUST_PARTICLES.map((dust, idx) => (
        <div
          key={`dust-${idx}`}
          className={`absolute rounded-full animate-dust-drift pointer-events-none ${
            isGirl ? 'bg-pink-300/35' : 'bg-cyan-200/30'
          }`}
          style={{
            top: `${dust.top}%`,
            left: `${dust.left}%`,
            width: `${dust.size}px`,
            height: `${dust.size}px`,
            animationDelay: `${dust.delay}s`
          }}
        />
      ))}

      {/* ── 🕸️ SUBTLE MATRIX CONSTELation LINES (Ultra low opacity mix-blend) ── */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.015] mix-blend-screen"
        style={{
          backgroundImage: isGirl
            ? `
              linear-gradient(rgba(244, 63, 94, 0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(244, 63, 94, 0.15) 1px, transparent 1px)
            `
            : `
              linear-gradient(rgba(139, 92, 246, 0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.15) 1px, transparent 1px)
            `,
          backgroundSize: '90px 90px',
        }}
      />

    </div>
  );
}
