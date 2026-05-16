'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export function BackButton() {
  const router = useRouter();
  
  return (
    <button 
      onClick={() => router.back()} 
      className="bg-[#131520] hover:bg-[#1A1D2D] border border-white/10 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
    >
      <ArrowLeft className="size-4" /> Voltar
    </button>
  );
}
