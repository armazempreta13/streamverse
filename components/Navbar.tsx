'use client';

import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, LogOut, Settings, Star, Bookmark, Smile, Clock, Lock, Unlock, Trash2, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { getTmdbImage } from '@/lib/tmdb-service';

const menuItems = [
  { name: 'Início', href: '/' },
  { name: 'Filmes', href: '/movies' },
  { name: 'Séries', href: '/series' },
  { name: 'Animes', href: '/animes' },
  { name: 'Kids 🧒', href: '/kids' },
];

const movieGenres = [
  { id: 28, name: 'Ação' },
  { id: 12, name: 'Aventura' },
  { id: 16, name: 'Animação' },
  { id: 35, name: 'Comédia' },
  { id: 80, name: 'Crime' },
  { id: 18, name: 'Drama' },
  { id: 14, name: 'Fantasia' },
  { id: 27, name: 'Terror' },
  { id: 878, name: 'Ficção Científica' },
  { id: 53, name: 'Suspense' },
];

const tvGenres = [
  { id: 10759, name: 'Ação e Aventura' },
  { id: 16, name: 'Animação' },
  { id: 35, name: 'Comédia' },
  { id: 80, name: 'Crime' },
  { id: 18, name: 'Drama' },
  { id: 9648, name: 'Mistério' },
  { id: 10765, name: 'Ficção Científica' },
  { id: 10766, name: 'Novela' },
];

export function Navbar() {
  const [activeItem, setActiveItem] = React.useState('Início');
  const { user, signIn, signOut, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get('q') || '';
  const typeParam = searchParams.get('type');
  const [searchQuery, setSearchQuery] = useState(currentQuery);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileGenres, setShowMobileGenres] = useState(false); // Mobile genres dropdown state
  const searchRef = React.useRef<HTMLDivElement>(null);

  // Kids Mode & Parental Controls States
  const [isKidsActive, setIsKidsActive] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const [gateQuestion, setGateQuestion] = useState({ num1: 0, num2: 0, answer: 0 });
  const [gateInput, setGateInput] = useState('');
  const [gateError, setGateError] = useState(false);
  const [gateAction, setGateAction] = useState<'disable' | 'settings'>('disable');
  
  const [showDashboard, setShowDashboard] = useState(false);
  const [kidsRating, setKidsRating] = useState('G');
  const [screenTimeLimit, setScreenTimeLimit] = useState(0); // minutes, 0 = unlimited
  const [timeRemaining, setTimeRemaining] = useState(0); // seconds
  const [isScreenLocked, setIsScreenLocked] = useState(false);
  const [kidsHistory, setKidsHistory] = useState<any[]>([]);
  const [searchBlockQuery, setSearchBlockQuery] = useState('');
  const [searchBlockResults, setSearchBlockResults] = useState<any[]>([]);
  const [blockedTitles, setBlockedTitles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'geral' | 'bloquear' | 'historico'>('geral');

  // Initial load - adult navbar always cleans kids mode cookie to avoid catalog blocking
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Automatically disable kids mode when entering adult main sections
    localStorage.setItem('streamverse_kids_active', 'false');
    document.cookie = "kids_active=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
    setIsKidsActive(false);
    
    // Load config
    const rating = localStorage.getItem('streamverse_kids_rating') || 'G';
    setKidsRating(rating);
    document.cookie = `kids_rating=${rating}; path=/; max-age=31536000; SameSite=Lax`;

    const blocked = JSON.parse(localStorage.getItem('streamverse_kids_blocked') || '[]');
    setBlockedTitles(blocked);

    const history = JSON.parse(localStorage.getItem('streamverse_kids_history') || '[]');
    setKidsHistory(history);

    const limit = Number(localStorage.getItem('streamverse_kids_time_limit') || '0');
    setScreenTimeLimit(limit);

    if (limit > 0 && isKidsActive) {
      const savedRemaining = localStorage.getItem('streamverse_kids_time_remaining');
      const startSecs = savedRemaining ? Number(savedRemaining) : limit * 60;
      setTimeRemaining(startSecs);
      if (startSecs <= 0) {
        setIsScreenLocked(true);
      }
    }
  }, []);

  // Screen Time Countdown Interval
  useEffect(() => {
    if (!isKidsActive || screenTimeLimit <= 0 || isScreenLocked) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        const next = Math.max(prev - 1, 0);
        localStorage.setItem('streamverse_kids_time_remaining', String(next));
        if (next <= 0) {
          setIsScreenLocked(true);
          clearInterval(timer);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isKidsActive, screenTimeLimit, isScreenLocked]);

  // Generate Math Gate
  const triggerMathGate = (action: 'disable' | 'settings') => {
    const num1 = Math.floor(Math.random() * 8) + 2; // 2-9
    const num2 = Math.floor(Math.random() * 8) + 2; // 2-9
    setGateQuestion({ num1, num2, answer: num1 * num2 });
    setGateInput('');
    setGateError(false);
    setGateAction(action);
    setShowGate(true);
  };

  const handleGateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(gateInput) === gateQuestion.answer) {
      setShowGate(false);
      setGateError(false);
      
      if (gateAction === 'disable') {
        // Disable Kids Mode
        setIsKidsActive(false);
        setIsScreenLocked(false);
        localStorage.setItem('streamverse_kids_active', 'false');
        document.cookie = "kids_active=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
        window.location.reload();
      } else if (gateAction === 'settings') {
        setShowDashboard(true);
      }
    } else {
      setGateError(true);
      setGateInput('');
    }
  };

  const handleEnableKidsMode = () => {
    setIsKidsActive(true);
    localStorage.setItem('streamverse_kids_active', 'true');
    document.cookie = "kids_active=true; path=/; max-age=31536000; SameSite=Lax";
    
    // Set time remaining to limit if limit is active
    if (screenTimeLimit > 0) {
      const secs = screenTimeLimit * 60;
      setTimeRemaining(secs);
      localStorage.setItem('streamverse_kids_time_remaining', String(secs));
    }
    
    window.location.reload();
  };

  // Parental Dashboard updates
  const updateRating = (r: string) => {
    setKidsRating(r);
    localStorage.setItem('streamverse_kids_rating', r);
    document.cookie = `kids_rating=${r}; path=/; max-age=31536000; SameSite=Lax`;
    window.location.reload();
  };

  const updateScreenTimeLimit = (mins: number) => {
    setScreenTimeLimit(mins);
    localStorage.setItem('streamverse_kids_time_limit', String(mins));
    const secs = mins * 60;
    setTimeRemaining(secs);
    localStorage.setItem('streamverse_kids_time_remaining', String(secs));
    if (mins === 0) {
      setIsScreenLocked(false);
    }
  };

  const handleBlockTitle = (item: any) => {
    const nextBlocked = [...blockedTitles, { id: item.id, title: item.title || item.name, type: item.type }];
    setBlockedTitles(nextBlocked);
    localStorage.setItem('streamverse_kids_blocked', JSON.stringify(nextBlocked));
    setSearchBlockResults([]);
    setSearchBlockQuery('');
  };

  const handleUnblockTitle = (id: number) => {
    const nextBlocked = blockedTitles.filter(t => t.id !== id);
    setBlockedTitles(nextBlocked);
    localStorage.setItem('streamverse_kids_blocked', JSON.stringify(nextBlocked));
  };

  const handleClearHistory = () => {
    setKidsHistory([]);
    localStorage.setItem('streamverse_kids_history', JSON.stringify([]));
  };

  // Block search query logic inside Parental Panel
  useEffect(() => {
    if (searchBlockQuery.trim().length < 3) {
      setSearchBlockResults([]);
      return;
    }
    const delay = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchBlockQuery.trim())}`);
        const data = await res.json();
        if (data.success) {
          setSearchBlockResults(data.results.slice(0, 5));
        }
      } catch (err) {
        console.error(err);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [searchBlockQuery]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchQuery(currentQuery);
  }, [currentQuery]);

  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      const delayDebounce = setTimeout(async () => {
        setIsSearching(true);
        setShowSuggestions(true);
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`);
          const data = await res.json();
          if (data.success) {
            const mapped = (data.results || []).slice(0, 6).map((item: any) => ({
              id: item.id,
              title: item.title,
              type: item.type,
              imageUrl: getTmdbImage(item.posterPath || item.backdropPath, 'w185') || 'https://picsum.photos/seed/1/400/600',
              href: `/tmdb/${item.type}/${item.id}`,
              score: item.voteAverage ? item.voteAverage.toFixed(1) : undefined,
              date: item.releaseDate || item.firstAirDate,
            }));
            setSuggestions(mapped);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsSearching(false);
        }
      }, 300);
      return () => clearTimeout(delayDebounce);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (pathname === '/') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveItem('Início');
    } else if (pathname === '/movies') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveItem('Filmes');
    } else if (pathname === '/series') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveItem('Séries');
    } else if (pathname === '/animes') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveItem('Animes');
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveItem('');
    }
  }, [pathname, typeParam]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        router.push('/');
      }
    }
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-[200]">
      {/* Gradiente de fundo super suave para fusão com a Hero, sem linha marcada */}
      <div 
        className="absolute top-0 left-0 right-0 h-[250px] pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(5,5,16,0.95) 0%, rgba(5,5,16,0.7) 25%, rgba(5,5,16,0.3) 55%, rgba(5,5,16,0) 100%)'
        }}
      />
      <div className="relative w-full h-[80px] flex items-center justify-between px-6 sm:px-10 pt-4">
        {/* Left Side: Logo & Navigation */}
        <div className="flex items-center gap-6 lg:gap-12">
          {/* Logo */}
          <Link href="/" className="flex items-center cursor-pointer hover:opacity-80 transition-opacity w-[120px] md:w-[160px] shrink-0">
            <Image
              src="/logo.png"
              alt="StreamVerse"
              width={160}
              height={44}
              className="h-7 md:h-9 w-auto object-contain"
              priority
            />
          </Link>

          {/* Central Menu */}
          <nav className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setActiveItem(item.name)}
                className={clsx(
                  "text-[14px] font-bold transition-all relative py-1",
                  activeItem === item.name
                    ? "text-white after:content-[''] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-1/2 after:h-[2px] after:bg-[#8F44FF] after:rounded-full after:shadow-[0_0_8px_#8F44FF]"
                    : "text-[#8A93A6] hover:text-white"
                )}
              >
                {item.name}
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin" className="text-[14px] font-bold text-[#A661FF] hover:text-white transition-colors relative py-1 drop-shadow-[0_0_8px_rgba(166,97,255,0.5)]">
                Admin
              </Link>
            )}
            <div className="relative group/categorias py-1">
              <button className="flex items-center gap-1.5 text-[#8A93A6] hover:text-white transition-colors text-[14px] font-bold">
                Categorias <ChevronDown className="size-3.5" />
              </button>
              
              {/* Dropdown de categorias (Mega Dropdown de duas colunas) */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[420px] bg-[#0A0A16]/95 backdrop-blur-xl border border-white/10 rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.6)] opacity-0 invisible group-hover/categorias:opacity-100 group-hover/categorias:visible transition-all duration-300 grid grid-cols-2 gap-4 p-5 z-50">
                {/* Filmes */}
                <div>
                  <h3 className="text-[10px] font-black tracking-widest text-[#8F44FF] uppercase mb-2 px-3 opacity-90">Filmes</h3>
                  <div className="flex flex-col gap-0.5 max-h-[280px] overflow-y-auto custom-scrollbar">
                    {movieGenres.map(g => (
                      <Link 
                        key={g.id} 
                        href={`/search?type=movie&genre=${g.id}&genreName=${g.name}`}
                        className="px-3 py-1.5 text-[13px] font-bold text-[#8A93A6] hover:text-white rounded-lg hover:bg-white/5 transition-all flex items-center gap-2 group/item"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8F44FF] opacity-0 group-hover/item:opacity-100 transition-all scale-50 group-hover/item:scale-100" />
                        {g.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Séries */}
                <div className="border-l border-white/5 pl-4">
                  <h3 className="text-[10px] font-black tracking-widest text-[#FF3366] uppercase mb-2 px-3 opacity-90">Séries</h3>
                  <div className="flex flex-col gap-0.5 max-h-[280px] overflow-y-auto custom-scrollbar">
                    {tvGenres.map(g => (
                      <Link 
                        key={g.id} 
                        href={`/search?type=tv&genre=${g.id}&genreName=${g.name}`}
                        className="px-3 py-1.5 text-[13px] font-bold text-[#8A93A6] hover:text-white rounded-lg hover:bg-white/5 transition-all flex items-center gap-2 group/item"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF3366] opacity-0 group-hover/item:opacity-100 transition-all scale-50 group-hover/item:scale-100" />
                        {g.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 sm:gap-6 w-auto md:w-[300px] justify-end">
        <Link 
          href="/my-list"
          className="hidden sm:flex items-center gap-2 text-[#8A93A6] hover:text-white transition-colors"
          title="Minha Lista"
        >
          <Bookmark className="size-5" />
        </Link>
        {/* Search Bar - hidden on small screens, click icon to open instead? for now keep it responsive */}
        <div ref={searchRef} className="relative group hidden sm:block">
          <div className="flex items-center bg-[#0A0A16]/80 backdrop-blur-md border border-white/10 hover:border-white/20 transition-colors rounded-full px-4 py-2 w-48 lg:w-64 focus-within:border-[#8F44FF] focus-within:shadow-[0_0_15px_rgba(143,68,255,0.2)]">
            <Search className={clsx("size-[15px] text-[#8A93A6] mr-2", isSearching && "animate-pulse")} />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => searchQuery.trim().length > 2 && setShowSuggestions(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Buscar..."
              className="bg-transparent border-none outline-none text-[13px] text-white w-full placeholder:text-[#8A93A6] font-medium"
            />
          </div>

          {/* Search Suggestions Popover */}
          {showSuggestions && (suggestions.length > 0 || isSearching) && (
            <div className="absolute top-full mt-3 w-[380px] right-0 bg-[#050510]/95 backdrop-blur-2xl border border-white/10 rounded-[24px] shadow-[0_30px_90px_rgba(0,0,0,0.9)] overflow-hidden z-[300] animate-in fade-in slide-in-from-top-3 duration-500">
              <div className="p-3">
                {isSearching && suggestions.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-8 h-8 rounded-full border-2 border-[#8F44FF] border-t-transparent animate-spin mx-auto mb-4" />
                    <p className="text-[13px] font-medium text-[#8A93A6]">Explorando o multiverso...</p>
                  </div>
                ) : (
                  <>
                    <div className="px-4 py-3 flex items-center justify-between border-b border-white/5 mb-3">
                      <span className="text-[11px] font-black text-[#5C6370] uppercase tracking-[0.2em]">Sugestões</span>
                      {isSearching && <div className="w-3 h-3 rounded-full border-2 border-[#8F44FF] border-t-transparent animate-spin" />}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {suggestions.map((item) => (
                        <Link 
                          key={item.id}
                          href={item.href || '#'}
                          onClick={() => setShowSuggestions(false)}
                          className="flex items-center gap-4 p-2.5 hover:bg-white/[0.03] rounded-2xl transition-all group relative border border-transparent hover:border-white/5"
                        >
                          <div className="w-[52px] h-[74px] relative rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-lg">
                            <Image 
                              src={item.imageUrl} 
                              alt={item.title} 
                              fill 
                              className="object-cover group-hover:scale-110 transition-transform duration-700" 
                              unoptimized
                            />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-[14px] font-bold text-white/90 truncate group-hover:text-white transition-colors tracking-tight">{item.title}</span>
                            <div className="flex items-center gap-2.5 mt-1.5">
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-[#8A93A6] font-black uppercase tracking-wider border border-white/5">
                                {item.type === 'movie' ? 'Filme' : 'Série'}
                              </span>
                              {item.score && (
                                <div className="flex items-center gap-1">
                                  <Star className="size-2.5 text-[#FBBF24] fill-[#FBBF24]" />
                                  <span className="text-[11px] text-white/60 font-bold tabular-nums">{item.score}</span>
                                </div>
                              )}
                              {item.date && (
                                <span className="text-[10px] text-[#5C6370] font-medium">{item.date.substring(0,4)}</span>
                              )}
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                             <ChevronDown className="size-4 text-[#8F44FF] rotate-[-90deg]" />
                          </div>
                        </Link>
                      ))}
                    </div>
                    <button 
                      onClick={() => {
                        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                        setShowSuggestions(false);
                      }}
                      className="w-full mt-3 p-4 text-center text-[13px] font-black text-white hover:text-[#A661FF] bg-white/[0.02] hover:bg-white/[0.04] transition-all rounded-xl border border-white/5 uppercase tracking-[0.15em]"
                    >
                      Ver todos os resultados
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        <button 
          onClick={() => setShowMobileMenu(true)}
          className="md:hidden text-[#8A93A6] hover:text-white relative transition-colors p-2 -mr-2"
        >
            <div className="flex flex-col gap-1.5 items-end justify-center w-6 h-6">
              <span className="w-5 h-[2px] bg-current rounded-full" />
              <span className="w-4 h-[2px] bg-current rounded-full" />
              <span className="w-6 h-[2px] bg-current rounded-full" />
            </div>
        </button>

        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <div className="fixed inset-0 z-[500] flex md:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileMenu(false)} />
            <div className="relative ml-auto w-[280px] h-full bg-[#0A0A16] border-l border-white/10 shadow-2xl flex flex-col p-6 animate-in slide-in-from-right-full duration-300">
              <div className="flex items-center justify-between mb-8">
                <span className="text-sm font-bold text-[#8A93A6] uppercase tracking-widest">Menu</span>
                <button onClick={() => setShowMobileMenu(false)} className="p-2 -mr-2 text-white/60 hover:text-white">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar -mx-6 px-6 pb-6 overscroll-contain">
                {/* Mobile Search */}
                <div className="relative mb-8 mt-2">
                  <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-[#8F44FF]">
                    <Search className="size-[18px] text-[#8A93A6] mr-2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch(e);
                          setShowMobileMenu(false);
                        }
                      }}
                      placeholder="Buscar..."
                      className="bg-transparent border-none outline-none text-[15px] text-white w-full placeholder:text-[#8A93A6]"
                    />
                  </div>
                </div>

                {/* Mobile Navigation Links */}
                <nav className="flex flex-col gap-2">
                  {menuItems.map((item) => {
                    const isActive = activeItem === item.name;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => { setActiveItem(item.name); setShowMobileMenu(false); }}
                        className={clsx(
                          "text-[18px] font-bold px-4 py-3 rounded-xl transition-all",
                          isActive
                            ? "bg-[#8F44FF]/20 text-[#A661FF]"
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setShowMobileMenu(false)} className="text-[18px] font-bold px-4 py-3 rounded-xl text-[#A661FF] hover:bg-white/5 transition-all mt-4 border border-[#8F44FF]/30">
                      Admin
                    </Link>
                  )}
                  
                  {/* Mobile Categories Accordion */}
                  <div className="flex flex-col">
                    <button
                      onClick={() => setShowMobileGenres(!showMobileGenres)}
                      className="flex items-center justify-between text-[18px] font-bold px-4 py-3 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition-all w-full text-left"
                    >
                      <span>Categorias</span>
                      <ChevronDown className={clsx("size-4 transition-transform duration-300", showMobileGenres && "rotate-180")} />
                    </button>

                    {showMobileGenres && (
                      <div className="flex flex-col pl-4 mt-1 gap-2.5 border-l border-white/10 ml-6 animate-in slide-in-from-top-2 duration-200">
                        {/* Filmes subheader */}
                        <div className="text-[10px] font-black tracking-widest text-[#8F44FF]/80 uppercase mt-1">Filmes</div>
                        <div className="grid grid-cols-2 gap-2">
                          {movieGenres.slice(0, 6).map((g) => (
                            <Link
                              key={g.id}
                              href={`/search?type=movie&genre=${g.id}&genreName=${g.name}`}
                              onClick={() => setShowMobileMenu(false)}
                              className="text-[13px] font-semibold text-white/50 hover:text-white py-1 transition-colors"
                            >
                              {g.name}
                            </Link>
                          ))}
                        </div>

                        {/* Séries subheader */}
                        <div className="text-[10px] font-black tracking-widest text-[#FF3366]/80 uppercase mt-2">Séries</div>
                        <div className="grid grid-cols-2 gap-2">
                          {tvGenres.slice(0, 6).map((g) => (
                            <Link
                              key={g.id}
                              href={`/search?type=tv&genre=${g.id}&genreName=${g.name}`}
                              onClick={() => setShowMobileMenu(false)}
                              className="text-[13px] font-semibold text-white/50 hover:text-white py-1 transition-colors"
                            >
                              {g.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Link
                    href="/my-list"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 text-[18px] font-bold px-4 py-3 rounded-xl text-[#8A93A6] hover:bg-white/5 hover:text-white transition-all"
                  >
                    <Bookmark className="size-5" />
                    Minha Lista
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        <NotificationDropdown />

        {/* User Profile / Auth */}
        {user && (
          <div className="relative group/menu flex items-center gap-2 cursor-pointer transition-transform hover:scale-105">
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/10 group-hover/menu:border-[#8F44FF] relative transition-colors">
              <Image
                src={user.photoURL || "https://picsum.photos/seed/avatar1/100/100"}
                alt="Avatar"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <ChevronDown className="size-3.5 text-[#8A93A6] group-hover/menu:text-white transition-colors" />

            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#0A0A16]/95 backdrop-blur-xl border border-white/10 rounded-[16px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all flex flex-col overflow-hidden py-2">
              <div className="px-5 py-3 border-b border-white/10 mb-2">
                <p className="text-[14px] font-bold text-white truncate">{user.displayName || 'Usuário'}</p>
                <p className="text-[12px] text-[#8A93A6] truncate">{user.email}</p>
              </div>
              <button 
                onClick={signOut}
                className="flex items-center gap-3 px-5 py-2.5 text-[13px] font-medium text-[#8A93A6] hover:text-[#EF4444] hover:bg-white/5 transition-colors text-left"
              >
                <LogOut className="size-4" />
                Sair da conta
              </button>
            </div>
          </div>
        )}
      </div>
      </div>
    </header>
  );
}
