'use client';

import React, { Suspense, useEffect, useState, useRef, useMemo, useCallback } from 'react';
import Image from 'next/image';
import {
  Play, AlertCircle, ListVideo, ArrowLeft,
  ChevronLeft, ChevronRight, Maximize, Search,
  Calendar, Clock, SkipForward, X
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { collection, query, where, getDocs, limit } from 'firebase/firestore/lite';
import { db } from '@/lib/firebase';
import { useWatchProgress } from '@/hooks/useWatchProgress';
import { CommentSection } from '@/components/CommentSection';
import { OtakuAtmosphere } from '@/components/OtakuAtmosphere';
import { GenreAtmosphere } from '@/components/GenreAtmosphere';
import { SpidermanAnimation } from '@/components/SpidermanAnimation';

// ─── Episode Card ────────────────────────────────────────────────────────────

function EpisodeCard({
  ep,
  isActive,
  heroImage,
  isAnime,
  onClick,
}: {
  ep: any;
  isActive: boolean;
  heroImage: string;
  isAnime: boolean;
  onClick: () => void;
}) {
  const accent = isAnime ? '#FF3366' : '#8F44FF';

  return (
    <button
      id={`ep-card-${ep.number}`}
      onClick={onClick}
      className={`
        w-full flex gap-4 p-4 rounded-2xl text-left transition-all duration-300 group border
        ${isActive
          ? 'border-[var(--accent)]/40 bg-white/[0.06] shadow-[0_0_24px_rgba(0,0,0,0.4)]'
          : 'border-transparent hover:border-white/10 hover:bg-white/[0.04]'}
      `}
      style={{ '--accent': accent } as React.CSSProperties}
    >
      {/* Thumbnail */}
      <div className="relative w-24 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10">
        <Image
          src={ep.thumbnailUrl || heroImage}
          alt={`Ep ${ep.number}`}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className={`absolute inset-0 transition-colors ${isActive ? 'bg-black/30' : 'bg-black/50 group-hover:bg-black/30'}`} />

        {/* Number badge */}
        <span className="absolute top-1.5 left-1.5 text-[10px] font-black bg-black/70 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-md">
          {String(ep.number).padStart(2, '0')}
        </span>

        {/* Play overlay when active */}
        {isActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: accent }}>
              <Play className="size-3.5 fill-white text-white ml-0.5" />
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col justify-center min-w-0 flex-1 gap-1">
        <p
          className={`text-[13px] font-bold line-clamp-1 transition-colors ${isActive ? 'text-[var(--accent)]' : 'text-white/90 group-hover:text-white'}`}
          style={{ '--accent': accent } as React.CSSProperties}
        >
          {ep.title || `Episódio ${ep.number}`}
        </p>
        <p className="text-[11px] text-white/40 line-clamp-2 leading-relaxed">
          {ep.description || 'Nenhuma descrição disponível.'}
        </p>
        <div className="flex items-center gap-3 mt-1">
          {ep.releaseDate && (
            <span className="flex items-center gap-1 text-[10px] text-white/30 font-medium">
              <Calendar className="size-3" />{ep.releaseDate}
            </span>
          )}
          <span className="flex items-center gap-1 text-[10px] text-white/30 font-medium">
            <Clock className="size-3" />{ep.duration || '24 min'}
          </span>
        </div>
      </div>

      {/* Active left bar */}
      {isActive && (
        <div
          className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full"
          style={{ backgroundColor: accent }}
        />
      )}
    </button>
  );
}

// ─── Player ──────────────────────────────────────────────────────────────────

function PlayerContent({ slug }: { slug: string }) {
  const searchParams = useSearchParams();

  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [epNum, setEpNum] = useState(searchParams.get('ep') ? Number(searchParams.get('ep')) : 1);
  const [seasonNum, setSeasonNum] = useState(searchParams.get('season') ? Number(searchParams.get('season')) : 1);
  const [playerParam, setPlayerParam] = useState(searchParams.get('player') || '1');

  const [searchEp, setSearchEp] = useState('');
  const [hasClickedPlay, setHasClickedPlay] = useState(false);
  const [autoPlayCanceled, setAutoPlayCanceled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const episodesContainerRef = useRef<HTMLDivElement>(null);

  // ── Derived ──────────────────────────────────────────────────────────────

  const isMovie = content?.type === 'movie';

  const currentEpData = useMemo(() => {
    if (!content) return null;
    if (isMovie) return content;
    return (
      content.episodes?.find(
        (e: any) => e.number === epNum && (e.season || 1) === seasonNum
      ) || content.episodes?.[0]
    );
  }, [content, epNum, seasonNum, isMovie]);

  const prevEpData = useMemo(() => {
    if (!content || isMovie || !content.episodes) return null;
    return content.episodes.find(
      (e: any) => e.number === epNum - 1 && (e.season || 1) === seasonNum
    );
  }, [content, epNum, seasonNum, isMovie]);

  const nextEpData = useMemo(() => {
    if (!content || isMovie || !content.episodes) return null;
    return content.episodes.find(
      (e: any) => e.number === epNum + 1 && (e.season || 1) === seasonNum
    );
  }, [content, epNum, seasonNum, isMovie]);

  const availablePlayers = useMemo(() => {
    if (!content) return [];
    const options = [];
    if (currentEpData?.videoUrl) {
      options.push({ id: '1', name: 'Server 1', badge: 'Dublado' });
    }
    if (currentEpData?.videoUrl2) {
      options.push({ id: '2', name: 'Server 2', badge: 'Legendado' });
    }
    if (currentEpData?.iframes && Array.isArray(currentEpData.iframes)) {
      currentEpData.iframes.forEach((ifr: any, i: number) => {
        options.push({ 
          id: `iframe-${i}`, 
          name: ifr.name || `Server ${i + 3}`, 
          badge: ifr.isDub ? 'Dublado' : ifr.badge || ''
        });
      });
    }
    if (options.length === 0) {
      options.push({ id: '1', name: 'Principal', badge: '' });
    }
    return options;
  }, [currentEpData, content]);

  const videoSrc = useMemo(() => {
    if (!currentEpData) return '';
    if (playerParam === '2' && currentEpData.videoUrl2) return currentEpData.videoUrl2;
    if (playerParam.startsWith('iframe-')) {
       const idx = parseInt(playerParam.split('-')[1]);
       if (currentEpData.iframes && currentEpData.iframes[idx]) {
         return currentEpData.iframes[idx].url || currentEpData.iframes[idx];
       }
    }
    return currentEpData.videoUrl || '';
  }, [playerParam, currentEpData]);

  const episodeTitle = isMovie ? '' : currentEpData?.title || 'Episódio';
  const durationStr = currentEpData?.duration || (isMovie ? '120m' : '24m');
  const thumbnail =
    currentEpData?.thumbnailUrl || content?.heroImage || 'https://picsum.photos/seed/bg/1920/1080';

  const isAnimeContent =
    content?.type === 'anime' ||
    (content?.categories?.some((c: string) => c.toLowerCase() === 'anime')) ||
    content?.genres?.toLowerCase().includes('anime');

  const accent = isAnimeContent ? '#FF3366' : '#8F44FF';
  const accentShadow = isAnimeContent
    ? 'rgba(255,51,102,0.35)'
    : 'rgba(143,68,255,0.35)';

  // ── Watch progress ────────────────────────────────────────────────────────

  const { watchedSeconds, totalSeconds } = useWatchProgress({
    contentSlug: slug,
    episodeNumber: epNum,
    episodeTitle,
    seasonNumber: seasonNum,
    contentTitle: content?.title || '',
    contentImage: content?.heroImage || '',
    durationStr,
    isMovie,
    isActive: hasClickedPlay,
  });

  const timeLeft = Math.max(0, totalSeconds - watchedSeconds);
  const showNextEpBanner =
    hasClickedPlay && !isMovie && nextEpData && timeLeft <= 15 && timeLeft > 0 && !autoPlayCanceled;

  // ── URL sync ──────────────────────────────────────────────────────────────

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('ep', epNum.toString());
    url.searchParams.set('season', seasonNum.toString());
    url.searchParams.set('player', playerParam);
    window.history.replaceState({}, '', url.toString());

    // scroll sidebar to active ep
    setTimeout(() => {
      const activeEl = document.getElementById(`ep-card-${epNum}`);
      if (activeEl && episodesContainerRef.current) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 400);
  }, [epNum, seasonNum, playerParam]);

  // ── Reset play state on ep/player change ─────────────────────────────────
  // KEY IMPROVEMENT: quando muda ep pela página, mantemos hasClickedPlay=true
  // para o player recarregar automaticamente sem precisar clicar em play de novo.
  const prevEpRef = useRef(epNum);
  useEffect(() => {
    if (prevEpRef.current !== epNum) {
      // troca de ep — se já estava assistindo, mantém o player aberto
      setAutoPlayCanceled(false);
      prevEpRef.current = epNum;
      // Não reseta hasClickedPlay — player recarrega com novo src automaticamente
    }
  }, [epNum]);

  useEffect(() => {
    // só reseta no playerParam change
    setHasClickedPlay(false);
    setAutoPlayCanceled(false);
  }, [playerParam, slug]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__streamverse_video_playing = hasClickedPlay;
    }
    return () => {
      if (typeof window !== 'undefined') {
        (window as any).__streamverse_video_playing = false;
      }
    };
  }, [hasClickedPlay]);

  // ── Auto-advance ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (showNextEpBanner && timeLeft === 0 && !autoPlayCanceled) {
      handleNextEpisode();
    }
  }, [timeLeft, showNextEpBanner, autoPlayCanceled]);

  const handleNextEpisode = useCallback(() => {
    if (nextEpData) {
      setEpNum(nextEpData.number);
      setSeasonNum(nextEpData.season || seasonNum);
    }
  }, [nextEpData, seasonNum]);

  const handlePrevEpisode = useCallback(() => {
    if (prevEpData) {
      setEpNum(prevEpData.number);
      setSeasonNum(prevEpData.season || seasonNum);
    }
  }, [prevEpData, seasonNum]);

  // ── Fullscreen ────────────────────────────────────────────────────────────

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current?.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen();
    }
  };

  // ── Fetch content ─────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const q = query(collection(db, 'contents'), where('slug', '==', slug), limit(1));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const data = doc.data();
          const fetched: any = {
            id: doc.id,
            ...data,
            heroImage:
              data.coverImage ||
              data.thumbnailImage ||
              'https://picsum.photos/seed/hero/1920/1080',
          };
          if (data.type !== 'movie') {
            const epRef = collection(db, `contents/${doc.id}/episodes`);
            const epSnapshot = await getDocs(epRef);
            fetched.episodes = epSnapshot.docs
              .map((d: any) => ({ id: d.id, ...d.data() }))
              .sort((a: any, b: any) =>
                (a.season || 1) === (b.season || 1)
                  ? a.number - b.number
                  : (a.season || 1) - (b.season || 1)
              );
          }
          setContent(fetched);

          // Record favorite genres in LocalStorage
          if (data.categories) {
            try {
              const cats = Array.isArray(data.categories) 
                ? data.categories 
                : (typeof data.categories === 'string' ? data.categories.split(',').map((c: any) => c.trim()) : []);
              
              const savedGenres = JSON.parse(localStorage.getItem('streamverse_genre_clicks') || '{}');
              cats.forEach((genre: string) => {
                if (genre) {
                  savedGenres[genre] = (savedGenres[genre] || 0) + 1;
                }
              });
              localStorage.setItem('streamverse_genre_clicks', JSON.stringify(savedGenres));
            } catch (e) {}
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [slug]);

  // ── Search ────────────────────────────────────────────────────────────────

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEp || !content?.episodes) return;
    const num = Number(searchEp);
    const found = content.episodes.find(
      (ep: any) => ep.number === num && (ep.season || 1) === seasonNum
    );
    if (found) {
      setEpNum(num);
      setSearchEp('');
    } else {
      alert('Episódio não encontrado!');
    }
  };

  // ── Render guards ─────────────────────────────────────────────────────────

  if (loading)
    return (
      <div className="min-h-screen bg-[#060610] flex items-center justify-center">
        <div
          className="w-10 h-10 rounded-full border-[3px] border-t-transparent animate-spin"
          style={{ borderColor: `${accent} transparent ${accent} ${accent}` }}
        />
      </div>
    );

  if (!content)
    return (
      <div className="min-h-screen bg-[#060610] text-white/60 flex items-center justify-center text-xl font-bold">
        Conteúdo não encontrado
      </div>
    );

  const isIframeHtml =
    videoSrc.trim().startsWith('<iframe') || videoSrc.trim().startsWith('<div');

  const seasonEpisodes = content.episodes?.filter(
    (e: any) => (e.season || 1) === seasonNum
  ) ?? [];

  const genresList = useMemo(() => {
    if (!content?.categories) return [];
    return Array.isArray(content.categories)
      ? content.categories
      : (typeof content.categories === 'string' ? content.categories.split(',').map((c: any) => c.trim()) : []);
  }, [content]);

  // ── JSX ───────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-[#060610] text-white font-sans overflow-x-hidden relative">
      <GenreAtmosphere genres={genresList} theme={isAnimeContent ? 'anime' : 'default'} />
      <SpidermanAnimation title={content.title || ''} slug={slug} />
      {isAnimeContent && <OtakuAtmosphere backdropUrl={content?.heroImage} />}

      {/* Hero ambient */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src={content.heroImage}
          alt="bg"
          fill
          className="object-cover object-top opacity-[0.06] scale-110"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060610]/60 via-[#060610]/90 to-[#060610]" />
      </div>

      <div className="relative z-10 max-w-[1800px] mx-auto px-3 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-10 pb-28 md:pb-6 lg:pb-10">

        {/* ── Back link ── */}
        <Link
          href={`/content/${content.slug}`}
          className="inline-flex items-center gap-2.5 text-white/40 hover:text-white/80 transition-colors mb-6 group"
        >
          <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <ArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <span className="text-sm font-semibold tracking-wide">Página da Obra</span>
        </Link>

        <div className="flex flex-col xl:flex-row gap-6">

          {/* ════════════════════ LEFT COL ════════════════════ */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">

            {/* Title row */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
                  {isMovie ? content.title : content.title}
                </h1>
                {!isMovie && currentEpData && (
                  <p className="text-sm font-semibold mt-1" style={{ color: accent }}>
                    Episódio {epNum}
                    {currentEpData.title ? ` — ${currentEpData.title}` : ''}
                  </p>
                )}
              </div>

              {/* Player switcher (Enhanced for Mobile) */}
              <div className="w-full lg:w-auto shrink-0 flex flex-col gap-2.5">
                <div className="flex items-center justify-between lg:justify-end mb-1">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest hidden lg:block mr-4">
                    Opções de Servidor
                  </span>
                  
                  {/* Warning Alert - Glowing & Discreet */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFB800]/10 border border-[#FFB800]/20 animate-pulse">
                    <AlertCircle className="size-3 text-[#FFB800]" />
                    <span className="text-[9px] font-bold text-[#FFB800] tracking-wider uppercase">
                      Lento? Troque de servidor
                    </span>
                  </div>
                </div>
                
                {/* Players List with Overflow internally */}
                <div 
                  className={`flex flex-col gap-2 ${
                    availablePlayers.length > 2 
                      ? 'max-h-[140px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent' 
                      : ''
                  }`}
                >
                  {availablePlayers.map((p) => {
                    const isActive = playerParam === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setPlayerParam(p.id)}
                        className={`w-full lg:w-[260px] flex items-center justify-between px-4 py-3 rounded-xl transition-all border group ${
                          isActive
                            ? 'text-white border-transparent'
                            : 'bg-white/5 text-white/50 border-white/5 hover:bg-white/10 hover:text-white/80 hover:border-white/10'
                        }`}
                        style={
                          isActive
                            ? { backgroundColor: accent, boxShadow: `0 4px 20px ${accentShadow}` }
                            : {}
                        }
                      >
                        <div className="flex items-center gap-3">
                          <Play className={`size-3.5 ${isActive ? 'fill-white text-white' : 'text-white/40 group-hover:text-white/60'}`} />
                          <span className="text-[11px] font-black tracking-widest uppercase">{p.name}</span>
                        </div>
                        {p.badge && (
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            isActive ? 'bg-black/20 text-white' : 'bg-white/10 text-white/60 group-hover:bg-white/20'
                          }`}>
                            {p.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── Video player box ── */}
            <div
              ref={playerContainerRef}
              className={`bg-black rounded-2xl overflow-hidden border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.7)] ${isFullscreen ? 'fixed inset-0 z-[9999] rounded-none border-none' : ''
                }`}
            >
              {/* Video area */}
              <div className={`relative bg-black ${isFullscreen ? 'h-screen' : 'aspect-video'}`}>
                {videoSrc && hasClickedPlay ? (
                  isIframeHtml ? (
                    <div
                      className="w-full h-full [&_iframe]:w-full [&_iframe]:h-full"
                      dangerouslySetInnerHTML={{ __html: videoSrc }}
                    />
                  ) : (
                    <iframe
                      key={`${videoSrc}-${epNum}`}  // <-- força reload ao trocar ep
                      src={videoSrc}
                      allowFullScreen
                      className="w-full h-full border-0"
                      style={{ height: '100%' }}
                    />
                  )
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center cursor-pointer group/play"
                    onClick={() => {
                      if (videoSrc) setHasClickedPlay(true);
                      else alert('Vídeo não disponível ainda.');
                    }}
                  >
                    <Image
                      src={thumbnail}
                      alt={content.title}
                      fill
                      className="object-cover opacity-50 group-hover/play:opacity-70 transition-all duration-700 group-hover/play:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Elegant Media Info Overlay */}
                    <div className="absolute top-6 left-6 z-30 select-none pointer-events-none text-left">
                      <span className="text-[10px] font-black tracking-[0.25em] uppercase opacity-55 text-white/95">Você está assistindo</span>
                      <h2 className="text-white text-lg sm:text-2xl font-black tracking-tight mt-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">{content.title}</h2>
                    </div>

                    {/* Stunning Glassmorphic Play Button with Elegant Glow & Micro-animations */}
                    <div className="relative z-10 group/btn transition-all duration-500 ease-out">
                      {/* Pulsing neon halo shadow that expands on hover */}
                      <div 
                        className="absolute inset-0 rounded-full blur-xl opacity-30 group-hover/play:opacity-90 group-hover/play:scale-110 transition-all duration-500 animate-pulse"
                        style={{ backgroundColor: accent, boxShadow: `0 0 40px ${accentShadow}` }}
                      />
                      {/* Outer halo border */}
                      <div className="absolute -inset-4 rounded-full border border-white/5 group-hover/play:border-white/10 group-hover/play:scale-105 transition-all duration-500 pointer-events-none" />
                      
                      {/* Main Circular Glass container */}
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] group-hover/play:bg-white/[0.12] group-hover/play:border-white/40 transition-all duration-500">
                        <Play 
                          className="size-8 sm:size-10 fill-white text-white ml-1.5 transition-transform duration-500 ease-out group-hover/play:scale-110"
                          style={{ filter: `drop-shadow(0 0 10px rgba(255,255,255,0.4))` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Page-level episode controls (below player) ── */}
              {!isMovie && (
                <div className="flex items-center justify-between gap-4 px-5 py-4 bg-[#0c0c18] border-t border-white/[0.06]">
                  {/* Prev */}
                  <button
                    onClick={handlePrevEpisode}
                    disabled={!prevEpData}
                    className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-bold transition-all ${prevEpData
                        ? 'bg-white/[0.06] hover:bg-white/10 text-white/80 hover:text-white border border-white/10 hover:border-white/20 active:scale-95'
                        : 'opacity-20 cursor-not-allowed bg-white/[0.03] text-white/30 border border-white/5'
                      }`}
                  >
                    <ChevronLeft className="size-4" />
                    <span className="hidden sm:inline">Anterior</span>
                    {prevEpData && (
                      <span className="text-white/40 text-xs font-normal hidden md:inline">
                        Ep {prevEpData.number}
                      </span>
                    )}
                  </button>

                  {/* Current ep info + progress */}
                  <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                    <p className="text-white/70 text-xs font-semibold text-center truncate max-w-[280px]">
                      {currentEpData?.title
                        ? `${epNum}. ${currentEpData.title}`
                        : `Episódio ${epNum}`}
                    </p>
                    {/* Progress bar */}
                    {hasClickedPlay && totalSeconds > 0 && (
                      <div className="w-full max-w-[260px] h-[3px] rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${(watchedSeconds / totalSeconds) * 100}%`,
                            backgroundColor: accent,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Next */}
                  <button
                    onClick={handleNextEpisode}
                    disabled={!nextEpData}
                    className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-bold transition-all ${nextEpData
                        ? 'text-white active:scale-95'
                        : 'opacity-20 cursor-not-allowed bg-white/[0.03] text-white/30 border border-white/5'
                      }`}
                    style={
                      nextEpData
                        ? {
                          backgroundColor: accent,
                          boxShadow: `0 6px 20px ${accentShadow}`,
                        }
                        : {}
                    }
                  >
                    {nextEpData && (
                      <span className="text-xs font-normal opacity-80 hidden md:inline">
                        Ep {nextEpData.number}
                      </span>
                    )}
                    <span className="hidden sm:inline">Próximo</span>
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              )}
            </div>

            {/* ── Autoplay banner ── */}
            {showNextEpBanner && (
              <div
                className="flex flex-col sm:flex-row items-center justify-between gap-5 p-5 rounded-2xl border animate-in slide-in-from-top-2 fade-in duration-500"
                style={{
                  backgroundColor: 'rgba(12,12,24,0.95)',
                  borderColor: `${accent}40`,
                  boxShadow: `0 8px 32px rgba(0,0,0,0.5)`,
                }}
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="relative w-28 h-18 rounded-xl overflow-hidden shrink-0 border border-white/10">
                    <Image
                      src={nextEpData.thumbnailUrl || content.heroImage}
                      alt="next ep"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <SkipForward className="size-6 fill-white/70 text-white/70" />
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-black text-sm">PRÓXIMO EPISÓDIO</p>
                    <p className="text-sm text-white/50 mt-0.5">
                      Ep {nextEpData.number}: {nextEpData.title}
                    </p>
                    <p
                      className="text-xs font-bold mt-1.5 animate-pulse"
                      style={{ color: accent }}
                    >
                      Iniciando em {timeLeft}s...
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setAutoPlayCanceled(true)}
                    className="flex-1 sm:flex-none flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 text-xs font-bold tracking-wide transition-all border border-white/10"
                  >
                    <X className="size-3.5" />
                    Cancelar
                  </button>
                  <button
                    onClick={handleNextEpisode}
                    className="flex-1 sm:flex-none flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black text-xs font-black tracking-wide transition-all hover:bg-white/90"
                  >
                    <Play className="size-3.5 fill-black" />
                    Assistir Agora
                  </button>
                </div>
              </div>
            )}

            {/* ── About section ── */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
              <h2 className="text-white font-black text-lg mb-4 tracking-tight">
                {isMovie ? 'Sobre o Filme' : `Sobre o Episódio ${epNum}`}
              </h2>
              <p className="text-white/50 leading-relaxed text-sm">
                {currentEpData?.description ||
                  'Nenhuma descrição disponível para este episódio. Assista para descobrir!'}
              </p>
            </div>

            {/* ── Warning ── */}
            <div className="flex items-center gap-4 px-5 py-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <span className="text-amber-500 font-black text-sm shrink-0">!</span>
              <p className="text-xs text-white/40 font-medium uppercase tracking-wide">
                <strong className="text-amber-500/80">AVISO:</strong> Servidores externos podem conter anúncios. Feche pop-ups imediatamente.
              </p>
            </div>

            {/* ── Report ── */}
            <button className="inline-flex items-center gap-2 text-xs text-white/30 hover:text-red-400/70 transition-colors self-start">
              <AlertCircle className="size-3.5" />
              Reportar problema com este episódio
            </button>

            {/* ── Comments ── */}
            <div className="mt-4">
              <CommentSection contentId={slug} theme={isAnimeContent ? 'anime' : 'default'} />
            </div>
          </div>

          {/* ════════════════════ RIGHT COL — Episode sidebar ════════════════════ */}
          {!isMovie && content.episodes && (
            <div className={`w-full xl:w-[420px] shrink-0 transition-all duration-500 ${showSidebar ? 'block' : 'hidden xl:hidden'}`}>
              <div className="bg-[#0c0c18] border border-white/[0.07] rounded-2xl overflow-hidden flex flex-col xl:sticky xl:top-8" style={{ height: 'auto', maxHeight: '70vh', minHeight: '300px' }}>

                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-white/[0.06] flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ListVideo className="size-5 text-white/50" />
                      <h2 className="text-white font-black text-base tracking-tight">EPISÓDIOS</h2>
                    </div>
                    <span className="text-[11px] font-bold text-white/30 bg-white/5 px-2.5 py-1 rounded-full">
                      {seasonEpisodes.length} eps
                    </span>
                  </div>

                  {/* Season selector */}
                  {content.seasons > 1 && (
                    <select
                      value={seasonNum}
                      onChange={(e) => setSeasonNum(Number(e.target.value))}
                      className="w-full bg-white/5 text-white text-xs font-bold px-4 py-3 rounded-xl border border-white/10 outline-none appearance-none cursor-pointer hover:border-white/20 transition-all"
                      style={{ colorScheme: 'dark' }}
                    >
                      {Array.from({ length: content.seasons }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}ª TEMPORADA</option>
                      ))}
                    </select>
                  )}

                  {/* Search */}
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <input
                      type="number"
                      min={1}
                      value={searchEp}
                      onChange={(e) => setSearchEp(e.target.value)}
                      placeholder="Ir para episódio..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl text-white text-xs font-medium placeholder-white/25 outline-none pl-4 pr-10 py-3 focus:border-white/25 transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    >
                      <Search className="size-4" />
                    </button>
                  </form>
                </div>

                {/* Episodes list */}
                <div
                  ref={episodesContainerRef}
                  className="flex-1 overflow-y-auto py-3 px-3 space-y-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                >
                  {seasonEpisodes.map((ep: any) => (
                    <EpisodeCard
                      key={ep.id}
                      ep={ep}
                      isActive={ep.number === epNum && (ep.season || 1) === seasonNum}
                      heroImage={content.heroImage}
                      isAnime={isAnimeContent}
                      onClick={() => setEpNum(ep.number)}
                    />
                  ))}
                </div>

              </div>
            </div>
          )}
        </div>

        {!isMovie && content.episodes && (
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={`xl:hidden fixed right-4 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-full shadow-2xl text-sm font-black transition-all ${showSidebar ? 'text-white' : 'bg-white/10 text-white/70 border border-white/20'
              }`}
            style={{
              bottom: 'calc(4.5rem + env(safe-area-inset-bottom))',
              ...(showSidebar ? { backgroundColor: accent, boxShadow: `0 8px 32px ${accentShadow}` } : {})
            }}
          >
            <ListVideo className="size-4" />
            {showSidebar ? 'Fechar' : 'Episódios'}
          </button>
        )}

      </div>
    </main>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function PlayerPage() {
  const params = useParams();
  const slug = params.slug as string;
  if (!slug) return null;
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#060610] flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-[3px] border-[#FF3366] border-t-transparent animate-spin" />
        </div>
      }
    >
      <PlayerContent slug={slug} />
    </Suspense>
  );
}