'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Gamepad2, ShieldCheck, Heart, Sparkles, Trophy, ArrowLeft, RotateCcw, Monitor, Gamepad, Zap, Play } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

import { KIDS_GAMES_CATALOG, GameItem } from '@/config/kidsGames';
import { KidsNavbar } from '@/components/kids/KidsNavbar';
import { ParentalGateModal } from '@/components/kids/ParentalGateModal';
import { ParentalDashboardModal } from '@/components/kids/ParentalDashboardModal';
import { SleepLockScreen } from '@/components/kids/SleepLockScreen';

// Modular UI Components (Watched folder paths)
import { KidsMascotGamerHUD } from '@/components/kids/KidsMascotGamerHUD';
import { KidsSwitchSearchConsole } from '@/components/kids/KidsSwitchSearchConsole';
import { KidsCategoryPillsSelector } from '@/components/kids/KidsCategoryPillsSelector';
import { KidsGameCard } from '@/components/kids/KidsGameCard';
import { KidsBackgroundDecorations } from '@/components/kids/KidsBackgroundDecorations';
import { fuzzyFilterKidsGames } from '@/lib/spellcheck';

export default function KidsPlayPage() {
  const [games, setGames] = useState<GameItem[]>(KIDS_GAMES_CATALOG);
  const [selectedCategory, setSelectedCategory] = useState<string>("Tudo");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // Infinite Scroll States
  const [displayedGames, setDisplayedGames] = useState<any[]>([]);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  // Parental controls states
  const [showGate, setShowGate] = useState(false);
  const [gateQuestion, setGateQuestion] = useState({ question: '', answer: '' });
  const [gateInput, setGateInput] = useState('');
  const [gateError, setGateError] = useState(false);
  const [showParentDashboard, setShowParentDashboard] = useState(false);
  const [maxRating, setMaxRating] = useState<'G' | 'PG'>('G');
  const [screenTimeLimit, setScreenTimeLimit] = useState<number>(-1);
  const [timeRemaining, setTimeRemaining] = useState<number>(-1);
  const [favoriteIds, setFavoriteIds] = useState<(string | number)[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [childName, setChildName] = useState<string>('');
  const [childGender, setChildGender] = useState<'boy' | 'girl' | 'neutral'>('boy');
  const [parentPin, setParentPin] = useState<string>('0000');
  const [blockedIds, setBlockedIds] = useState<number[]>([]);
  const [history, setHistory] = useState<{ id: string | number; title: string; date: string }[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 850);
    return () => clearTimeout(timer);
  }, []);

  // Sync parental control settings
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedRating = localStorage.getItem('streamverse_kids_rating') as 'G' | 'PG';
      if (savedRating) setMaxRating(savedRating);
      const savedTimeLimit = localStorage.getItem('streamverse_kids_time_limit');
      if (savedTimeLimit) setScreenTimeLimit(Number(savedTimeLimit));
      
      const savedTimeRemaining = localStorage.getItem('streamverse_kids_time_remaining');
      if (savedTimeRemaining) setTimeRemaining(Number(savedTimeRemaining));

      const savedFavorites = localStorage.getItem('streamverse_kids_favorites');
      if (savedFavorites) setFavoriteIds(JSON.parse(savedFavorites));
      const savedChildName = localStorage.getItem('streamverse_kids_child_name');
      if (savedChildName) setChildName(savedChildName);
      const savedChildGender = localStorage.getItem('streamverse_kids_child_gender') as 'boy' | 'girl' | 'neutral';
      if (savedChildGender) setChildGender(savedChildGender);
      const savedPin = localStorage.getItem('streamverse_kids_pin');
      if (savedPin) setParentPin(savedPin);
      
      const savedBlocked = localStorage.getItem('streamverse_kids_blocked');
      if (savedBlocked) setBlockedIds(JSON.parse(savedBlocked));
      const savedHistory = localStorage.getItem('streamverse_kids_history');
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    } catch (e) { }
  }, []);

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

  const handleSaveParentPin = (val: string) => {
    setParentPin(val);
    try {
      localStorage.setItem('streamverse_kids_pin', val);
    } catch (e) {}
  };

  const handleToggleFavorite = (id: string | number, e: React.MouseEvent) => {
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

  // Filter games based on search & categories with fuzzy spellcheck
  const { filtered: fuzzyGames, correctedQuery, wasCorrected } = fuzzyFilterKidsGames(games, searchQuery, selectedCategory);

  const filteredGames = fuzzyGames.filter(game => {
    const matchesFavorites = !showFavoritesOnly || favoriteIds.includes(game.id);
    return matchesFavorites;
  });

  // Reset or load initial batch when filters change (extensive catalog!)
  useEffect(() => {
    if (filteredGames.length > 0) {
      const initial = filteredGames.slice(0, 24).map((g, idx) => ({
        ...g,
        virtualId: `${g.id}-init-${idx}`
      }));
      setDisplayedGames(initial);
    } else {
      setDisplayedGames([]);
    }
  }, [selectedCategory, searchQuery, games]);

  // Load more games (Endless Loop Generator - extensive batches!)
  const handleLoadMore = () => {
    if (filteredGames.length === 0 || loadingMore) return;
    setLoadingMore(true);

    setTimeout(() => {
      setDisplayedGames(prev => {
        const nextBatch: any[] = [];
        const startIdx = prev.length;

        for (let i = 0; i < 24; i++) {
          const rawIdx = (startIdx + i) % filteredGames.length;
          const original = filteredGames[rawIdx];
          const virtualPlayers = Math.floor(Math.random() * 120 + 8) + "K jogando";

          nextBatch.push({
            ...original,
            virtualId: `${original.id}-loop-${startIdx + i}-${Math.random().toString(36).substring(2, 6)}`,
            playersCount: virtualPlayers
          });
        }
        return [...prev, ...nextBatch];
      });
      setLoadingMore(false);
    }, 800);
  };

  // IntersectionObserver for Infinite Scroll Sentinel
  useEffect(() => {
    if (loading || displayedGames.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '150px' }
    );

    const sentinel = document.getElementById('infinite-scroll-sentinel');
    if (sentinel) observer.observe(sentinel);

    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [displayedGames, loading, filteredGames]);

  const timerInterval = useRef<NodeJS.Timeout | null>(null);

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

  const formatTimeRemaining = () => {
    if (timeRemaining <= 0) return '00:00';
    const m = Math.floor(timeRemaining / 60);
    const s = timeRemaining % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

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

  const handleSaveRating = (rating: 'G' | 'PG') => {
    setMaxRating(rating);
    try {
      localStorage.setItem('streamverse_kids_rating', rating);
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

  return (
    <div
      className="min-h-screen text-white flex flex-col font-sans relative overflow-x-hidden"
      style={{
        fontFamily: "'Nunito', 'Baloo 2', sans-serif"
      }}
    >
      <KidsBackgroundDecorations childGender={childGender} />
      <KidsNavbar
        screenTimeLimit={screenTimeLimit}
        timeRemaining={timeRemaining}
        formatTimeRemaining={formatTimeRemaining}
        onOpenParentGate={handleOpenParentGate}
        showFavoritesOnly={showFavoritesOnly}
        onToggleShowFavorites={() => setShowFavoritesOnly(!showFavoritesOnly)}
        childGender={childGender}
      />

      {/* 🔮 Extensive Game Grid with spacing below KidsNavbar */}
      <div className="relative w-full z-10 bg-[#0A0520] pt-28 pb-24">

        {/* 🎮 NINTENDO SWITCH STYLED CONSOLE SEARCH CONTAINER (MODULAR COMPONENTS) */}
        <div className="max-w-3xl mx-auto px-6 mt-12 space-y-8 relative z-20">

          <KidsSwitchSearchConsole
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {wasCorrected && searchQuery.trim() !== "" && (
            <div className="relative group max-w-2xl mx-auto -mt-4 animate-in fade-in slide-in-from-top duration-300">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-violet-600 rounded-2xl blur opacity-25" />
              <div className="relative p-4 rounded-xl bg-[#0F0A28]/95 border border-pink-500/35 text-pink-200 text-xs font-bold flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="text-pink-400 text-base animate-pulse">✨</span>
                  <span>
                    Entendemos seu termo mágico! Mostrando resultados para{" "}
                    <span className="font-extrabold text-yellow-300 font-display">
                      "{correctedQuery}"
                    </span>{" "}
                    <span className="text-white/40 font-normal">(Você digitou: "{searchQuery}")</span>
                  </span>
                </div>
                <button
                  onClick={() => setSearchQuery(correctedQuery)}
                  className="px-3.5 py-1.5 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 font-black uppercase text-[10px] tracking-wider transition-all border border-pink-500/30 hover:scale-105"
                >
                  Confirmar Termo 🎮
                </button>
              </div>
            </div>
          )}

          {/* 🌟 VIBRANT 3D GAME CATEGORY PILLS (MODULAR COMPONENT) */}
          <KidsCategoryPillsSelector
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        </div>

        {/* 🚀 Main Arcade Catalog Grid */}
        <main className="max-w-6xl w-full mx-auto px-6 mt-12 relative z-10">
          {loading ? (
            /* High-end loading skeleton cards */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="w-full aspect-[4/5] rounded-[24px] border border-white/5 bg-[#120b38]/50 p-5 flex flex-col justify-between animate-pulse">
                  <div className="w-full h-[55%] bg-indigo-950/60 rounded-[18px]" />
                  <div className="space-y-3 pt-4 flex-1">
                    <div className="h-6 w-3/4 bg-indigo-950/60 rounded-full" />
                    <div className="h-4 w-5/6 bg-indigo-950/60 rounded-full" />
                    <div className="h-4 w-1/2 bg-indigo-950/60 rounded-full" />
                  </div>
                  <div className="h-12 w-full bg-indigo-950/60 rounded-[16px]" />
                </div>
              ))}
            </div>
          ) : displayedGames.length > 0 ? (
            /* Game Cards Grid */
            <div className="space-y-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
                {displayedGames.map((game) => (
                  <KidsGameCard
                    key={game.virtualId}
                    game={game}
                    isFavorite={favoriteIds.includes(game.id)}
                    onToggleFavorite={(id, e) => handleToggleFavorite(id, e)}
                  />
                ))}
              </div>

              {/* ── Sentinel element for infinite scrolling trigger ── */}
              <div id="infinite-scroll-sentinel" className="h-12 w-full flex items-center justify-center" />

              {/* ── Bouncy Mascot Endless Loader ── */}
              {loadingMore && (
                <div className="w-full py-10 flex flex-col items-center justify-center gap-5 text-center select-none animate-in fade-in duration-300">
                  <div className="relative size-16 md:size-20 animate-spin">
                    <Image
                      src={childGender === 'girl' ? "/kids/mascotemeninas.png" : "/kids/mascote.png"}
                      alt="Mascote Astronauta"
                      fill
                      className={`object-contain ${
                        childGender === 'girl'
                          ? 'drop-shadow-[0_0_25px_rgba(244,63,94,0.6)]'
                          : 'drop-shadow-[0_0_25px_rgba(250,204,21,0.5)]'
                      }`}
                    />
                  </div>
                  <p 
                    className={`text-lg font-black uppercase tracking-widest mt-2 animate-bounce ${
                      childGender === 'girl' ? 'text-pink-400' : 'text-yellow-400'
                    }`} 
                    style={{ fontFamily: "'Baloo 2', cursive" }}
                  >
                    Invocando novos mundos divertidos... 🚀✨
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Empty Search State */
            <div className="w-full py-20 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-500 select-none">
              <div className="relative size-32">
                <Image
                  src={childGender === 'girl' ? "/kids/mascotemeninas.png" : "/kids/mascote.png"}
                  alt="Mascote Triste"
                  fill
                  className="object-contain grayscale"
                />
              </div>
              <div className="space-y-2 max-w-md">
                <h3 className="text-3xl font-black text-white" style={{ fontFamily: "'Baloo 2', cursive" }}>
                  Ops! Nenhum jogo encontrado
                </h3>
                <p className="text-indigo-200 font-bold leading-relaxed">
                  Não conseguimos encontrar jogos com o nome ou tags <span className={`font-black ${
                    childGender === 'girl' ? 'text-pink-400' : 'text-yellow-400'
                  }`}>"{searchQuery}"</span> nesta categoria. Que tal tentar outra busca ou ver todos os jogos?
                </p>
              </div>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("Tudo");
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-xs tracking-wider border-4 border-[#07031A] shadow-[0_4px_0_#07031A]"
              >
                <RotateCcw className="size-4" />
                Ver Todos os Jogos
              </button>
            </div>
          )}
        </main>

      </div>

      {/* Parental Gate Modal */}
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

      {/* Parental Dashboard Modal */}
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

      {screenTimeLimit > 0 && timeRemaining === 0 && (
        <SleepLockScreen onOpenParentGate={handleOpenParentGate} />
      )}
    </div>
  );
}
