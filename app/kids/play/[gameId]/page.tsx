'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, ArrowLeft, Maximize2, Minimize2, ShieldAlert, Heart, Trophy, Sparkles, Gamepad2, ShieldCheck, Monitor } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

import { KIDS_GAMES_CATALOG, GameItem } from '@/config/kidsGames';
import { KidsNavbar } from '@/components/kids/KidsNavbar';
import { KidsGameCard } from '@/components/kids/KidsGameCard';
import { KidsBackgroundDecorations } from '@/components/kids/KidsBackgroundDecorations';
import { ParentalGateModal } from '@/components/kids/ParentalGateModal';
import { ParentalDashboardModal } from '@/components/kids/ParentalDashboardModal';
import { SleepLockScreen } from '@/components/kids/SleepLockScreen';

export default function GamePlayPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;

  // Parental Dashboard states
  const [showGate, setShowGate] = useState(false);
  const [gateQuestion, setGateQuestion] = useState({ question: '', answer: '' });
  const [gateInput, setGateInput] = useState('');
  const [gateError, setGateError] = useState(false);
  const [showParentDashboard, setShowParentDashboard] = useState(false);

  const [maxRating, setMaxRating] = useState<'G' | 'PG'>('G');
  const [blockedIds, setBlockedIds] = useState<number[]>([]);
  const [history, setHistory] = useState<{ id: string | number; title: string; date: string }[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<(string | number)[]>([]);
  const [childName, setChildName] = useState<string>('');
  const [parentPin, setParentPin] = useState<string>('0000');

  const [game, setGame] = useState<GameItem | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [relatedGames, setRelatedGames] = useState<GameItem[]>([]);
  const playerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Parental controls states
  const [screenTimeLimit, setScreenTimeLimit] = useState<number>(-1);
  const [timeRemaining, setTimeRemaining] = useState<number>(-1);

  useEffect(() => {
    if (!gameId) return;
    
    // Find active game in curated catalog
    const foundGame = KIDS_GAMES_CATALOG.find(g => g.id === gameId);
    if (foundGame) {
      setGame(foundGame);
      // Fetch related games (different id, same category or random ones)
      const related = KIDS_GAMES_CATALOG.filter(g => g.id !== foundGame.id)
        .slice(0, 3);
      setRelatedGames(related);
    } else {
      router.push("/kids/play");
    }
  }, [gameId, router]);

  const [childGender, setChildGender] = useState<'boy' | 'girl' | 'neutral'>('boy');

  // Sync parental control settings
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedTimeLimit = localStorage.getItem('streamverse_kids_time_limit');
      if (savedTimeLimit) setScreenTimeLimit(Number(savedTimeLimit));
      
      const savedTimeRemaining = localStorage.getItem('streamverse_kids_time_remaining');
      if (savedTimeRemaining) setTimeRemaining(Number(savedTimeRemaining));

      const savedChildGender = localStorage.getItem('streamverse_kids_child_gender') as 'boy' | 'girl' | 'neutral';
      if (savedChildGender) setChildGender(savedChildGender);

      const savedRating = localStorage.getItem('streamverse_kids_rating') as 'G' | 'PG';
      if (savedRating) setMaxRating(savedRating);

      const savedBlocked = localStorage.getItem('streamverse_kids_blocked');
      if (savedBlocked) setBlockedIds(JSON.parse(savedBlocked));

      const savedHistory = localStorage.getItem('streamverse_kids_history');
      if (savedHistory) setHistory(JSON.parse(savedHistory));

      const savedFavorites = localStorage.getItem('streamverse_kids_favorites');
      if (savedFavorites) setFavoriteIds(JSON.parse(savedFavorites));

      const savedChildName = localStorage.getItem('streamverse_kids_child_name');
      if (savedChildName) setChildName(savedChildName);

      const savedPin = localStorage.getItem('streamverse_kids_pin');
      if (savedPin) setParentPin(savedPin);
    } catch (e) {}
  }, []);

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

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (playerRef.current) {
        if (playerRef.current.requestFullscreen) {
          playerRef.current.requestFullscreen();
        }
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  if (!game) {
    return (
      <div 
        className="min-h-screen text-white flex flex-col items-center justify-center gap-6" 
        style={{ background: 'radial-gradient(circle at 50% 0%, #170F44 0%, #0A0520 65%, #050215 100%)' }}
      >
        <div className="w-20 h-20 border-6 border-indigo-500/30 border-t-yellow-400 rounded-full animate-spin"></div>
        <p className="font-black tracking-widest text-yellow-300 text-lg animate-bounce uppercase">Conectando ao Console Mágico...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-white flex flex-col font-sans relative overflow-x-hidden pb-32 animate-in fade-in duration-700"
      style={{
        fontFamily: "'Nunito', 'Baloo 2', sans-serif"
      }}
    >
      <KidsBackgroundDecorations childGender={childGender} />

      {/* Floating Retro Icons */}
      <div className="absolute top-40 left-8 size-10 opacity-25 animate-pulse text-indigo-400"><Sparkles className="size-full animate-spin" style={{ animationDuration: '6s' }} /></div>
      <div className="absolute top-96 right-12 size-12 opacity-20 animate-bounce text-pink-400"><Gamepad2 className="size-full" /></div>

      <KidsNavbar
        screenTimeLimit={screenTimeLimit}
        timeRemaining={timeRemaining}
        formatTimeRemaining={formatTimeRemaining}
        onOpenParentGate={handleOpenParentGate}
        childGender={childGender}
        backHref="/kids/play"
      />

      <div className="pt-28 md:pt-32 px-6 md:px-12 lg:px-16 w-full max-w-5xl mx-auto relative z-10 space-y-8">
        
        {/* Navigation & Safety header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
          <Link href="/kids/play">
            <button
              className="group flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#0F0A28]/85 border border-white/5 text-white hover:text-yellow-300 font-black text-xs uppercase tracking-widest shadow-md hover:border-violet-500/30 hover:shadow-violet-500/10 transition-all hover:-translate-y-0.5 active:translate-y-0"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              <ArrowLeft className="size-4 group-hover:-translate-x-1.5 transition-transform text-pink-400" />
              Voltar para a Arena
            </button>
          </Link>

          <div className="flex items-center gap-3 px-5 py-3 bg-[#0F0A28]/80 border border-white/10 rounded-2xl shadow-xl">
            <span className="flex items-center justify-center size-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-black text-sm select-none">
              ✓
            </span>
            <div className="text-left leading-none">
              <p className="text-xs font-black text-emerald-400 uppercase tracking-widest leading-none">Ambiente Blindado</p>
              <p className="text-[10px] text-indigo-200/90 font-bold mt-1 leading-none">Este jogo é 100% livre de compras e anúncios.</p>
            </div>
          </div>
        </div>

        {/* ── HIGH-END SCREEN EMBEDDED PLAYER CONTAINER ── */}
        <div 
          ref={playerRef}
          className="relative w-full aspect-[16/10] sm:aspect-[16/9.5] md:aspect-[16/9] rounded-[28px] border border-white/10 bg-[#0C0626] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col justify-between group"
        >
          {/* Cyber light highlights inside screen */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-pink-500 via-violet-500 to-cyan-500 opacity-60 z-35" />

          {isPlaying ? (
            /* Safe Embed HTML5 Iframe Component */
            <iframe
              src={game.embedUrl}
              className="w-full h-full border-none flex-grow relative z-10"
              allow="autoplay; fullscreen; gamepad"
              sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-pointer-lock"
              title={game.title}
            />
          ) : (
            /* Interactive custom cover overlay (Loads game only on user action) */
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center select-none">
              <div className="absolute inset-0 bg-cover bg-center blur-md opacity-20" style={{ backgroundImage: `url(${game.thumbnail})` }} />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0c0626]/75 via-[#0c0626]/95 to-[#0c0626] z-10" />

              {/* Large bouncy cover card */}
              <div className="relative max-w-lg space-y-6 z-20 animate-in zoom-in-95 duration-500">
                <div className="relative size-28 md:size-36 mx-auto aspect-square rounded-[24px] overflow-hidden border border-white/10 shadow-2xl">
                  <Image
                    src={game.thumbnail}
                    alt={game.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="space-y-3">
                  <span className="px-3 py-1 rounded-xl bg-yellow-400/90 text-indigo-950 text-xxs font-black uppercase tracking-wider shadow-md backdrop-blur-sm">
                    ⭐ Classificação: {game.ageRating}
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight" style={{ fontFamily: "'Nunito', sans-serif" }}>
                    {game.title}
                  </h2>
                </div>

                <p className="text-indigo-200/90 text-xs md:text-sm font-bold leading-relaxed max-w-xs mx-auto">
                  Pronto para jogar e se divertir? Clique no botão mágico abaixo para ligar o videogame seguro! 👾⚡
                </p>

                <button
                  onClick={() => setIsPlaying(true)}
                  className={`px-10 py-4.5 rounded-2xl bg-gradient-to-r ${game.bgColor || "from-violet-500 to-indigo-600"} text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-103 active:scale-98 transition-all flex items-center justify-center gap-3 mx-auto animate-button-bloom`}
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  <Play className="size-5 fill-current animate-pulse text-white" />
                  Ligar Videogame!
                </button>
              </div>
            </div>
          )}

          {/* Interactive Player Controls overlay bar */}
          <div className="w-full bg-[#0F0A28]/95 border-t border-white/10 px-6 py-4 flex items-center justify-between z-30 relative select-none">
            <div className="flex items-center gap-3">
              <div className="relative size-10 shrink-0 animate-bounce">
                <Image src={childGender === 'girl' ? "/kids/mascotemeninas.png" : "/kids/mascote.png"} alt="Mascote Mini" fill className="object-contain" />
              </div>
              <div className="text-left leading-none">
                <span className="text-white font-black text-sm uppercase md:text-base block mb-1" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  {game.title}
                </span>
                <span className="inline-block px-2 py-0.5 rounded-md bg-pink-500/20 border border-pink-500/30 text-pink-300 text-[10px] font-black uppercase tracking-wider">
                  {game.category}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleFullscreen}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600/90 hover:bg-indigo-600 border border-indigo-400/30 text-white font-black text-xs uppercase shadow-md hover:scale-105 active:scale-95 transition-all"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="size-4 text-yellow-300" />
                    <span className="hidden sm:inline">Sair da Tela Cheia</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="size-4 text-yellow-300" />
                    <span className="hidden sm:inline">Tela Cheia</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── DESCRIPTION & COMPLIANCE INFOCARD ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 select-none">
          
          {/* Main game information details */}
          <div className="lg:col-span-2 p-8 bg-[#0F0A28]/90 border border-white/5 rounded-[28px] shadow-xl space-y-6 hover:border-white/10 transition-colors">
            <div className="space-y-3 text-left">
              <h3 className="text-2xl font-black text-white flex items-center gap-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
                <Gamepad2 className="size-6 text-pink-400 animate-pulse" />
                Sobre o Jogo
              </h3>
              <p className="text-indigo-100/90 font-bold text-sm leading-relaxed">
                {game.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 justify-start">
              {game.tags.map((tag, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xxs font-black uppercase tracking-wider">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Parental advisory warnings details */}
          <div className="p-8 bg-[#0F0A28]/90 border border-white/5 rounded-[28px] shadow-xl flex flex-col justify-between space-y-6 hover:border-white/10 transition-colors">
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-2.5 text-yellow-400">
                <ShieldAlert className="size-7 animate-bounce" />
                <h4 className="text-lg font-black uppercase tracking-wider leading-none" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  Aviso aos Pais
                </h4>
              </div>
              <p className="text-xs text-indigo-200/90 font-bold leading-relaxed">
                Este jogo é totalmente seguro, sem anúncios, sem chats com estranhos e sem riscos de compras. As crianças jogam em um ambiente 100% monitorado e protegido.
              </p>
            </div>

            <div className="border-t border-indigo-500/20 pt-4 text-xxs font-black text-indigo-300 uppercase tracking-widest leading-none flex items-center gap-1.5 text-left">
              <ShieldCheck className="size-4 text-emerald-400" />
              COPPA & GDPR COMPLIANT
            </div>
          </div>
        </div>

        {/* ── RELATED KIDS GAMES GRID ── */}
        <div className="space-y-6 pt-10 select-none">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-pulse">🌟</span>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Outras Aventuras Espaciais
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {relatedGames.map((relGame) => (
              <KidsGameCard 
                key={relGame.id}
                game={relGame}
              />
            ))}
          </div>
        </div>

      </div>

      {screenTimeLimit > 0 && timeRemaining === 0 && (
        <SleepLockScreen onOpenParentGate={handleOpenParentGate} />
      )}

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
    </div>
  );
}
