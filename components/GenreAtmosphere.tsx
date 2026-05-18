'use client';

import React from 'react';
import { siteConfig } from '@/config/site';

interface GenreAtmosphereProps {
  genres?: string[];
  theme?: 'default' | 'anime';
}

type AtmosphereType = 'terror' | 'ficcao' | 'romance' | 'anime' | 'acao' | 'drama';

// Map raw genres list to primary atmosphere type
function getAtmosphere(genres: string[] = [], theme?: 'default' | 'anime'): AtmosphereType {
  if (theme === 'anime') return 'anime';
  
  const gList = genres.map(g => g.toLowerCase());
  
  if (gList.some(g => g.includes('terror') || g.includes('horror') || g.includes('mistério') || g.includes('thriller') || g.includes('suspense'))) {
    return 'terror';
  }
  if (gList.some(g => g.includes('ficção') || g.includes('sci-fi') || g.includes('fantasia') || g.includes('espacial') || g.includes('futurista'))) {
    return 'ficcao';
  }
  if (gList.some(g => g.includes('romance') || g.includes('romântico') || g.includes('amor') || g.includes('família') || g.includes('comédia romântica'))) {
    return 'romance';
  }
  if (gList.some(g => g.includes('anime') || g.includes('animação') || g.includes('animes'))) {
    return 'anime';
  }
  if (gList.some(g => g.includes('ação') || g.includes('aventura') || g.includes('guerra') || g.includes('intenso'))) {
    return 'acao';
  }
  return 'drama';
}

export function GenreAtmosphere({ genres = [], theme }: GenreAtmosphereProps) {
  // 1. HARD OFF Toggle: If disabled in global config, render absolutely nothing!
  if (!siteConfig.features.enableGenreAtmosphere) {
    return null;
  }

  const atmosphere = getAtmosphere(genres, theme);

  // Styling and gradient settings for each atmosphere
  const config = {
    terror: {
      bgColor: '#020205',
      ambient1: 'rgba(59, 4, 4, 0.28)', // Deep crimson red blur
      ambient2: 'rgba(24, 4, 36, 0.32)',  // Sombrio dark purple blur
      glowIntensity: 'opacity-40',
      vignetteGradient: 'radial-gradient(circle at center, transparent 20%, rgba(2, 2, 5, 0.8) 70%, #020205 100%)',
      particleColor: 'rgba(160, 20, 20, 0.35)', // Charcoal blood ash
      particleCount: 8,
      speedMultiplier: 1.5,
      hasGrain: true,
    },
    ficcao: {
      bgColor: '#02040b',
      ambient1: 'rgba(0, 180, 216, 0.18)', // Neon Cyan
      ambient2: 'rgba(143, 68, 255, 0.22)', // Royal Violet
      glowIntensity: 'opacity-30',
      vignetteGradient: 'radial-gradient(circle at center, transparent 35%, rgba(2, 4, 11, 0.75) 80%, #02040b 100%)',
      particleColor: 'rgba(0, 220, 255, 0.4)', // Holographic cyan dot
      particleCount: 12,
      speedMultiplier: 0.9,
      hasGrain: false,
    },
    romance: {
      bgColor: '#070405',
      ambient1: 'rgba(224, 90, 139, 0.16)', // Soft Rose
      ambient2: 'rgba(204, 163, 90, 0.15)', // Cozy Golden warm
      glowIntensity: 'opacity-25',
      vignetteGradient: 'radial-gradient(circle at center, transparent 40%, rgba(7, 4, 5, 0.7) 85%, #070405 100%)',
      particleColor: 'rgba(255, 180, 200, 0.3)', // Warm rose embers
      particleCount: 10,
      speedMultiplier: 0.7,
      hasGrain: false,
    },
    anime: {
      bgColor: '#04030d',
      ambient1: 'rgba(255, 51, 102, 0.24)', // Vibrant Sakura Pink
      ambient2: 'rgba(143, 68, 255, 0.28)', // Cyber Otaku Purple
      glowIntensity: 'opacity-40',
      vignetteGradient: 'radial-gradient(circle at center, transparent 30%, rgba(4, 3, 13, 0.8) 75%, #04030d 100%)',
      particleColor: 'rgba(255, 80, 130, 0.55)', // Glowing pink petals
      particleCount: 15,
      speedMultiplier: 1.1,
      hasGrain: false,
    },
    acao: {
      bgColor: '#020202',
      ambient1: 'rgba(217, 77, 26, 0.25)', // Blazing neon orange
      ambient2: 'rgba(96, 20, 184, 0.22)', // Fast violet spark
      glowIntensity: 'opacity-35',
      vignetteGradient: 'radial-gradient(circle at center, transparent 25%, rgba(2, 2, 2, 0.85) 75%, #020202 100%)',
      particleColor: 'rgba(255, 120, 50, 0.45)', // Energetic fire embers
      particleCount: 14,
      speedMultiplier: 1.8,
      hasGrain: true,
    },
    drama: {
      bgColor: '#040407',
      ambient1: 'rgba(59, 63, 92, 0.12)',  // Matte royal indigo
      ambient2: 'rgba(30, 30, 36, 0.14)',  // Cool titanium gray
      glowIntensity: 'opacity-15',
      vignetteGradient: 'radial-gradient(circle at center, transparent 45%, rgba(4, 4, 7, 0.65) 90%, #040407 100%)',
      particleColor: 'rgba(200, 200, 220, 0.25)', // Minimal silver dust
      particleCount: 6,
      speedMultiplier: 0.5,
      hasGrain: false,
    },
  }[atmosphere];

  return (
    <div 
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0 transition-colors duration-[1500ms]"
      style={{ backgroundColor: config.bgColor }}
    >
      {/* SCOPED GPU OPTIMIZED KEYFRAMES */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatUp {
          0% {
            transform: translate3d(0, 105vh, 0) scale(0.8) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translate3d(var(--drift), -5vh, 0) scale(1.2) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes subtlePulse {
          0%, 100% { transform: scale(1) translate3d(0,0,0); opacity: 0.85; }
          50% { transform: scale(1.08) translate3d(15px, -10px, 0); opacity: 1; }
        }
        @keyframes subtlePulseRev {
          0%, 100% { transform: scale(1.05) translate3d(0,0,0); opacity: 0.85; }
          50% { transform: scale(0.95) translate3d(-15px, 15px, 0); opacity: 0.7; }
        }
        @keyframes filmGrain {
          0%, 100% { transform: translate3d(0,0,0); }
          10% { transform: translate3d(-1%, -1%, 0); }
          30% { transform: translate3d(1%, 2%, 0); }
          50% { transform: translate3d(-2%, -3%, 0); }
          70% { transform: translate3d(3%, 1%, 0); }
          90% { transform: translate3d(-1%, 3%, 0); }
        }
      `}} />

      {/* 1. AmbientLayer: Large glowing blur ambient light rings mapped to GPU transform & scale */}
      <div className={`absolute inset-0 w-full h-full mix-blend-screen transition-opacity duration-1000 ${config.glowIntensity}`}>
        {/* Glow Light Ring 1 */}
        <div 
          className="absolute -top-[10%] -left-[10%] w-[60%] h-[70%] rounded-full blur-[140px] transition-colors duration-1000"
          style={{
            background: config.ambient1,
            animation: 'subtlePulse 14s ease-in-out infinite',
            willChange: 'transform, opacity',
            contain: 'strict',
          }}
        />
        {/* Glow Light Ring 2 */}
        <div 
          className="absolute -bottom-[10%] -right-[10%] w-[65%] h-[75%] rounded-full blur-[150px] transition-colors duration-1000"
          style={{
            background: config.ambient2,
            animation: 'subtlePulseRev 18s ease-in-out infinite',
            willChange: 'transform, opacity',
            contain: 'strict',
          }}
        />
      </div>

      {/* 2. GradientLayer: Highlight spotlights and center gradients */}
      <div 
        className="absolute inset-0 w-full h-full mix-blend-overlay opacity-30 transition-all duration-[1500ms]"
        style={{
          background: atmosphere === 'drama' 
            ? 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.08) 0%, transparent 60%)' 
            : 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.15) 100%)',
        }}
      />

      {/* 3. Film Grain Overlay: Highly optimized discrete texture (Only rendered for Terror and Ação) */}
      {config.hasGrain && (
        <div 
          className="absolute -inset-[10%] w-[120%] h-[120%] opacity-[0.025] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            animation: 'filmGrain 0.8s steps(4) infinite',
            willChange: 'transform',
            contain: 'strict',
          }}
        />
      )}

      {/* 4. ParticleLayer: Pure CSS, GPU hardware-accelerated float particles */}
      <div className="absolute inset-0 w-full h-full mix-blend-screen overflow-hidden">
        {Array.from({ length: config.particleCount }).map((_, idx) => {
          // Generate deterministic particle styles based on index to avoid layout shifts and SSR mismatches
          const size = 3 + (idx % 4) * 2; // Size between 3px and 9px
          const delay = (idx * 1.5).toFixed(1);
          const duration = (12 / config.speedMultiplier + (idx % 5) * 3).toFixed(1);
          const leftPercent = (5 + (idx * 89) % 90).toFixed(0);
          const drift = (idx % 2 === 0 ? 80 : -80) + (idx % 3) * 30; // Left/Right drift amount

          return (
            <div
              key={idx}
              className="absolute rounded-full"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: config.particleColor,
                left: `${leftPercent}%`,
                top: '-20px',
                filter: 'blur(1px)',
                boxShadow: `0 0 8px 1px ${config.particleColor}`,
                animation: `floatUp ${duration}s linear infinite`,
                animationDelay: `${delay}s`,
                willChange: 'transform, opacity',
                transform: 'translate3d(0, 105vh, 0)',
                contain: 'strict',
                // Custom CSS variable injected directly for keyframe reuse
                // @ts-ignore
                '--drift': `${drift}px`,
              }}
            />
          );
        })}
      </div>

      {/* 5. VignetteLayer: Heavy cinematic vinheta with linear and radial gradients */}
      <div 
        className="absolute inset-0 w-full h-full transition-all duration-[1200ms]"
        style={{
          background: config.vignetteGradient,
          contain: 'strict',
        }}
      />
    </div>
  );
}
