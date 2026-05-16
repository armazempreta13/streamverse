'use client';

import React from 'react';
import { HeroBanner } from '@/components/HeroBanner';
import { ContinueWatching } from '@/components/ContinueWatching';
import { TmdbCarousel } from '@/components/TmdbCarousel';

const KANJI_BG = ['鬼', '剣', '夢', '力', '空', '火', '風', '雷', '闇', '光', '魂', '命', '侍', '忍', '竜'];

export function StandardAnimePage() {
  return (
    <div className="flex-1 relative pb-10 overflow-hidden">
      
      {/* ── Atmospheric Japanese Background ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Dark gradient base with pink/purple tint */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D0010] via-[#050510] to-[#050510]" />
        
        {/* Floating kanji characters */}
        {KANJI_BG.map((kanji, i) => (
          <div
            key={i}
            className="absolute text-white/[0.025] font-bold select-none animate-float-kanji"
            style={{
              fontSize: `${Math.random() * 80 + 40}px`,
              left: `${(i / KANJI_BG.length) * 100 + (Math.random() * 6 - 3)}%`,
              top: `${Math.random() * 80 + 5}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${8 + i * 0.5}s`,
              fontFamily: 'serif',
            }}
          >
            {kanji}
          </div>
        ))}

        {/* Sakura petal decorations */}
        <div className="absolute top-[10%] right-[5%] w-[300px] h-[300px] opacity-[0.06]">
          <svg viewBox="0 0 200 200" fill="none">
            {[0, 72, 144, 216, 288].map((deg, i) => (
              <ellipse
                key={i}
                cx="100" cy="60" rx="30" ry="55"
                fill="#FF3366"
                transform={`rotate(${deg}, 100, 100)`}
                opacity="0.8"
              />
            ))}
          </svg>
        </div>
        <div className="absolute bottom-[20%] left-[3%] w-[200px] h-[200px] opacity-[0.04] rotate-45">
          <svg viewBox="0 0 200 200" fill="none">
            {[0, 72, 144, 216, 288].map((deg, i) => (
              <ellipse
                key={i}
                cx="100" cy="60" rx="30" ry="55"
                fill="#FF6699"
                transform={`rotate(${deg}, 100, 100)`}
                opacity="0.8"
              />
            ))}
          </svg>
        </div>

        {/* Red vertical stripe accent (like manga panels) */}
        <div className="absolute top-0 right-[8%] w-[1px] h-[40%] bg-gradient-to-b from-transparent via-[#FF3366]/20 to-transparent" />
        <div className="absolute top-[20%] right-[12%] w-[1px] h-[30%] bg-gradient-to-b from-transparent via-[#8F44FF]/15 to-transparent" />

        {/* Glow orbs */}
        <div className="absolute top-[30%] left-[20%] w-[500px] h-[500px] rounded-full bg-[#FF3366] opacity-[0.025] blur-[150px]" />
        <div className="absolute top-[50%] right-[10%] w-[400px] h-[400px] rounded-full bg-[#8F44FF] opacity-[0.04] blur-[120px]" />
      </div>

      {/* ── Japanese Title Banner ── */}
      <div className="relative z-10">
        <div className="w-full max-w-[1600px] mx-auto px-6 md:px-10 pt-8 pb-2 flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] tracking-[0.5em] text-[#FF3366]/70 font-bold uppercase">アニメワールド</span>
            <div className="flex items-baseline gap-3 mt-1">
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">MUNDO ANIME</h2>
              <span className="text-[#FF3366] font-bold text-lg">·</span>
              <span className="text-sm text-[#8A93A6] font-medium">世界</span>
            </div>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-[#FF3366]/30 via-[#8F44FF]/20 to-transparent ml-4" />
          <div className="flex flex-col items-end gap-1">
            <span className="text-[9px] text-[#FF3366]/50 tracking-widest uppercase">Now Streaming</span>
            <span className="text-[9px] text-[#8A93A6]/40 tracking-widest">配信中</span>
          </div>
        </div>
      </div>

      {/* ── Hero Banner ── */}
      <div className="relative z-10">
        <HeroBanner category="anime" />
      </div>

      {/* ── Gradient fusion hero → content ── */}
      <div className="relative z-20 w-full h-0">
        <div className="absolute inset-x-0 bottom-0 h-[250px] bg-gradient-to-b from-transparent via-[#050510]/80 to-[#050510] pointer-events-none" />
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-full max-w-[800px] h-[300px] bg-[#FF3366] rounded-[100%] opacity-[0.04] blur-[120px] pointer-events-none" />
      </div>

      {/* ── Continue Watching with JP label ── */}
      <div className="relative z-30 mt-4 sm:mt-8">
        <div className="w-full max-w-[1600px] mx-auto px-6 md:px-10 mb-1 flex items-center gap-2">
          <span className="text-[9px] tracking-[0.4em] text-[#FF3366]/50 font-bold">継続中</span>
          <div className="h-px w-8 bg-[#FF3366]/20" />
        </div>
        <ContinueWatching />
      </div>

      {/* ── Content Sections ── */}
      <div className="mt-8 space-y-16 relative z-10">

        {/* Novos Episódios */}
        <div className="relative">
          <div className="absolute top-[-16px] left-6 md:left-10 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF3366] animate-pulse" />
            <span className="text-[9px] tracking-[0.35em] text-[#FF3366]/60 font-bold uppercase">新着エピソード</span>
          </div>
          <TmdbCarousel 
            title="Novos Episódios" 
            endpoint="recent_anime" 
            cardStyle="media" 
            seeAllHref="/search?type=anime"
            badge="NOVO"
          />
        </div>

        {/* Decorative horizontal divider — Japanese style */}
        <div className="w-full max-w-[1600px] mx-auto px-6 md:px-10 flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#FF3366]/20 to-transparent" />
          <span className="text-[#FF3366]/30 text-lg font-bold">⛩</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#FF3366]/20 to-transparent" />
        </div>

        {/* Top Em Alta */}
        <div className="relative">
          <div className="absolute top-[-16px] left-6 md:left-10 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8F44FF] animate-pulse" />
            <span className="text-[9px] tracking-[0.35em] text-[#8F44FF]/60 font-bold uppercase">トレンド · Trending</span>
          </div>
          <TmdbCarousel 
            title="TOP 10 EM ALTA 🔥 炎" 
            endpoint="anime" 
            cardStyle="trending" 
            seeAllHref="/search?type=anime"
          />
        </div>
        
        {/* Populares */}
        <div className="relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[30%] h-full bg-[#FF3366] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.02] pointer-events-none -z-10" />
          <div className="absolute top-[-16px] left-6 md:left-10 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24] animate-pulse" />
            <span className="text-[9px] tracking-[0.35em] text-[#FBBF24]/60 font-bold uppercase">人気作品 · Populares</span>
          </div>
          <TmdbCarousel 
            title="Mais Assistidos" 
            endpoint="anime" 
            cardStyle="media" 
            seeAllHref="/search?type=anime"
          />
        </div>

        {/* Bottom Japanese watermark */}
        <div className="w-full max-w-[1600px] mx-auto px-6 md:px-10 py-6 flex items-center justify-center gap-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#FF3366]/10" />
          <span className="text-[11px] text-[#8A93A6]/20 tracking-[0.4em] font-bold">アニメ · STREAMVERSE · 配信</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#FF3366]/10" />
        </div>
      </div>

      {/* Floating kanji animation keyframes injected via style tag */}
      <style jsx global>{`
        @keyframes float-kanji {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.025; }
          50% { transform: translateY(-20px) rotate(3deg); opacity: 0.04; }
        }
        .animate-float-kanji {
          animation: float-kanji linear infinite;
        }
      `}</style>
    </div>
  );
}
