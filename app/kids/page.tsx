'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ShieldAlert, Settings, Clock, Star, Play, X, EyeOff, Check, Search, Lock, History, Smile, ArrowLeft, Gamepad } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { KidsNavbar } from '@/components/kids/KidsNavbar';
import { SleepLockScreen } from '@/components/kids/SleepLockScreen';
import { ParentalGateModal } from '@/components/kids/ParentalGateModal';
import { ParentalDashboardModal } from '@/components/kids/ParentalDashboardModal';
import { KidsPlayer } from '@/components/kids/KidsPlayer';
import { KidsCarousel } from '@/components/kids/KidsCarousel';
import { KidsBottomWidgets } from '@/components/kids/KidsBottomWidgets';
import { KidsBackgroundDecorations } from '@/components/kids/KidsBackgroundDecorations';
import { KIDS_GAMES_CATALOG } from '@/config/kidsGames';
import { KidsGameCard } from '@/components/kids/KidsGameCard';
import { KidsMascotGamerHUD } from '@/components/kids/KidsMascotGamerHUD';
import { KidsSearchModal } from '@/components/kids/KidsSearchModal';

interface KidsItem {
  id: string | number;
  title: string;
  posterUrl: string;
  backdropUrl: string;
  type: 'movie' | 'tv';
  score?: string;
  overview?: string;
  year?: string;
}

export default function KidsPage() {
  // Navigation & UI Modes
  const [movies, setMovies] = useState<KidsItem[]>([]);
  const [series, setSeries] = useState<KidsItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Parental Control States
  const [showGate, setShowGate] = useState(false);
  const [gateQuestion, setGateQuestion] = useState({ question: '', answer: '' });
  const [gateInput, setGateInput] = useState('');
  const [gateError, setGateError] = useState(false);
  const [showParentDashboard, setShowParentDashboard] = useState(false);
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  
  // Settings (Persisted in localStorage)
  const [maxRating, setMaxRating] = useState<'G' | 'PG'>('G');
  const [screenTimeLimit, setScreenTimeLimit] = useState<number>(-1);
  const [timeRemaining, setTimeRemaining] = useState<number>(-1);
  const [blockedIds, setBlockedIds] = useState<number[]>([]);
  const [history, setHistory] = useState<{ id: string | number; title: string; date: string }[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<(string | number)[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [childName, setChildName] = useState<string>('');
  const [childGender, setChildGender] = useState<'boy' | 'girl' | 'neutral'>('boy');
  const [parentPin, setParentPin] = useState<string>('0000');
  
  // Kids Video Player Overlay
  const [activePlayerItem, setActivePlayerItem] = useState<KidsItem | null>(null);
  const [playerIframeUrl, setPlayerIframeUrl] = useState<string | null>(null);

  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedRating = localStorage.getItem('streamverse_kids_rating') as 'G' | 'PG';
      if (savedRating) setMaxRating(savedRating);

      const savedTimeLimit = localStorage.getItem('streamverse_kids_time_limit');
      if (savedTimeLimit) {
        const limit = Number(savedTimeLimit);
        setScreenTimeLimit(limit);
        if (limit > 0) {
          const savedRemaining = localStorage.getItem('streamverse_kids_time_remaining');
          if (savedRemaining) {
            setTimeRemaining(Number(savedRemaining));
          } else {
            setTimeRemaining(limit * 60);
          }
        }
      }

      const savedBlocked = localStorage.getItem('streamverse_kids_blocked');
      if (savedBlocked) setBlockedIds(JSON.parse(savedBlocked));

      const savedHistory = localStorage.getItem('streamverse_kids_history');
      if (savedHistory) setHistory(JSON.parse(savedHistory));

      const savedFavorites = localStorage.getItem('streamverse_kids_favorites');
      if (savedFavorites) setFavoriteIds(JSON.parse(savedFavorites));

      const savedChildName = localStorage.getItem('streamverse_kids_child_name');
      if (savedChildName) setChildName(savedChildName);

      const savedChildGender = localStorage.getItem('streamverse_kids_child_gender') as 'boy' | 'girl' | 'neutral';
      if (savedChildGender) setChildGender(savedChildGender);

      const savedPin = localStorage.getItem('streamverse_kids_pin');
      if (savedPin) setParentPin(savedPin);
    } catch (e) {
      console.error('Failed to load parental settings', e);
    }
  }, []);

  const fetchKidsCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const ratingParam = maxRating;
      
      const moviesRes = await fetch(`/api/catalog?type=kids&category=movie&rating=${ratingParam}`);
      const seriesRes = await fetch(`/api/catalog?type=kids&category=tv&rating=${ratingParam}`);
      
      if (moviesRes.ok && seriesRes.ok) {
        const moviesData = await moviesRes.json();
        const seriesData = await seriesRes.json();
        
        setMovies((moviesData?.results || []).map((item: any) => ({
          id: item.id,
          title: item.title,
          posterUrl: item.posterPath ? `https://image.tmdb.org/t/p/w500${item.posterPath}` : '',
          backdropUrl: item.backdropPath ? `https://image.tmdb.org/t/p/original${item.backdropPath}` : '',
          type: 'movie',
          score: item.voteAverage ? item.voteAverage.toFixed(1) : '8.5',
          overview: item.overview,
          year: String(item.year || '')
        })));

        setSeries((seriesData?.results || []).map((item: any) => ({
          id: item.id,
          title: item.title,
          posterUrl: item.posterPath ? `https://image.tmdb.org/t/p/w500${item.posterPath}` : '',
          backdropUrl: item.backdropPath ? `https://image.tmdb.org/t/p/original${item.backdropPath}` : '',
          type: 'tv',
          score: item.voteAverage ? item.voteAverage.toFixed(1) : '8.5',
          overview: item.overview,
          year: String(item.year || '')
        })));
      }
    } catch (e) {
      console.error('Failed to fetch kids catalog', e);
    } finally {
      setLoading(false);
    }
  }, [maxRating]);

  useEffect(() => {
    fetchKidsCatalog();
  }, [fetchKidsCatalog]);

  useEffect(() => {
    if (screenTimeLimit > 0 && timeRemaining > 0) {
      timerInterval.current = setInterval(() => {
        setTimeRemaining((prev) => {
          const next = prev - 1;
          try {
            localStorage.setItem('streamverse_kids_time_remaining', String(next));
          } catch (e) {}
          if (next <= 0) {
            if (timerInterval.current) clearInterval(timerInterval.current);
            return 0;
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerInterval.current) clearInterval(timerInterval.current);
    }

    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, [screenTimeLimit, timeRemaining]);

  const handleResetTimer = (minutes: number) => {
    setScreenTimeLimit(minutes);
    if (minutes > 0) {
      setTimeRemaining(minutes * 60);
      try {
        localStorage.setItem('streamverse_kids_time_limit', String(minutes));
        localStorage.setItem('streamverse_kids_time_remaining', String(minutes * 60));
      } catch (e) {}
    } else {
      setTimeRemaining(-1);
      try {
        localStorage.setItem('streamverse_kids_time_limit', '-1');
        localStorage.removeItem('streamverse_kids_time_remaining');
      } catch (e) {}
    }
  };

  const generateHardQuestion = () => {
    const types = ['math_multistep', 'algebra', 'reverse_word'];
    const selectedType = types[Math.floor(Math.random() * types.length)];

    if (selectedType === 'math_multistep') {
      const num1 = Math.floor(Math.random() * 8) + 12; // 12 to 19
      const num2 = Math.floor(Math.random() * 5) + 6;  // 6 to 10
      const sub = Math.floor(Math.random() * 20) + 15; // 15 to 34
      return {
        question: `Calcule o valor de: (${num1} × ${num2}) - ${sub}`,
        answer: String((num1 * num2) - sub)
      };
    } else if (selectedType === 'algebra') {
      const x = Math.floor(Math.random() * 8) + 6; // 6 to 13
      const multiplier = Math.floor(Math.random() * 5) + 6; // 6 to 10
      const sum = Math.floor(Math.random() * 30) + 10; // 10 to 39
      const result = (x * multiplier) + sum;
      return {
        question: `Resolva a equação: Se ${multiplier}x + ${sum} = ${result}, qual é o valor de x?`,
        answer: String(x)
      };
    } else {
      const words = ["ADULTO", "RESPONSAVEL", "SEGURANCA", "BLOQUEIO", "CONTROLE"];
      const word = words[Math.floor(Math.random() * words.length)];
      const reversed = word.split('').reverse().join('');
      return {
        question: `Escreva a palavra "${word}" de trás para frente (invertida):`,
        answer: reversed
      };
    }
  };

  const handleOpenParentGate = () => {
    const challenge = generateHardQuestion();
    setGateQuestion(challenge);
    setGateInput('');
    setGateError(false);
    setShowGate(true);
  };

  const handleVerifyGate = (e: React.FormEvent, mode: 'pin' | 'challenge') => {
    e.preventDefault();
    const correct = mode === 'pin'
      ? gateInput === parentPin
      : gateInput.trim().toLowerCase() === gateQuestion.answer.toLowerCase();

    if (correct) {
      setShowGate(false);
      setShowParentDashboard(true);
    } else {
      setGateError(true);
      setGateInput('');
    }
  };

  const handleToggleFavorite = (id: string | number, type: 'movie' | 'tv' | 'game', e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteIds((prev) => {
      const isFav = prev.includes(id);
      let updated;
      if (isFav) {
        updated = prev.filter((item) => item !== id);
      } else {
        updated = [...prev, id];
      }
      try {
        localStorage.setItem('streamverse_kids_favorites', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleSaveRating = (rating: 'G' | 'PG') => {
    setMaxRating(rating);
    try {
      localStorage.setItem('streamverse_kids_rating', rating);
    } catch (e) {}
  };

  const handleSaveChildName = (val: string) => {
    setChildName(val);
    try {
      localStorage.setItem('streamverse_kids_child_name', val);
    } catch (e) {}
  };

  const handleSaveChildGender = (val: 'boy' | 'girl' | 'neutral') => {
    setChildGender(val);
    try {
      localStorage.setItem('streamverse_kids_child_gender', val);
    } catch (e) {}
  };

  const handleSaveParentPin = (val: string) => {
    setParentPin(val);
    try {
      localStorage.setItem('streamverse_kids_pin', val);
    } catch (e) {}
  };

  const handleToggleBlockTitle = (id: number) => {
    setBlockedIds((prev) => {
      const isBlocked = prev.includes(id);
      let updated;
      if (isBlocked) {
        updated = prev.filter((item) => item !== id);
      } else {
        updated = [...prev, id];
      }
      try {
        localStorage.setItem('streamverse_kids_blocked', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.setItem('streamverse_kids_history', JSON.stringify([]));
    } catch (e) {}
  };

  const handlePlayKidsContent = (item: KidsItem) => {
    setActivePlayerItem(item);
    const videoUrl = item.type === 'movie'
      ? `https://myembed.biz/filme/${item.id}`
      : `https://myembed.biz/serie/${item.id}`;
    setPlayerIframeUrl(videoUrl);

    const entry = {
      id: item.id,
      title: item.title,
      date: new Date().toLocaleString('pt-BR')
    };

    setHistory((prev) => {
      const filtered = prev.filter((h) => h.id !== item.id);
      const updated = [entry, ...filtered].slice(0, 50);
      try {
        localStorage.setItem('streamverse_kids_history', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleClosePlayer = () => {
    setActivePlayerItem(null);
    setPlayerIframeUrl(null);
  };

  const filteredMovies = movies
    .filter((m) => !blockedIds.includes(Number(m.id)))
    .filter((m) => !showFavoritesOnly || favoriteIds.includes(m.id));
  const filteredSeries = series
    .filter((s) => !blockedIds.includes(Number(s.id)))
    .filter((s) => !showFavoritesOnly || favoriteIds.includes(s.id));

  const formatTimeRemaining = () => {
    if (timeRemaining <= 0) return '00:00';
    const m = Math.floor(timeRemaining / 60);
    const s = timeRemaining % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div 
      className={`min-h-screen text-white flex flex-col font-sans relative overflow-x-hidden ${
        childGender === 'girl' ? 'kids-girl-theme' : ''
      }`}
      style={{
        fontFamily: "'Nunito', 'Baloo 2', 'Poppins Rounded', sans-serif"
      }}
    >
      {childGender === 'girl' && (
        <style dangerouslySetInnerHTML={{ __html: `
          /* ── DYNAMIC PRINCESS PEACH / MODERN COZY FANTASY OVERRIDES ── */

          /* Candy-coated primary CTA buttons (Soft 3D Bloom feeling) */
          .kids-girl-theme button.bg-gradient-to-r.from-\[\#FFE775\].to-\[\#FFD100\],
          .kids-girl-theme .animate-button-bloom {
            background: linear-gradient(to right, #FF7FA4, #FF4B78) !important;
            box-shadow: 0 8px 24px rgba(255, 75, 120, 0.4) !important;
            border-color: rgba(255, 200, 220, 0.3) !important;
            color: #ffffff !important;
            text-shadow: 0 2px 4px rgba(100, 10, 40, 0.25) !important;
          }
          .kids-girl-theme button.bg-gradient-to-r.from-\[\#FFE775\].to-\[\#FFD100\] svg,
          .kids-girl-theme .animate-button-bloom svg {
            fill: #ffffff !important;
            color: #ffffff !important;
          }

          /* Toy-like digital premium cards depth & soft hover glows */
          .kids-girl-theme .group.cursor-pointer,
          .kids-girl-theme .snap-start.group {
            background-color: rgba(32, 14, 45, 0.88) !important;
            border-color: rgba(255, 117, 169, 0.08) !important;
            box-shadow: 0 10px 25px rgba(22, 4, 32, 0.6) !important;
          }
          .kids-girl-theme .group.cursor-pointer:hover,
          .kids-girl-theme .snap-start.group:hover {
            border-color: rgba(255, 92, 138, 0.35) !important;
            box-shadow: 0 20px 45px rgba(255, 92, 138, 0.25) !important;
          }
          .kids-girl-theme .group.cursor-pointer:hover h4,
          .kids-girl-theme .group.cursor-pointer:hover h3,
          .kids-girl-theme .snap-start.group:hover h4,
          .kids-girl-theme .snap-start.group:hover h3 {
            color: #FF8DA1 !important;
          }

          /* Category tag overrides to pink pastel candy colors */
          .kids-girl-theme .bg-indigo-500\/10 {
            background-color: rgba(255, 117, 169, 0.1) !important;
            border-color: rgba(255, 117, 169, 0.18) !important;
            color: #FF8DA1 !important;
          }
          .kids-girl-theme .text-indigo-300 {
            color: #FF8DA1 !important;
          }
          .kids-girl-theme .text-indigo-200\/80 {
            color: #FFC0CB !important;
          }

          /* Sparkly cozy color filters for headings & accents */
          .kids-girl-theme .text-purple-400 {
            color: #E879F9 !important;
          }
          .kids-girl-theme .text-sky-400 {
            color: #FDA4AF !important;
          }
          .kids-girl-theme .text-emerald-400 {
            color: #FF8DA1 !important;
          }

          /* Custom glow for interactive companion bridges & cards */
          .kids-girl-theme .bg-\[\#0F0A28\]\/80 {
            background-color: rgba(28, 12, 40, 0.85) !important;
            border-color: rgba(255, 117, 169, 0.22) !important;
            box-shadow: 0 12px 35px rgba(255, 117, 169, 0.08) !important;
          }
          .kids-girl-theme .text-yellow-300 {
            color: #FF7FA4 !important;
          }

          /* Cozy cozy theme overrides for Parental Control settings and locks */
          .kids-girl-theme .bg-gradient-to-r.from-violet-500.to-indigo-600 {
            background: linear-gradient(to right, #EC4899, #B47FFF) !important;
            box-shadow: 0 8px 20px rgba(236, 72, 153, 0.3) !important;
          }

          /* Title text-shadow enhancements */
          .kids-girl-theme h2 {
            text-shadow: 0 4px 12px rgba(244, 63, 94, 0.45) !important;
          }
        `}} />
      )}
      <KidsBackgroundDecorations childGender={childGender} />
      {/* ── SCREEN TIME OUT LOCKSCREEN COVER ── */}
      {screenTimeLimit > 0 && timeRemaining === 0 && (
        <SleepLockScreen onOpenParentGate={handleOpenParentGate} />
      )}

      <KidsNavbar 
        screenTimeLimit={screenTimeLimit}
        timeRemaining={timeRemaining}
        formatTimeRemaining={formatTimeRemaining}
        onOpenParentGate={handleOpenParentGate}
        showFavoritesOnly={showFavoritesOnly}
        onToggleShowFavorites={() => setShowFavoritesOnly(!showFavoritesOnly)}
        childGender={childGender}
        onOpenSearch={() => setShowSearchOverlay(true)}
        backHref="/"
      />

      {/* ── HUGE VIEWPORT WIDESCREEN CINEMA HERO BANNER ── */}
      <div 
        className="relative w-full h-[65vh] md:h-[75vh] lg:h-[80vh] overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 65%, rgba(0, 0, 0, 0) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 65%, rgba(0, 0, 0, 0) 100%)'
        }}
      >
        {/* Main Illustration as complete background */}
        <Image 
          src="/kids/bannerprincipal.png" 
          alt="StreamVerse Kids Banner" 
          fill
          className="object-cover object-center scale-[1.02] transition-transform duration-1000 hover:scale-105"
          priority
        />

        {/* Dynamic Glowing Auras floating right on the hero - Fusing perfectly with deep space */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-transparent to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0520]/50 via-transparent to-transparent z-10 pointer-events-none" />
        
        {/* Cinematic Content overlay */}
        <div className="absolute bottom-12 left-4 md:left-8 lg:left-16 z-20 max-w-2xl text-left space-y-6 px-4 md:px-0 animate-in slide-in-from-bottom duration-1000">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 text-2xl animate-pulse">⭐</span>
            <span className="text-xs font-black uppercase tracking-widest text-indigo-300">Aventura Premium StreamVerse</span>
          </div>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-none tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]" style={{ fontFamily: "'Baloo 2', cursive" }}>
            Universo Mágico<br/>StreamVerse Kids!
          </h2>
          <p className="text-white/95 text-sm md:text-lg leading-relaxed font-bold max-w-lg drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]">
            Seu portal mágico para desenhos divertidos, filmes incríveis e séries seguras sem anúncios!
          </p>
          <div className="flex items-center gap-4 pt-2">
             <button 
               onClick={() => filteredMovies.length > 0 && handlePlayKidsContent(filteredMovies[0])}
               className="flex items-center justify-center gap-3.5 px-8 py-4.5 rounded-2xl bg-gradient-to-r from-[#FFE775] to-[#FFD100] hover:scale-105 active:scale-95 text-indigo-950 font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-[#FFD100]/25 hover:shadow-[#FFD100]/50 border border-[#FFE775]/25 select-none animate-button-bloom"
               style={{ fontFamily: "'Nunito', sans-serif" }}
             >
               <Play className="size-5 fill-indigo-950 text-indigo-950" />
               Vamos Assistir!
             </button>
             <button 
               className="flex items-center justify-center gap-3 px-8 py-4.5 rounded-2xl bg-[#0F0A28]/85 border border-white/10 hover:border-violet-500/30 text-white hover:text-yellow-300 hover:scale-105 active:scale-95 font-black text-xs uppercase tracking-widest transition-all shadow-md backdrop-blur-md select-none"
               style={{ fontFamily: "'Nunito', sans-serif" }}
             >
               Explorar
             </button>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 w-full max-w-full px-6 md:px-12 lg:px-16 pt-10 pb-0 relative z-10">

        {loading ? (
          <div className="w-full py-32 flex flex-col items-center justify-center gap-6 text-white relative z-10">
            <div className="w-20 h-20 border-8 border-indigo-500/30 border-t-yellow-400 rounded-full animate-spin shadow-[0_0_30px_rgba(250,204,21,0.4)]"></div>
            <p className="text-xl font-black uppercase tracking-widest text-indigo-300 mt-4 drop-shadow-md" style={{ fontFamily: "'Baloo 2', cursive" }}>Preparando a mágica...</p>
          </div>
        ) : (
          <div className="space-y-24 relative z-10 py-6">
            {/* Mascot Companion - Inspiring healthy habits and self-esteem */}
            <KidsMascotGamerHUD childName={childName} childGender={childGender} />

            <KidsCarousel 
              title="Séries Animadas Divertidas"
              icon={<span className="text-sky-400 text-3xl drop-shadow-md animate-pulse">📺</span>}
              colorTheme="sky"
              items={filteredSeries}
              onPlay={handlePlayKidsContent}
              category="tv"
              rating={maxRating}
            />

            <KidsCarousel 
              title="Filmes Mágicos para a Família"
              icon={<span className="text-pink-400 text-3xl drop-shadow-md animate-pulse">🎬</span>}
              colorTheme="pink"
              items={filteredMovies}
              onPlay={handlePlayKidsContent}
              category="movie"
              rating={maxRating}
            />

            {(!showFavoritesOnly || (filteredMovies.length + filteredSeries.length) > 0) && (
              <KidsCarousel 
                title={showFavoritesOnly ? "Campeões da Sua Lista! 🏆" : "Super Campeões de Audiência"}
                icon={<span className="text-indigo-400 text-3xl drop-shadow-md animate-pulse">👑</span>}
                colorTheme="indigo"
                items={showFavoritesOnly 
                  ? [...filteredMovies, ...filteredSeries].filter(m => favoriteIds.includes(m.id))
                  : [...filteredMovies, ...filteredSeries].sort((a, b) => Number(b.score || 0) - Number(a.score || 0))
                }
                onPlay={handlePlayKidsContent}
                favoriteIds={favoriteIds}
                onToggleFavorite={handleToggleFavorite}
                category={showFavoritesOnly ? undefined : "movie"}
                rating={maxRating}
              />
            )}

            <KidsCarousel 
              title={showFavoritesOnly ? "Seus Desenhos Favoritos!" : "Desenhos Favoritos e Clássicos"}
              icon={<span className="text-purple-400 text-3xl drop-shadow-md animate-pulse">🪐</span>}
              colorTheme="purple"
              items={[...filteredSeries].reverse()}
              onPlay={handlePlayKidsContent}
              favoriteIds={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
              category={showFavoritesOnly ? undefined : 'tv'}
              rating={maxRating}
            />

            <KidsCarousel 
              title={showFavoritesOnly ? "Seus Filmes Favoritos!" : "Grandes Aventuras Lego e Heróis"}
              icon={<span className="text-emerald-400 text-3xl drop-shadow-md animate-pulse">🚀</span>}
              colorTheme="emerald"
              items={[...filteredMovies].slice().sort((a, b) => Number(b.score || 0) - Number(a.score || 0))}
              onPlay={handlePlayKidsContent}
              favoriteIds={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
              category={showFavoritesOnly ? undefined : 'movie'}
              rating={maxRating}
            />

            {/* Clickable Banner with exact aspect-ratio and zero image cropping */}
            <Link 
              href="/kids/play" 
              className={`relative block w-full group overflow-hidden rounded-[32px] shadow-2xl border transition-all duration-300 scale-100 hover:scale-[1.01] active:scale-95 select-none ${
                childGender === 'girl'
                  ? 'border-pink-500/25 hover:border-pink-500/50 shadow-pink-950/10'
                  : 'border-white/10 hover:border-violet-500/30 shadow-indigo-950/20'
              }`}
            >
              {/* Natural <img> rendering to guarantee 100% perfect aspect ratio with zero cropping! */}
              <img
                src="/kids/bannernovidades.png"
                alt="Novidades StreamVerse Games"
                className="w-full h-auto block group-hover:scale-[1.015] transition-transform duration-700"
              />

              {/* Precise horizontal gradient mask overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#070514]/90 via-[#070514]/40 to-transparent z-0 pointer-events-none" />

              {/* Text and Button content overlay restricted to the left-side blue space */}
              <div className="absolute inset-0 z-10 flex flex-col justify-center gap-2 sm:gap-3 md:gap-4 p-4 sm:p-6 md:p-8 lg:p-10 text-left max-w-[40%] sm:max-w-[38%]">
                
                {/* Badge Tag */}
                <div className="hidden xs:block">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl bg-yellow-400/20 text-yellow-300 text-[6px] sm:text-[8px] md:text-[10px] font-black uppercase tracking-wider border border-yellow-400/10">
                    <Gamepad className="size-2 sm:size-3 md:size-3.5 animate-bounce text-yellow-400" />
                    NOVIDADE: STREAMVERSE GAMES
                  </span>
                </div>

                {/* Main Headings */}
                <div className="space-y-1 sm:space-y-2">
                  <h3 
                    className="text-xs sm:text-lg md:text-2xl lg:text-3xl font-extrabold text-white leading-tight tracking-tight drop-shadow-md"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                  >
                    Jogos Divertidos e Seguros para Brincar!
                  </h3>
                  <p className="hidden sm:block text-indigo-200/90 text-[8px] md:text-[10px] lg:text-xs font-black leading-relaxed drop-shadow-sm line-clamp-2 md:line-clamp-3">
                    Que tal dar um tempo nos desenhos e se divertir com quebra-cabeças, livros de colorir fofos, corridas malucas de motinho e muito mais? Sem anúncios chatos e 100% livre!
                  </p>
                </div>

                {/* Action button */}
                <div>
                  <button
                    className="px-3 py-1.5 sm:px-5 sm:py-2.5 md:px-6 md:py-3 rounded-lg sm:rounded-2xl bg-gradient-to-r from-[#FFE775] to-[#FFD100] text-indigo-950 font-black text-[7px] sm:text-[9px] md:text-[10px] uppercase tracking-widest transition-all shadow-md shadow-[#FFD100]/25 hover:shadow-[#FFD100]/50 border border-[#FFE775]/25 hover:scale-105 active:scale-95 flex items-center gap-1.5"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                  >
                    <Gamepad className="size-2.5 sm:size-3.5 md:size-4 fill-indigo-950 text-indigo-950" />
                    Jogar Agora!
                  </button>
                </div>

              </div>
            </Link>

            {/* 🎮 JOGOS INSPIRADOS NO QUE VOCÊ ASSISTIU ── */}
            {(!showFavoritesOnly || KIDS_GAMES_CATALOG.filter((g) => favoriteIds.includes(g.id)).length > 0) && (
              <div className="space-y-6 select-none relative z-10">
                <div className="flex items-center gap-3">
                  <span className="text-3xl animate-pulse">🎮</span>
                  <h3 className="text-lg md:text-2xl font-black text-white uppercase tracking-tight" style={{ fontFamily: "'Nunito', sans-serif" }}>
                    {showFavoritesOnly ? "Seus Jogos Favoritos! 🕹️" : "Jogos Inspirados no que Você Assistiu!"}
                  </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {(showFavoritesOnly 
                    ? KIDS_GAMES_CATALOG.filter((game) => favoriteIds.includes(game.id))
                    : KIDS_GAMES_CATALOG.slice(0, 4)
                  ).map((game) => (
                    <KidsGameCard 
                      key={game.id} 
                      game={game} 
                      isFavorite={favoriteIds.includes(game.id)}
                      onToggleFavorite={(id, e) => handleToggleFavorite(id, 'game', e)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 🤖 MASCOT INTERACTIVE RECOMMENDATIONS BRIDGE */}
            {!showFavoritesOnly && (
              <div className={`relative w-full bg-[#0F0A28]/80 backdrop-blur-md border rounded-[24px] p-6 flex flex-col sm:flex-row items-center gap-6 shadow-xl transition-all relative z-10 ${
                childGender === 'girl'
                  ? 'border-pink-500/25 hover:border-pink-500/40 shadow-pink-950/5'
                  : 'border-white/10 hover:border-violet-500/25'
              }`}>
                <div className="relative size-16 shrink-0 animate-bounce select-none">
                  <Image src={childGender === 'girl' ? "/kids/mascotemeninas.png" : "/kids/mascote.png"} alt="Mascote Mini" fill className="object-contain" />
                </div>
                <div className="text-left space-y-2">
                  <h4 className="text-yellow-300 font-black text-sm uppercase tracking-wider animate-pulse" style={{ fontFamily: "'Nunito', sans-serif" }}>
                    {childGender === 'girl' ? 'Dica da Astronauta StreamVerse! 🚀' : 'Dica do Astronauta StreamVerse! 🚀'}
                  </h4>
                  <p className="text-indigo-100 font-bold text-xs sm:text-sm leading-relaxed">
                    {childName 
                      ? `"Vi que você adora desenhos de aventura, ${childName}! Que tal se divertir com quebra-cabeças incríveis do monstrinho comendo doce? Clique abaixo para jogar Cut the Rope 1 sem instalar nadinha! 🎮🍬"`
                      : `"Vi que você adora desenhos de aventura! Que tal se divertir com quebra-cabeças incríveis do monstrinho comendo doce? Clique abaixo para jogar Cut the Rope 1 sem instalar nadinha! 🎮🍬"`}
                  </p>
                  <div className="pt-1">
                    <Link href="/kids/play/cut-the-rope">
                      <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF75A9] to-[#FF1F6D] text-white font-extrabold text-[10px] uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-md shadow-[#FF1F6D]/20 border border-[#FF75A9]/20">
                        Jogar Agora! 🕹️
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Empty Favorites Fallback Banner */}
            {showFavoritesOnly && filteredMovies.length === 0 && filteredSeries.length === 0 && KIDS_GAMES_CATALOG.filter((g) => favoriteIds.includes(g.id)).length === 0 && (
              <div className={`relative w-full bg-[#0F0A28]/80 backdrop-blur-xl border rounded-[32px] p-12 text-center space-y-6 shadow-2xl relative z-10 flex flex-col items-center max-w-2xl mx-auto my-12 ${
                childGender === 'girl' ? 'border-pink-500/25 shadow-pink-950/10' : 'border-white/10'
              }`}>
                <div className="relative size-24 animate-bounce">
                  <Image src={childGender === 'girl' ? "/kids/mascotemeninas.png" : "/kids/mascote.png"} alt="Mascote Triste" fill className="object-contain" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-white text-xl font-black uppercase tracking-wider" style={{ fontFamily: "'Nunito', sans-serif" }}>
                    Sua Lista de Favoritos está Vazia! 💖✨
                  </h3>
                  <p className="text-indigo-200/60 text-sm font-bold leading-relaxed px-4">
                    Não se preocupe! Clique no coraçãozinho vermelho de qualquer desenho, série ou jogo para montar o seu próprio parque de diversões personalizado!
                  </p>
                </div>
                <button
                  onClick={() => setShowFavoritesOnly(false)}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-black text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-500/20"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  Voltar a Explorar o Universo 🚀
                </button>
              </div>
            )}

            <KidsBottomWidgets childName={childName} childGender={childGender} />
          </div>
        )}
      </main>

      {/* ── PARENT GATE QUESTION MODAL ── */}
      {showGate && (
        <ParentalGateModal 
          gateQuestionText={gateQuestion.question}
          gateInput={gateInput}
          setGateInput={setGateInput}
          gateError={gateError}
          onVerify={handleVerifyGate}
          onClose={() => setShowGate(false)}
        />
      )}

      {/* ── PARENTAL CONTROL DASHBOARD ── */}
      {showParentDashboard && (
        <ParentalDashboardModal 
          maxRating={maxRating}
          handleSaveRating={handleSaveRating}
          screenTimeLimit={screenTimeLimit}
          handleResetTimer={handleResetTimer}
          blockedIds={blockedIds}
          handleToggleBlockTitle={handleToggleBlockTitle}
          history={history}
          handleClearHistory={handleClearHistory}
          childName={childName}
          handleSaveChildName={handleSaveChildName}
          childGender={childGender}
          handleSaveChildGender={handleSaveChildGender}
          parentPin={parentPin}
          handleSaveParentPin={handleSaveParentPin}
          onClose={() => setShowParentDashboard(false)}
        />
      )}

      {/* ── SAFE KIDS PLAYER OVERLAY (SANDBOX) ── */}
      {activePlayerItem && playerIframeUrl && (
        <KidsPlayer 
          title={activePlayerItem.title}
          iframeUrl={playerIframeUrl}
          onClose={handleClosePlayer}
        />
      )}

      {/* ── IMMERSIVE KIDS SEARCH OVERLAY ── */}
      <KidsSearchModal 
        isOpen={showSearchOverlay}
        onClose={() => setShowSearchOverlay(false)}
        onPlayContent={handlePlayKidsContent}
        childGender={childGender}
        childName={childName}
      />
    </div>
  );
}
