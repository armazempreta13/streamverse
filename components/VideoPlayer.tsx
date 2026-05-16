'use client';

import React, { useState } from 'react';
import { Play, Info } from 'lucide-react';
import Image from 'next/image';
import { SaveWatchProgress } from './SaveWatchProgress';

interface VideoPlayerProps {
  id: string;
  type: string;
  title: string;
  posterUrl: string;
  videoUrl: string;
  backdropUrl?: string;
  theme?: 'default' | 'anime';
}

export function VideoPlayer({ id, type, title, posterUrl, videoUrl, backdropUrl, theme = 'default' }: VideoPlayerProps) {
  const [hasStarted, setHasStarted] = useState(false);

  return (
    <div className="lg:col-span-8 xl:col-span-9 flex flex-col relative z-[110]">
      <div className="w-full aspect-video bg-[#050510] rounded-xl overflow-hidden shadow-2xl border border-white/5 relative group">
        {!hasStarted ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            {/* Background Backdrop for player before start */}
            {backdropUrl && (
              <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-700">
                <Image src={backdropUrl} alt={title} fill className="object-cover" unoptimized />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-transparent to-transparent" />
              </div>
            )}
            
            {/* Play Button Overlay */}
            <button 
              onClick={() => setHasStarted(true)}
              className={`relative z-30 w-20 h-20 rounded-full flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all group/btn ${
                theme === 'anime' ? 'bg-[#FF3366] shadow-[0_0_50px_rgba(255,51,102,0.6)]' : 'bg-[#8F44FF] shadow-[0_0_50px_rgba(143,68,255,0.6)]'
              }`}
            >
              <Play className="size-8 fill-white ml-1 group-hover/btn:scale-110 transition-transform" />
              <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping opacity-20" />
            </button>
          </div>
        ) : (
          <>
            <SaveWatchProgress id={id} type={type} title={title} posterUrl={posterUrl} />
            <iframe 
              src={videoUrl}
              className="w-full h-full border-none relative z-10"
              allowFullScreen
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            />
          </>
        )}
      </div>
      
      
      <div className="flex flex-col gap-3 mt-4">
        <div className="bg-[#131520] border border-amber-500/20 px-6 py-4 rounded-xl flex items-start sm:items-center gap-4">
          <div className="w-5 h-5 shrink-0 rounded-full bg-amber-500/20 flex items-center justify-center mt-0.5 sm:mt-0">
            <span className="text-amber-500 font-black text-xs">!</span>
          </div>
          <p className="text-sm text-[#8A93A6] leading-relaxed">
            <strong className="text-amber-500">AVISO SOBRE ANÚNCIOS:</strong> O player acima é fornecido por servidores de terceiros. Nós não temos controle sobre pop-ups ou anúncios que possam abrir ao clicar. <strong className="text-white">Recomendamos fechar as novas guias imediatamente e retornar ao player.</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
