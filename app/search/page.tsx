'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { Navbar } from '@/components/Navbar';
import { useSearchParams } from 'next/navigation';
import { collection, getDocs, query, orderBy, where, or } from 'firebase/firestore/lite';
import { db } from '@/lib/firebase';
import { TrendingCard, MediaCard } from '@/components/Cards';
import { Search as SearchIcon } from 'lucide-react';

function SearchResults() {
  const searchParams = useSearchParams();
  const qStr = searchParams.get('q')?.toLowerCase() || '';
  const typeStr = searchParams.get('type') || '';
  const genreId = searchParams.get('genre') || '';
  const genreName = searchParams.get('genreName') || '';

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResults([]);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasMore(true);
  }, [qStr, typeStr, genreId]);

  useEffect(() => {
    const fetchResults = async () => {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const url = new URL('/api/search', window.location.origin);
        if (qStr) url.searchParams.append('q', qStr);
        if (typeStr) url.searchParams.append('type', typeStr);
        url.searchParams.append('page', String(page));

        const res = await fetch(url.toString());
        const data = await res.json();

        if (data.success) {
          const newResults = data.results;
          if (newResults.length < 20) setHasMore(false);
          
          if (page === 1) {
            setResults(newResults);
          } else {
            setResults(prev => [...prev, ...newResults]);
          }
        }
      } catch (error) {
        console.error("Search error: ", error);
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchResults();
  }, [qStr, typeStr, genreId, page]);

  return (
    <div className="pt-28 px-6 sm:px-10 pb-20 max-w-7xl mx-auto w-full animate-in fade-in duration-700">
      <div className="mb-10">
        <h1 className="text-[32px] sm:text-[40px] font-display font-bold mb-2 tracking-tight text-white flex items-center gap-3">
           {genreName 
             ? `Explorar: ${genreName}` 
             : (qStr || typeStr) ? `Resultados ${qStr ? `para "${qStr}"` : ''} ${typeStr && !genreName ? `em ${typeStr === 'anime' ? 'Animes' : typeStr === 'tv' ? 'Séries' : 'Filmes'}` : ''}` : 'Catálogo Completo'}
        </h1>
        <p className="text-[#8A93A6] text-[16px] font-medium flex items-center gap-2">
           <SearchIcon className="size-4 opacity-50" />
           {results.length > 0 ? 'Encontramos opções para sua busca.' : 'Buscando opções...'}
        </p>
      </div>

      {loading && page === 1 ? (
        <div className="flex flex-col items-center justify-center py-32 text-[#8A93A6]">
           <div className="w-12 h-12 rounded-full border-4 border-[#8F44FF] border-t-transparent animate-spin mb-4"></div>
           <span className="font-medium">Procurando conteúdos...</span>
        </div>
      ) : results.length > 0 ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {results.map((item, index) => (
              <div key={item.id} className="w-full">
                <MediaCard 
                  title={item.title}
                  subtitle=""
                  slug={item.slug || ''}
                  href={item.href}
                  imageUrl={item.imageUrl}
                  className="w-full"
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
                     <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
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
            <p className="text-[#8A93A6] text-[16px] max-w-md mx-auto">Tente buscar por termos diferentes, verifique a ortografia ou navegue pelas nossas categorias sugeridas.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-[#050510] text-white flex overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full overflow-y-auto h-screen scrollbar-hide relative bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#8F44FF]/5 via-[#050510] to-[#050510]">
        <Suspense fallback={<div />}>
          <Navbar />
          <div className="flex-1 relative">
            <SearchResults />
          </div>
        </Suspense>
      </div>
    </main>
  );
}
