'use client';

import React, { useEffect, useState } from 'react';

interface AmbientLightingRendererProps {
  cssVariables: React.CSSProperties;
  quality: 'ultra' | 'high' | 'medium' | 'low' | 'off';
}

const AMBIENT_ANIMATION_STYLES = `
@keyframes ambientFadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
@keyframes ambientDriftDominant {
  0% { transform: translate(-50%, -5%) scale(1) rotate(0deg); opacity: 0.22; }
  33% { transform: translate(-47%, -2%) scale(1.06) rotate(3deg); opacity: 0.25; }
  66% { transform: translate(-53%, -7%) scale(0.95) rotate(-3deg); opacity: 0.20; }
  100% { transform: translate(-50%, -5%) scale(1) rotate(0deg); opacity: 0.22; }
}
@keyframes ambientDriftSecondary {
  0% { transform: translate(0%, -5%) scale(1) rotate(0deg); opacity: 0.08; }
  50% { transform: translate(-5%, 3%) scale(1.1) rotate(-6deg); opacity: 0.10; }
  100% { transform: translate(0%, -5%) scale(1) rotate(0deg); opacity: 0.08; }
}
@keyframes ambientDriftTertiary {
  0% { transform: translate(0%, 0%) scale(1) rotate(0deg); opacity: 0.06; }
  50% { transform: translate(4%, -4%) scale(1.08) rotate(5deg); opacity: 0.08; }
  100% { transform: translate(0%, 0%) scale(1) rotate(0deg); opacity: 0.06; }
}
`;

export function AmbientLightingRenderer({ cssVariables, quality }: AmbientLightingRendererProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (quality === 'off') return null;

  const isUltra = quality === 'ultra';
  const isHigh = quality === 'high' || isUltra;
  const isMedium = quality === 'medium' || isHigh;

  const respectReducedMotion = quality === 'low';

  return (
    <div 
      className="absolute top-0 inset-x-0 h-[650px] md:h-[800px] pointer-events-none overflow-hidden select-none z-0" 
      style={{
        ...cssVariables,
        opacity: mounted ? 1 : 0,
        animation: 'ambientFadeIn 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: AMBIENT_ANIMATION_STYLES }} />

      {/* 1. Base escura para legibilidade e conformidade de contraste WCAG */}
      <div className="absolute inset-0 bg-[#0A0C10]/95" />

      {/* 2. Gradiente radial dominante (topo centro) */}
      <div 
        className="absolute top-0 left-1/2 w-[140%] md:w-[100%] aspect-[16/9] max-h-[600px] rounded-full mix-blend-screen transition-all duration-[1200ms] cubic-bezier(0.16, 1, 0.3, 1)"
        style={{
          background: 'radial-gradient(circle, var(--ambient-dominant) 0%, transparent 70%)',
          filter: 'blur(var(--ambient-blur))',
          transform: 'translate(-50%, -5%)',
          animation: respectReducedMotion ? 'none' : 'ambientDriftDominant 22s ease-in-out infinite',
        }}
      />

      {/* 3. Gradiente complementar (deslocado à esquerda) */}
      {isMedium && (
        <div 
          className="absolute top-[-10%] left-[15%] w-[70%] aspect-[1/1] rounded-full mix-blend-screen transition-all duration-[1200ms] cubic-bezier(0.16, 1, 0.3, 1)"
          style={{
            background: 'radial-gradient(circle, var(--ambient-secondary) 0%, transparent 65%)',
            filter: 'blur(calc(var(--ambient-blur) * 1.2))',
            animation: respectReducedMotion ? 'none' : 'ambientDriftSecondary 28s ease-in-out infinite',
          }}
        />
      )}

      {/* 4. Gradiente complementar (deslocado à direita) */}
      {isHigh && (
        <div 
          className="absolute top-[10%] right-[10%] w-[60%] aspect-[16/10] rounded-full mix-blend-screen transition-all duration-[1200ms] cubic-bezier(0.16, 1, 0.3, 1)"
          style={{
            background: 'radial-gradient(ellipse at center, var(--ambient-tertiary) 0%, transparent 70%)',
            filter: 'blur(calc(var(--ambient-blur) * 1.4))',
            animation: respectReducedMotion ? 'none' : 'ambientDriftTertiary 35s ease-in-out infinite',
          }}
        />
      )}

      {/* 5. Concentrado glow atrás do poster */}
      {isUltra && (
        <div 
          className="absolute top-[8%] left-1/2 -translate-x-1/2 w-[40%] h-[240px] rounded-full opacity-[0.16] mix-blend-screen transition-all duration-[1500ms]"
          style={{
            background: 'radial-gradient(circle at center, var(--ambient-dominant) 0%, transparent 55%)',
            filter: 'blur(50px)',
          }}
        />
      )}

      {/* 6. Vinheta e gradiente de transição para o corpo escuro do layout */}
      <div className="absolute inset-x-0 bottom-0 h-[320px] bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/80 to-transparent" />
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0A0C10] to-transparent opacity-85" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0A0C10] to-transparent opacity-85" />
    </div>
  );
}
