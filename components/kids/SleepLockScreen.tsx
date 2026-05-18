import React from 'react';
import { Smile, Settings } from 'lucide-react';

interface SleepLockScreenProps {
  onOpenParentGate: () => void;
}

export function SleepLockScreen({ onOpenParentGate }: SleepLockScreenProps) {
  return (
    <div className="fixed inset-0 bg-black/95 z-[99999] flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-500">
      <div className="max-w-md w-full bg-[#0E062F] border-4 border-indigo-500/50 p-8 rounded-[40px] shadow-[0_0_50px_rgba(99,102,241,0.3)] relative">
        {/* Animated sleeping crescent moon */}
        <div className="w-24 h-24 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-6 relative border-2 border-indigo-400">
          <span className="absolute inset-0 rounded-full bg-indigo-400/20 animate-ping" />
          <Smile className="size-12 text-indigo-300" />
        </div>

        <h2 className="text-3xl font-black text-white tracking-tight uppercase" style={{ fontFamily: "'Baloo 2', cursive" }}>
          Hora de Descansar! 💤
        </h2>
        <p className="text-indigo-200 text-base mt-4 leading-relaxed font-bold">
          O limite de tempo da diversão acabou. É hora de desligar a tela e sonhar com as próximas aventuras!
        </p>

        <button
          onClick={onOpenParentGate}
          className="mt-8 px-6 py-3 rounded-full bg-white/10 border-2 border-white/20 hover:bg-white/20 text-white font-black text-sm uppercase tracking-wider transition-all flex items-center gap-2 mx-auto"
        >
          <Settings className="size-4" />
          <span>Controles Parentais</span>
        </button>
      </div>
    </div>
  );
}
