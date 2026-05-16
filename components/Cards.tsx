'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { siteConfig } from '@/config/site';

interface MediaCardProps {
  title: string;
  subtitle: string;
  imageUrl: string;
  progress?: number; // 0 to 100
  slug: string;
  href?: string;
  className?: string;
  theme?: 'default' | 'anime';
}

export function MediaCard({ title, subtitle, imageUrl, progress, slug, href, className, theme = 'default' }: MediaCardProps) {
  return (
    <Link 
      href={href || `/content/${slug}`} 
      className={`group cursor-pointer shrink-0 block relative transition-all duration-500 ${className || 'w-[280px] sm:w-[300px] lg:w-[320px]'}`}
    >
      <div className={`aspect-[16/10] bg-[#0A0A16] relative overflow-hidden transition-all duration-500 hover:-translate-y-2 z-10 ring-1 ring-white/5 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] ${
        theme === 'anime' 
          ? 'rounded-[8px] group-hover:ring-[#FF3366]/50 shadow-[0_0_20px_rgba(255,51,102,0)] group-hover:shadow-[0_0_25px_rgba(255,51,102,0.2)]' 
          : 'rounded-[16px] group-hover:ring-[#8F44FF]/40 shadow-[0_0_20px_rgba(143,68,255,0)] group-hover:shadow-[0_0_25px_rgba(143,68,255,0.1)]'
      }`}>
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        {/* Advanced Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-[#050510]/20 to-transparent opacity-90 group-hover:opacity-60 transition-opacity duration-700" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050510]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        {/* Hover overlay play button - Ultra Premium */}
        <div className="absolute inset-0 flex items-center justify-center">
           <div className={`w-14 h-14 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-500 ease-out ${
             theme === 'anime' && siteConfig.features.crunchyrollStyleLayout
               ? 'bg-[#FF3366]/80 backdrop-blur-sm shadow-[0_0_30px_rgba(255,51,102,0.4)]'
               : 'bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)]'
           }`}>
             <Play className="size-6 fill-white text-white ml-1 group-hover:animate-pulse" />
           </div>
        </div>

        {/* 'Novo' Badge for Anime Theme */}
        {theme === 'anime' && siteConfig.features.crunchyrollStyleLayout && (
          <div className="absolute top-2 right-2 bg-[#B838F5] text-white text-[9px] font-black tracking-wider px-2 py-0.5 rounded shadow-lg uppercase z-20">
            Novo
          </div>
        )}

        {/* Content Info */}
        <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-500">
          <div className="flex justify-between items-end mb-1.5">
            <h3 className={`font-display font-bold text-[17px] leading-tight text-white line-clamp-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-colors ${
              theme === 'anime' ? 'group-hover:text-[#FF3366]' : 'group-hover:text-[#A661FF]'
            }`}>
              {title}
            </h3>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
               <p className={`text-[10px] text-white/50 font-bold tracking-[0.15em] uppercase transition-colors ${
                 theme === 'anime' ? 'group-hover:text-[#FF3366]/80' : 'group-hover:text-[#A661FF]/80'
               }`}>{subtitle}</p>
               {progress !== undefined && <div className={`w-1 h-1 rounded-full ${theme === 'anime' ? 'bg-[#FF3366]/40' : 'bg-[#8F44FF]/40'}`} />}
               {progress !== undefined && <span className={`text-[10px] font-black ${theme === 'anime' ? 'text-[#FF3366]' : 'text-[#A661FF]'}`}>{progress}%</span>}
            </div>
          </div>
        </div>
        
        {/* Integrated Progress Bar */}
        {progress !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/5 overflow-hidden">
            <div
              className={`h-full shadow-[0_0_12px_rgba(0,0,0,0.5)] ${
                theme === 'anime' ? 'bg-gradient-to-r from-[#FF3366] to-[#FF6699]' : 'bg-gradient-to-r from-[#8F44FF] to-[#A661FF]'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Hover Border Glow */}
        <div className={`absolute inset-0 border-2 transition-all duration-700 pointer-events-none ${
          theme === 'anime' ? 'border-[#FF3366]/0 group-hover:border-[#FF3366]/30 rounded-[8px]' : 'border-[#8F44FF]/0 group-hover:border-[#8F44FF]/20 rounded-[16px]'
        }`} />
      </div>
    </Link>
  );
}

interface TrendingCardProps {
  title: string;
  rank: number;
  imageUrl: string;
  slug: string;
  href?: string;
  theme?: 'default' | 'anime';
}

export function TrendingCard({ title, rank, imageUrl, slug, href, theme = 'default' }: TrendingCardProps) {
  return (
    <Link 
      href={href || `/content/${slug}`} 
      className="w-[160px] sm:w-[200px] shrink-0 group cursor-pointer block relative transition-all duration-500"
    >
      <div className={`aspect-[2/3] bg-[#0A0A16] ring-1 ring-white/5 relative overflow-hidden transition-all duration-700 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] group-hover:-translate-y-3 z-10 ${
        theme === 'anime' 
          ? 'rounded-[8px] group-hover:ring-[#FF3366]/40' 
          : 'rounded-[20px] group-hover:ring-[#8F44FF]/30'
      }`}>
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-[#050510]/40 to-transparent opacity-90 transition-opacity duration-700 group-hover:opacity-60" />
        
        {/* Rank Badge */}
        {theme === 'anime' && siteConfig.features.crunchyrollStyleLayout ? (
          <div className="absolute top-0 left-0 bg-[#0A0A16]/80 backdrop-blur-md border-r border-b border-[#B838F5] px-3 py-1.5 rounded-br-lg z-20 shadow-[2px_2px_10px_rgba(184,56,245,0.3)]">
            <span className="text-[18px] text-white font-bold font-sans leading-none">{String(rank).padStart(2, '0')}</span>
          </div>
        ) : (
          <div className="absolute top-3 right-3 flex flex-col items-center">
             <div className={`bg-black/40 backdrop-blur-xl p-2.5 border border-white/10 flex flex-col items-center min-w-[40px] shadow-2xl transform group-hover:scale-110 transition-all duration-500 origin-top-right ${
               theme === 'anime' 
                 ? 'rounded-[4px] group-hover:bg-[#FF3366]/30 group-hover:border-[#FF3366]/50' 
                 : 'rounded-xl group-hover:bg-[#8F44FF]/20 group-hover:border-[#8F44FF]/40'
             }`}>
               <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-0.5 ${
                 theme === 'anime' ? 'text-[#FF3366]' : 'text-[#A661FF]'
               }`}>Top</span>
               <span className="text-[24px] text-white font-display font-bold leading-none">{rank}</span>
             </div>
          </div>
        )}

        {/* Title centered at bottom */}
        <div className="absolute bottom-6 left-0 right-0 px-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 text-center">
           <h3 className="text-white font-display text-[16px] sm:text-[19px] font-bold tracking-wide leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] line-clamp-2">
             {title}
           </h3>
        </div>

        {/* Interactive Border */}
        <div className={`absolute inset-0 border transition-all duration-700 pointer-events-none ${
          theme === 'anime' 
            ? (siteConfig.features.crunchyrollStyleLayout ? 'border-[#B838F5]/0 group-hover:border-[#B838F5]/50 rounded-[8px]' : 'border-[#FF3366]/0 group-hover:border-[#FF3366]/40 rounded-[8px]')
            : 'border-[#8F44FF]/0 group-hover:border-[#8F44FF]/30 rounded-[20px]'
        }`} />
      </div>
    </Link>
  );
}
