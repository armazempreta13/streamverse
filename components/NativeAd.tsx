'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { adsConfig } from '@/config/site';

interface NativeAdProps {
  placement: 'home-banner' | 'sidebar-card';
  className?: string;
}

export function NativeAd({ placement, className }: NativeAdProps) {
  const [closed, setClosed] = useState(false);
  const [campaign, setCampaign] = useState<typeof adsConfig.campaigns[0] | null>(null);

  useEffect(() => {
    if (!adsConfig.enabled) return;
    
    const list = adsConfig.campaigns || [];
    if (list.length > 0) {
      const random = list[Math.floor(Math.random() * list.length)];
      setCampaign(random);
    }
  }, []);

  if (!adsConfig.enabled || closed || !campaign) return null;

  const isHomeBanner = placement === 'home-banner';

  if (isHomeBanner) {
    if (!adsConfig.showHomeBanner) return null;
    return (
      <div 
        className={`relative w-full max-w-7xl mx-auto my-8 p-6 md:p-8 rounded-2xl border transition-all duration-300 hover:scale-[1.005] overflow-hidden group ${className}`}
        style={{
          background: campaign.bgColor,
          borderColor: campaign.borderColor,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        }}
      >
        <div 
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-[100px] opacity-20 pointer-events-none transition-all duration-700 group-hover:scale-110"
          style={{ background: campaign.accentColor }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span 
                className="text-[10px] font-bold tracking-[0.2em] px-2.5 py-1 rounded-[4px] text-white"
                style={{ background: `rgba(255, 255, 255, 0.08)`, border: `1px solid ${campaign.borderColor}` }}
              >
                {campaign.badge}
              </span>
              <span className="text-[10px] text-white/40 tracking-wider">Patrocinado</span>
            </div>
            
            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight mb-2">
              {campaign.title}
            </h3>
            
            <p className="text-white/60 text-sm md:text-base max-w-3xl leading-relaxed">
              {campaign.description}
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0 w-full md:w-auto">
            <a 
              href={campaign.targetUrl}
              target={campaign.targetUrl.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 rounded-lg font-bold text-sm text-white transition-all duration-300 active:scale-95"
              style={{
                background: campaign.accentColor,
                boxShadow: `0 8px 24px rgba(0, 0, 0, 0.25)`,
              }}
            >
              <span>{campaign.buttonText}</span>
              <ArrowRight className="size-4" />
            </a>
            
            <button 
              onClick={() => setClosed(true)}
              className="p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              aria-label="Fechar anúncio"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!adsConfig.showDetailsSidebar) return null;
  return (
    <div 
      className={`relative w-full p-5 rounded-2xl border transition-all duration-300 overflow-hidden group ${className}`}
      style={{
        background: campaign.bgColor,
        borderColor: campaign.borderColor,
        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3)',
      }}
    >
      <button 
        onClick={() => setClosed(true)}
        className="absolute top-4 right-4 z-20 p-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
        aria-label="Fechar anúncio"
      >
        <X className="size-3.5" />
      </button>

      <div className="relative z-10 flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span 
              className="text-[8px] font-bold tracking-[0.15em] px-2 py-0.5 rounded-[3px] text-white"
              style={{ background: `rgba(255, 255, 255, 0.05)`, border: `1px solid ${campaign.borderColor}` }}
            >
              {campaign.badge}
            </span>
            <span className="text-[9px] text-white/30">Patrocinado</span>
          </div>
          
          <h4 className="text-base font-bold text-white tracking-tight leading-tight">
            {campaign.title}
          </h4>
        </div>

        <p className="text-white/50 text-xs leading-relaxed">
          {campaign.description}
        </p>

        <a 
          href={campaign.targetUrl}
          target={campaign.targetUrl.startsWith('http') ? '_blank' : undefined}
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg font-bold text-xs text-white transition-all duration-300 active:scale-95 mt-1"
          style={{
            background: campaign.accentColor,
            boxShadow: `0 4px 12px rgba(0, 0, 0, 0.2)`,
          }}
        >
          <span>{campaign.buttonText}</span>
          <ArrowRight className="size-3.5" />
        </a>
      </div>
    </div>
  );
}
