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

export const MediaCard = React.memo(function MediaCard({ title, subtitle, imageUrl, progress, slug, href, className, theme = 'default' }: MediaCardProps) {
  return (
    <Link
      href={href || `/content/${slug}`}
      className={`group cursor-pointer shrink-0 block relative ${className || 'w-[160px] sm:w-[240px] lg:w-[320px]'}`}
    >
      {/* Card container — NO hover:-translate-y on mobile (causes position shift during scroll)
          Only apply transform on devices with real pointer (desktop) */}
      <div className={`aspect-[16/10] bg-[#0A0A16] relative overflow-hidden z-10 ring-1 ring-white/5
        transition-[transform,box-shadow] duration-300
        [@media(hover:hover)]:group-hover:-translate-y-2
        ${theme === 'anime'
          ? 'rounded-[8px] group-hover:ring-[#FF3366]/50 shadow-[0_0_20px_rgba(255,51,102,0)] [@media(hover:hover)]:group-hover:shadow-[0_0_25px_rgba(255,51,102,0.2)]'
          : 'rounded-[16px] group-hover:ring-[#8F44FF]/40 shadow-[0_0_20px_rgba(143,68,255,0)] [@media(hover:hover)]:group-hover:shadow-[0_0_25px_rgba(143,68,255,0.1)]'
        }`}>
        <Image
          src={imageUrl}
          alt={title}
          fill
          quality={75}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 30vw, 20vw"
          loading="lazy"
          className="object-cover transition-transform duration-500 [@media(hover:hover)]:group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        {/* Advanced Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-[#050510]/20 to-transparent opacity-90 [@media(hover:hover)]:group-hover:opacity-60 transition-opacity duration-300" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050510]/40 to-transparent opacity-0 [@media(hover:hover)]:group-hover:opacity-100 transition-opacity duration-300" />

        {/* Hover overlay play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center opacity-0 [@media(hover:hover)]:group-hover:opacity-100 transform scale-50 [@media(hover:hover)]:group-hover:scale-100 transition-all duration-300 ease-out ${theme === 'anime' && siteConfig.features.crunchyrollStyleLayout
              ? 'bg-[#FF3366]/80 backdrop-blur-sm shadow-[0_0_30px_rgba(255,51,102,0.4)]'
              : 'bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)]'
            }`}>
            <Play className="size-6 fill-white text-white ml-1" />
          </div>
        </div>

        {/* 'Novo' Badge for Anime Theme */}
        {theme === 'anime' && siteConfig.features.crunchyrollStyleLayout && (
          <div className="absolute top-2 right-2 bg-[#B838F5] text-white text-[9px] font-black tracking-wider px-2 py-0.5 rounded shadow-lg uppercase z-20">
            Novo
          </div>
        )}

        {/* Content Info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5 transform translate-y-1 [@media(hover:hover)]:group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex justify-between items-end mb-1.5">
            <h3 className={`font-display font-bold text-[13px] sm:text-[17px] leading-tight text-white line-clamp-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-colors ${theme === 'anime' ? '[@media(hover:hover)]:group-hover:text-[#FF3366]' : '[@media(hover:hover)]:group-hover:text-[#A661FF]'
              }`}>
              {title}
            </h3>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <p className={`text-[10px] text-white/50 font-bold tracking-[0.15em] uppercase transition-colors ${theme === 'anime' ? '[@media(hover:hover)]:group-hover:text-[#FF3366]/80' : '[@media(hover:hover)]:group-hover:text-[#A661FF]/80'
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
              className={`h-full shadow-[0_0_12px_rgba(0,0,0,0.5)] ${theme === 'anime' ? 'bg-gradient-to-r from-[#FF3366] to-[#FF6699]' : 'bg-gradient-to-r from-[#8F44FF] to-[#A661FF]'
                }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Hover Border Glow */}
        <div className={`absolute inset-0 border-2 transition-opacity duration-300 pointer-events-none ${theme === 'anime' ? 'border-[#FF3366]/30 opacity-0 [@media(hover:hover)]:group-hover:opacity-100 rounded-[8px]' : 'border-[#8F44FF]/20 opacity-0 [@media(hover:hover)]:group-hover:opacity-100 rounded-[16px]'
          }`} />
      </div>
    </Link>
  );
});

interface TrendingCardProps {
  title: string;
  rank: number;
  imageUrl: string;
  slug: string;
  href?: string;
  theme?: 'default' | 'anime';
}

export const TrendingCard = React.memo(function TrendingCard({ title, rank, imageUrl, slug, href, theme = 'default' }: TrendingCardProps) {
  return (
    <Link
      href={href || `/content/${slug}`}
      className="w-[130px] sm:w-[200px] shrink-0 group cursor-pointer block relative"
    >
      <div className={`aspect-[2/3] bg-[#0A0A16] ring-1 ring-white/5 relative overflow-hidden
        transition-[transform,box-shadow] duration-300
        [@media(hover:hover)]:group-hover:-translate-y-3
        [@media(hover:hover)]:group-hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)]
        z-10 ${theme === 'anime'
          ? 'rounded-[8px] group-hover:ring-[#FF3366]/40'
          : 'rounded-[20px] group-hover:ring-[#8F44FF]/30'
        }`}>
        <Image
          src={imageUrl}
          alt={title}
          fill
          quality={75}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 15vw"
          loading="lazy"
          className="object-cover transition-transform duration-500 [@media(hover:hover)]:group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-[#050510]/40 to-transparent opacity-90 transition-opacity duration-300 [@media(hover:hover)]:group-hover:opacity-60" />

        {/* Rank Badge */}
        {theme === 'anime' && siteConfig.features.crunchyrollStyleLayout ? (
          <div className="absolute top-0 left-0 bg-gradient-to-br from-[#B838F5]/90 to-[#6E00B3]/80 backdrop-blur-md border-r border-b border-white/20 px-3 py-1.5 rounded-br-2xl z-20 shadow-[5px_5px_20px_rgba(0,0,0,0.5)]">
            <span className="text-[18px] text-white font-bold font-sans leading-none">{String(rank).padStart(2, '0')}</span>
          </div>
        ) : (
          <div className={`absolute top-0 right-0 z-20 pointer-events-none rounded-tr-[20px]`}>
            <div className={`flex flex-col items-center justify-center px-4 pt-2.5 pb-3.5 bg-gradient-to-bl ${theme === 'anime' ? 'from-[#FF3366]/90 to-[#990033]/90' : 'from-[#8F44FF]/90 to-[#4A1D9A]/90'} backdrop-blur-xl border-l border-b ${theme === 'anime' ? 'border-[#FF3366]/40' : 'border-[#8F44FF]/40'} rounded-bl-3xl shadow-[-8px_8px_25px_rgba(0,0,0,0.6)]`}>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/80 mb-0.5">Top</span>
              <span className="text-[28px] text-white font-display font-black leading-none drop-shadow-lg">{rank}</span>
            </div>
          </div>
        )}

        {/* Title centered at bottom */}
        <div className="absolute bottom-6 left-0 right-0 px-4 transform translate-y-2 [@media(hover:hover)]:group-hover:translate-y-0 transition-transform duration-300 text-center">
          <h3 className="text-white font-display text-[14px] sm:text-[19px] font-bold tracking-wide leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] line-clamp-2">
            {title}
          </h3>
        </div>

        {/* Interactive Border */}
        <div className={`absolute inset-0 border transition-opacity duration-300 pointer-events-none opacity-0 [@media(hover:hover)]:group-hover:opacity-100 ${theme === 'anime'
            ? (siteConfig.features.crunchyrollStyleLayout ? 'border-[#B838F5]/50 rounded-[8px]' : 'border-[#FF3366]/40 rounded-[8px]')
            : 'border-[#8F44FF]/30 rounded-[20px]'
          }`} />
      </div>
    </Link>
  );
});
