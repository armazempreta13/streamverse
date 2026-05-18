'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, ArrowRight, HelpCircle, ShieldCheck } from 'lucide-react';
import { supportSystemConfig } from '@/config/site';

interface SupportBannerProps {
  className?: string;
}

export function SupportBanner({ className = '' }: SupportBannerProps) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && supportSystemConfig.enabled) {
      setEnabled(true);
    }
  }, []);

  if (!enabled) return null;

  const handleOpenModal = () => {
    if (typeof window !== 'undefined' && (window as any).triggerStreamverseSupportModal) {
      (window as any).triggerStreamverseSupportModal();
    }
  };

  return (
    <div 
      className={`relative w-full max-w-7xl mx-auto my-8 p-6 md:p-8 rounded-3xl border transition-all duration-500 hover:scale-[1.005] overflow-hidden group ${className}`}
      style={{
        background: 'linear-gradient(135deg, #090915 0%, #05050b 100%)',
        borderColor: 'rgba(143, 68, 255, 0.15)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
      }}
    >
      {/* Decorative ambient lighting - glowing orbs that animate subtly */}
      <div 
        className="absolute -right-24 -top-24 w-80 h-80 rounded-full blur-[100px] opacity-20 pointer-events-none transition-all duration-1000 group-hover:opacity-35 group-hover:scale-110"
        style={{ background: '#8F44FF' }}
      />
      <div 
        className="absolute -left-24 -bottom-24 w-80 h-80 rounded-full blur-[100px] opacity-10 pointer-events-none transition-all duration-1000 group-hover:opacity-20 group-hover:scale-110"
        style={{ background: '#3B82F6' }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        
        {/* Banner Copy & Icons */}
        <div className="flex-1 flex flex-col sm:flex-row items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center shrink-0 shadow-[0_8px_20px_rgba(143,68,255,0.15)] relative">
            <span className="absolute inset-0 rounded-2xl bg-purple-500/10 blur-sm animate-pulse" />
            <Heart className="size-6 text-purple-400 fill-purple-400 relative z-10 group-hover:scale-110 transition-transform duration-300" />
          </div>

          <div className="flex-1 space-y-1.5">
            <div className="flex items-center flex-wrap gap-2.5">
              <span className="text-[10px] font-black tracking-[0.2em] px-2.5 py-1 rounded-[4px] bg-purple-500/10 border border-purple-500/20 text-purple-300 uppercase">
                LIVRE DE ANÚNCIOS
              </span>
              <span className="flex items-center gap-1 text-[10px] text-white/40 tracking-wider">
                <ShieldCheck className="size-3.5 text-emerald-500" />
                Seguro & Independente
              </span>
            </div>
            
            <h3 className="text-lg md:text-xl font-black text-white tracking-tight leading-snug">
              StreamVerse é mantido sem propagandas graças à comunidade
            </h3>
            
            <p className="text-white/50 text-xs md:text-sm max-w-4xl leading-relaxed font-medium">
              Não exibimos banners invasivos, redirecionamentos ou trackers de terceiros. Mantemos o site limpo e veloz. Se você aprecia o nosso esforço diário e a nossa paixão, considere apoiar voluntariamente.
            </p>
          </div>
        </div>

        {/* Buttons / Actions */}
        <div className="flex items-center gap-4 shrink-0 w-full lg:w-auto pt-2 lg:pt-0">
          <button 
            onClick={handleOpenModal}
            className="flex items-center justify-center gap-2.5 w-full sm:w-auto px-6 py-3 rounded-2xl font-black text-xs text-white transition-all duration-300 hover:brightness-110 active:scale-95 group/btn shadow-[0_8px_24px_rgba(143,68,255,0.25)]"
            style={{
              background: 'linear-gradient(to right, #8F44FF, #6366F1)',
            }}
          >
            <span>Apoiar StreamVerse</span>
            <ArrowRight className="size-4 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
          
          <button
            onClick={handleOpenModal}
            className="px-5 py-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-white/70 hover:text-white font-black text-xs transition-all active:scale-95 shrink-0 flex items-center gap-1.5"
          >
            <Sparkles className="size-3.5 text-amber-400" />
            <span>Ver Pix</span>
          </button>
        </div>

      </div>
    </div>
  );
}
