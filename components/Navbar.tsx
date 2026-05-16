'use client';

import React, { useState, useEffect } from 'react';
import { Search, Bell, PlayCircle, ChevronDown, LogOut, Settings, Star } from 'lucide-react';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const menuItems = [
  { name: 'Início', href: '/' },
  { name: 'Filmes', href: '/movies' },
  { name: 'Séries', href: '/series' },
  { name: 'Animes', href: '/animes' },
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
  const [genres, setGenres] = useState<{id: number, name: string}[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchQuery(currentQuery);
  }, [currentQuery]);

  useEffect(() => {
    import('@/lib/tmdb-service').then(({ getGenres }) => {
      getGenres('movie').then(data => setGenres(data.slice(0, 20)));
    });
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      const delayDebounce = setTimeout(async () => {
        setIsSearching(true);
        setShowSuggestions(true);
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`);
          const data = await res.json();
          if (data.success) {
            setSuggestions(data.results.slice(0, 6));
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsSearching(false);
        }
      }, 300);
      return () => clearTimeout(delayDebounce);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (pathname === '/') {
      setActiveItem('Início');
    } else if (pathname === '/movies') {
      setActiveItem('Filmes');
    } else if (pathname === '/series') {
      setActiveItem('Séries');
    } else if (pathname === '/animes') {
      setActiveItem('Animes');
    } else {
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
    <header className="absolute top-0 left-0 right-0 h-[80px] flex items-center justify-between px-6 sm:px-10 z-[200] bg-gradient-to-b from-[#050510]/80 to-transparent backdrop-blur-sm pt-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 group cursor-pointer w-[200px] hover:opacity-80 transition-opacity">
        <div className="w-[32px] h-[32px] rounded-[10px] border-[1.5px] border-[#8F44FF] flex items-center justify-center bg-[#8F44FF]/10 shadow-[0_0_15px_rgba(143,68,255,0.3)]">
          <PlayCircle className="size-4.5 text-[#8F44FF] fill-[#8F44FF]/20" />
        </div>
        <div className="flex font-display font-bold tracking-tight text-[22px]">
          <span className="text-white">Stream</span>
          <span className="text-[#8F44FF]">Verse</span>
        </div>
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
          
          {/* Dropdown de categorias */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 bg-[#0A0A16]/95 backdrop-blur-xl border border-white/10 rounded-[16px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] opacity-0 invisible group-hover/categorias:opacity-100 group-hover/categorias:visible transition-all flex flex-col overflow-hidden py-2 z-50">
             {genres.map(g => (
               <Link 
                 key={g.id} 
                 href={`/search?type=movie&genre=${g.id}&genreName=${g.name}`}
                 className="px-5 py-2.5 text-[13px] font-medium text-[#8A93A6] hover:text-white hover:bg-white/5 transition-colors"
               >
                 {g.name}
               </Link>
             ))}
          </div>
        </div>
      </nav>

      {/* Right Actions */}
      <div className="ml-auto flex items-center gap-4 sm:gap-6 w-auto md:w-[300px] justify-end">
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
        <button className="sm:hidden text-[#8A93A6] hover:text-white relative transition-colors">
            <Search className="size-[20px]" />
        </button>

        {/* Notifications */}
        <button className="relative text-[#8A93A6] hover:text-white transition-colors hover:scale-110 active:scale-95">
          <Bell className="size-[20px]" />
          <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#8F44FF]"></span>
        </button>

        {/* User Profile / Auth */}
        {user ? (
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
        ) : (
          <button 
            onClick={signIn}
            className="text-[13px] font-bold bg-[#8F44FF] hover:bg-[#A661FF] text-white px-5 py-2 rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(143,68,255,0.3)]"
          >
            Entrar
          </button>
        )}
      </div>
    </header>
  );
}
