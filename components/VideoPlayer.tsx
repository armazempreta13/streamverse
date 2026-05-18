'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Play, X } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore/lite';
import { adsConfig } from '@/config/site';

interface VideoPlayerProps {
  id: string;
  type: string;
  title: string;
  posterUrl: string;
  videoUrl: string;
  backdropUrl?: string;
  theme?: 'default' | 'anime';
  genres?: string[];
}

const THEMES = {
  default: {
    accent: '#8F44FF',
    border: 'rgba(255, 255, 255, 0.08)',
    glow: '0 30px 100px rgba(0, 0, 0, 0.9)',
    halo: 'rgba(143, 68, 255, 0.9)',
  },
  anime: {
    accent: '#FF3366',
    border: 'rgba(255, 255, 255, 0.08)',
    glow: '0 30px 100px rgba(0, 0, 0, 0.9)',
    halo: 'rgba(255, 51, 102, 0.9)',
  },
} as const;

function getAutoplayUrl(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.set('autoplay', '1');
    return u.toString();
  } catch {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}autoplay=1`;
  }
}

function getWarningDismissed(): boolean {
  try {
    return localStorage.getItem('videoPlayerWarningDismissed') === 'true';
  } catch {
    return false;
  }
}

function setWarningDismissed(): void {
  try {
    localStorage.setItem('videoPlayerWarningDismissed', 'true');
  } catch {
    // silently fail if localStorage is unavailable
  }
}

export function VideoPlayer({
  id,
  type,
  title,
  posterUrl,
  videoUrl,
  backdropUrl,
  theme = 'default',
}: VideoPlayerProps) {
  const { user } = useAuth();
  const [hasStarted, setHasStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Estados do sistema de anúncios de Pre-roll
  const [adActive, setAdActive] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const [activeCampaign, setActiveCampaign] = useState<typeof adsConfig.campaigns[0] | null>(null);

  useEffect(() => {
    setShowWarning(!getWarningDismissed());
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__streamverse_video_playing = hasStarted;
    }
    return () => {
      if (typeof window !== 'undefined') {
        (window as any).__streamverse_video_playing = false;
      }
    };
  }, [hasStarted]);

  const t = THEMES[theme];
  const cleanBackdrop = backdropUrl?.trim() || '';

  const startPlayback = useCallback(() => {
    setIsLoading(true);
    setHasStarted(true);

    const saveProgress = async () => {
      const isMovie = type === 'movie';
      const progressObj = {
        title: title,
        subtitle: isMovie ? 'Filme' : 'Série',
        imageUrl: posterUrl,
        progress: 5,
        slug: `tmdb/${type}/${id}`,
        href: `/tmdb/${type}/${id}`,
        id: `tmdb_${id}`
      };

      if (!user) {
        try {
          const localProgress = JSON.parse(localStorage.getItem('streamverse_progress') || '[]');
          const filtered = localProgress.filter((p: any) => p.id !== progressObj.id);
          filtered.unshift(progressObj);
          localStorage.setItem('streamverse_progress', JSON.stringify(filtered.slice(0, 12)));
        } catch (e) {}
        return;
      }

      try {
        const docRef = doc(db, 'users', user.uid, 'progress', progressObj.id);
        await setDoc(docRef, {
          contentId: progressObj.id,
          contentTitle: title,
          contentImage: posterUrl,
          contentSlug: progressObj.slug,
          isMovie: isMovie,
          progressPercentage: 5,
          updatedAt: serverTimestamp(),
          subtitle: progressObj.subtitle
        }, { merge: true });
      } catch (error) {
        console.error("Failed to save progress", error);
      }
    };

    saveProgress();
  }, [user, id, type, title, posterUrl]);

  const handlePlay = useCallback(() => {
    if (adsConfig.enabled && adsConfig.showPreRoll) {
      const list = adsConfig.campaigns || [];
      if (list.length > 0) {
        const random = list[Math.floor(Math.random() * list.length)];
        setActiveCampaign(random);
        setAdActive(true);
        setAdCountdown(5);
        return;
      }
    }

    startPlayback();
  }, [startPlayback]);

  const handleSkipAd = useCallback(() => {
    setAdActive(false);
    startPlayback();
  }, [startPlayback]);

  // Efeito do temporizador do Pre-roll
  useEffect(() => {
    if (!adActive) return;
    if (adCountdown <= 0) {
      setAdActive(false);
      startPlayback();
      return;
    }

    const timer = setTimeout(() => {
      setAdCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [adActive, adCountdown, startPlayback]);

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
    setIframeReady(true);
  }, []);

  const handleDismissWarning = useCallback(() => {
    setShowWarning(false);
    setWarningDismissed();
  }, []);

  return (
    <div className="w-full flex flex-col relative z-[110]">
      {/*
        FULLSCREEN FIX:
        The root cause of the partial fullscreen is `overflow: hidden` + `border-radius`
        on the container clipping the browser's native fullscreen layer.

        Solution: wrap the iframe in a separate div that has NO overflow/border-radius,
        and apply the decorative border/glow on a non-clipping pseudo-element via
        an absolutely-positioned overlay div instead.

        The iframe container itself is plain and allows fullscreen to expand freely.
      */}
      <div className="w-full aspect-video relative">
        {/* Decorative border/glow overlay — pointer-events-none so it never blocks the iframe */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none z-20 transition-all duration-500"
          style={{
            border: `1px solid ${t.border}`,
            boxShadow: t.glow,
          }}
        />

        {/* Thumbnail / play screen */}
        {!hasStarted && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 rounded-2xl overflow-hidden bg-[#050510]">
            {cleanBackdrop && (
              <div className="absolute inset-0 opacity-40 hover:opacity-60 transition-opacity duration-700 select-none">
                <Image
                  src={cleanBackdrop}
                  alt={title}
                  fill
                  className="object-cover"
                  priority
                  unoptimized={!cleanBackdrop.startsWith('/')}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-transparent to-[#050510]/50" />
              </div>
            )}

            <div className="absolute top-6 left-6 z-30 select-none pointer-events-none text-left">
              <span className="text-[10px] font-black tracking-[0.25em] uppercase opacity-55 text-white/95">
                Você está assistindo
              </span>
              <h2 className="text-white text-lg sm:text-2xl font-black tracking-tight mt-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
                {title}
              </h2>
            </div>

            <button
              onClick={handlePlay}
              className="relative z-30 group/btn transition-all duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-full"
              aria-label="Iniciar reprodução"
            >
              <div
                className="absolute inset-0 rounded-full blur-xl opacity-30 group-hover/btn:opacity-90 group-hover/btn:scale-110 transition-all duration-500 animate-pulse"
                style={{ backgroundColor: t.accent, boxShadow: `0 0 40px ${t.accent}` }}
              />
              <div className="absolute -inset-4 rounded-full border border-white/5 group-hover/btn:border-white/10 group-hover/btn:scale-105 transition-all duration-500 pointer-events-none" />
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] group-hover/btn:bg-white/[0.12] group-hover/btn:border-white/40 transition-all duration-500">
                <Play
                  className="size-8 sm:size-10 fill-white text-white ml-1.5 transition-transform duration-500 ease-out group-hover/btn:scale-110"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.4))' }}
                />
              </div>
            </button>
          </div>
        )}

        {/* Loading spinner — shown between click and iframe onLoad */}
        {isLoading && !iframeReady && !adActive && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#050510] rounded-2xl">
            <div
              className="w-10 h-10 rounded-full border-2 border-white/10 animate-spin"
              style={{ borderTopColor: t.accent }}
            />
          </div>
        )}

        {/* Sponsored Pre-roll Ad Overlay */}
        {adActive && activeCampaign && (
          <div 
            className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 rounded-2xl overflow-hidden text-center select-none"
            style={{ background: activeCampaign.bgColor }}
          >
            {/* Ambient blur background */}
            <div 
              className="absolute -right-16 -top-16 w-64 h-64 rounded-full blur-[80px] opacity-25 pointer-events-none"
              style={{ background: activeCampaign.accentColor }}
            />
            <div 
              className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full blur-[80px] opacity-15 pointer-events-none"
              style={{ background: activeCampaign.accentColor }}
            />

            <div className="relative z-10 max-w-lg flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-500">
              <div className="flex items-center gap-2">
                <span 
                  className="text-[9px] font-black tracking-[0.2em] px-2.5 py-0.5 rounded-[4px] text-white border"
                  style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: activeCampaign.borderColor }}
                >
                  {activeCampaign.badge}
                </span>
                <span className="text-[10px] text-white/40 tracking-wider">Patrocinado</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                {activeCampaign.title}
              </h3>

              <p className="text-white/60 text-xs sm:text-sm leading-relaxed max-w-md">
                {activeCampaign.description}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 mt-2 w-full sm:w-auto">
                <a 
                  href={activeCampaign.targetUrl}
                  target={activeCampaign.targetUrl.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-bold text-xs sm:text-sm text-white text-center transition-all duration-300 hover:scale-[1.03]"
                  style={{ background: activeCampaign.accentColor }}
                >
                  {activeCampaign.buttonText}
                </a>

                <button
                  onClick={handleSkipAd}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white font-bold text-xs sm:text-sm transition-all duration-300 hover:bg-white/10 active:scale-95"
                >
                  {adCountdown > 0 ? `Pular em ${adCountdown}s` : 'Pular Anúncio'}
                </button>
              </div>
            </div>

            {/* Subtle disclaimer */}
            <p className="absolute bottom-4 left-6 text-[9px] text-white/25">
              Este anúncio ajuda a manter os servidores da StreamVerse ativos e gratuitos.
            </p>
          </div>
        )}

        {/* Iframe — rendered once hasStarted, invisible until loaded */}
        {hasStarted && !adActive && (
          <iframe
            ref={iframeRef}
            src={getAutoplayUrl(videoUrl)}
            onLoad={handleIframeLoad}
            className="w-full h-full border-none bg-black absolute inset-0 rounded-2xl transition-opacity duration-500"
            style={{ opacity: iframeReady ? 1 : 0 }}
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          /*
            `allowFullScreen` alone is not enough on some browsers.
            The `allow="fullscreen"` attribute on the wrapping div (below) is
            what actually lets the browser expand to true fullscreen.
          */
          />
        )}
      </div>

      {showWarning && (
        <div className="flex flex-col gap-3 mt-5 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-[#1C150A]/40 backdrop-blur-md border border-amber-500/20 px-5 py-4 rounded-xl flex items-start gap-4 relative group">
            <div className="w-5 h-5 shrink-0 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center mt-0.5 shadow-[0_0_10px_rgba(245,158,11,0.15)]">
              <span className="text-amber-500 font-black text-xs">!</span>
            </div>
            <p className="text-[13px] text-[#8A93A6] leading-relaxed pr-6 select-none">
              <strong className="text-amber-500">AVISO SOBRE ANÚNCIOS:</strong> O player acima é
              fornecido por servidores de terceiros. Nós não temos controle sobre pop-ups ou anúncios
              que possam abrir ao clicar.{' '}
              <strong className="text-white">
                Recomendamos fechar as novas guias imediatamente e retornar ao player.
              </strong>
            </p>
            <button
              onClick={handleDismissWarning}
              className="absolute top-3.5 right-3.5 text-white/30 hover:text-white transition-colors duration-200"
              aria-label="Fechar aviso"
              title="Fechar aviso"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}