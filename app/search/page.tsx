'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { Navbar } from '@/components/Navbar';
import { useSearchParams, useRouter } from 'next/navigation';
import { MediaCard } from '@/components/Cards';
import { Search as SearchIcon, Film, Tv, Sword } from 'lucide-react';
import { getTmdbImage } from '@/lib/tmdb-service';

const TYPE_FILTERS = [
  { label: 'Tudo', value: '', icon: null },
  { label: 'Filmes', value: 'movie', icon: Film },
  { label: 'Séries', value: 'tv', icon: Tv },
  { label: 'Animes', value: 'anime', icon: Sword },
];

const SORT_FILTERS = [
  { label: 'Relevância', value: '' },
  { label: 'Populares', value: 'popular' },
  { label: 'Em Alta', value: 'trending' },
  { label: 'Recentes', value: 'recent' },
  { label: 'Mais Bem Avaliados', value: 'top_rated' },
];

function SearchResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qStr = searchParams.get('q')?.toLowerCase() || '';
  const typeStr = searchParams.get('type') || '';
  const sortStr = searchParams.get('sort') || '';
  const genreName = searchParams.get('genreName') || '';
  const genreId = searchParams.get('genre') || '';

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [wasCorrected, setWasCorrected] = useState(false);
  const [correctedQuery, setCorrectedQuery] = useState('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResults([]);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasMore(true);
    setWasCorrected(false);
    setCorrectedQuery('');
  }, [qStr, typeStr, sortStr, genreId]);

  useEffect(() => {
    const fetchResults = async () => {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);
      try {
        const url = new URL('/api/search', window.location.origin);
        if (qStr) url.searchParams.append('q', qStr);
        if (typeStr) url.searchParams.append('type', typeStr);
        if (sortStr) url.searchParams.append('sort', sortStr);
        if (genreId) url.searchParams.append('genre', genreId);
        url.searchParams.append('page', String(page));
        const res = await fetch(url.toString());
        const data = await res.json();
        if (data.success) {
          setWasCorrected(data.wasCorrected || false);
          setCorrectedQuery(data.correctedQuery || '');
          const newResults = data.results || [];
          const mapped = newResults.map((item: any) => {
            const isAnime = item.type === 'tv' && item.originalLanguage === 'ja' && (item.genreIds || []).includes(16);
            let subtitle = '';
            if (isAnime) subtitle = 'Anime';
            else if (item.type === 'movie') subtitle = 'Filme';
            else if (item.type === 'tv') subtitle = 'Série';

            return {
              ...item,
              subtitle,
              isAnime,
              imageUrl: getTmdbImage(item.posterPath || item.backdropPath, 'w185') || 'https://picsum.photos/seed/fallback/400/600',
              href: `/tmdb/${item.type}/${item.id}`,
            };
          });

          if (mapped.length < 20) setHasMore(false);
          if (page === 1) setResults(mapped);
          else setResults(prev => [...prev, ...mapped]);
        }
      } catch {
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };
    fetchResults();
  }, [qStr, typeStr, sortStr, genreId, page]);

  const setFilter = (key: string, val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set(key, val);
    else params.delete(key);
    router.push(`/search?${params.toString()}`);
  };

  const pageTitle = genreName
    ? `Explorar: ${genreName}`
    : qStr ? `Resultados para "${qStr}"`
    : typeStr === 'anime' ? 'Catálogo de Animes'
    : typeStr === 'movie' ? 'Catálogo de Filmes'
    : typeStr === 'tv' ? 'Catálogo de Séries'
    : 'Catálogo Completo';

  return (
    <div className="pt-28 px-6 sm:px-10 pb-20 max-w-7xl mx-auto w-full animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[32px] sm:text-[40px] font-display font-bold mb-2 tracking-tight text-white">
          {pageTitle}
        </h1>
        <p className="text-[#8A93A6] text-[15px] font-medium flex items-center gap-2">
          <SearchIcon className="size-4 opacity-50" />
          {loading ? 'Buscando conteúdos...' : results.length > 0 ? `${results.length}+ títulos encontrados` : 'Nenhum resultado encontrado'}
        </p>
      </div>

      {wasCorrected && qStr && (
        <div className="relative group mb-8 animate-in fade-in slide-in-from-top duration-300">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#8F44FF] to-pink-600 rounded-2xl blur opacity-20" />
          <div className="relative p-4 rounded-xl bg-white/5 border border-white/10 text-white/90 text-sm font-semibold flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-[#8F44FF] text-base animate-pulse">✨</span>
              <span>
                Entendemos seu termo! Mostrando resultados para{" "}
                <span className="font-extrabold text-yellow-300 font-display">
                  "{correctedQuery}"
                </span>{" "}
                <span className="text-white/40 font-normal">(Você digitou: "{qStr}")</span>
              </span>
            </div>
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set('q', correctedQuery);
                router.push(`/search?${params.toString()}`);
              }}
              className="px-4 py-2 rounded-full bg-[#8F44FF]/20 hover:bg-[#8F44FF]/30 text-[#B885FF] font-bold text-xs tracking-wider transition-all border border-[#8F44FF]/30 hover:scale-105"
            >
              Confirmar Termo 🍿
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Type filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {TYPE_FILTERS.map(f => {
            const Icon = f.icon;
            const active = typeStr === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setFilter('type', f.value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                  active
                    ? 'bg-[#8F44FF] border-[#8F44FF] text-white shadow-[0_0_15px_rgba(143,68,255,0.4)]'
                    : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/20'
                }`}
              >
                {Icon && <Icon className="size-3.5" />}
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Sort filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {SORT_FILTERS.map(f => {
            const active = sortStr === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setFilter('sort', f.value)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                  active
                    ? 'bg-white/15 border-white/30 text-white'
                    : 'bg-transparent border-white/5 text-white/40 hover:text-white/70 hover:border-white/15'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results */}
      {loading && page === 1 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
          {[...Array(18)].map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
            {results.map((item) => (
              <div key={item.id} className="w-full">
                <MediaCard
                  title={item.title}
                  subtitle={item.subtitle || ''}
                  slug={item.slug || ''}
                  href={item.href}
                  imageUrl={item.imageUrl || 'https://picsum.photos/seed/fallback/400/600'}
                  className="w-full"
                  theme={item.isAnime ? 'anime' : 'default'}
                />
              </div>
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center mt-16 pb-8">
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={loadingMore}
                className="bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 disabled:opacity-50 text-white px-10 py-3.5 rounded-full font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
              >
                {loadingMore ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Carregando...
                  </>
                ) : 'Carregar Mais'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center py-32 flex-col gap-6 text-center animate-in fade-in duration-500">
          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-2">
            <SearchIcon className="size-10 text-[#8A93A6] opacity-50" />
          </div>
          <div>
            <p className="text-[24px] font-display font-bold text-white mb-2">Nenhum resultado encontrado</p>
            <p className="text-[#8A93A6] text-[16px] max-w-md mx-auto">Tente buscar por termos diferentes ou explore nosso catálogo completo.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-[#050510] text-white flex">
      <div className="flex-1 flex flex-col w-full relative bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#8F44FF]/5 via-[#050510] to-[#050510]">
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
        <div className="flex-1 relative">
        <Suspense fallback={null}>
          <SearchResults />
        </Suspense>
        </div>
      </div>
    </main>
  );
}
