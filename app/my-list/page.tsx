'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { TrendingCard } from '@/components/Cards';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { Bookmark, ListVideo } from 'lucide-react';

function MyListContent() {
  const { watchlist } = useWatchlist();

  return (
    <div className="pt-28 px-6 sm:px-10 pb-20 max-w-7xl mx-auto w-full animate-in fade-in duration-700">
      <div className="mb-10">
        <h1 className="text-[32px] sm:text-[40px] font-display font-bold mb-2 tracking-tight text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#8F44FF]/20 flex items-center justify-center">
             <Bookmark className="size-5 fill-[#8F44FF] text-[#8F44FF]" />
          </div>
          Minha Lista
        </h1>
        <p className="text-[#8A93A6] text-[16px] font-medium flex items-center gap-2">
          {`Você salvou ${watchlist.length} conteúdos para assistir mais tarde.`}
        </p>
      </div>

      {watchlist.length > 0 ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {watchlist.map((item, index) => (
              <div key={item.id} className="w-full">
                <TrendingCard 
                  rank={index + 1}
                  title={item.title}
                  slug={item.title} // Used as slug since we don't have it natively
                  imageUrl={item.posterUrl}
                  href={`/tmdb/${item.type}/${item.id}`}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-32 flex-col gap-6 text-center animate-in fade-in duration-500">
          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-2">
             <ListVideo className="size-10 text-[#8A93A6] opacity-50" />
          </div>
          <div>
            <p className="text-[24px] font-display font-bold text-white mb-2">Sua lista está vazia</p>
            <p className="text-[#8A93A6] text-[16px] max-w-md mx-auto">Navegue pelo catálogo e adicione os filmes e séries que você deseja assistir.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyListPage() {
  return (
    <main className="min-h-screen bg-[#050510] text-white flex">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-[80px] w-[calc(100%-80px)] relative bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#8F44FF]/5 via-[#050510] to-[#050510]">
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
        <div className="flex-1 relative">
          <MyListContent />
        </div>
      </div>
    </main>
  );
}
