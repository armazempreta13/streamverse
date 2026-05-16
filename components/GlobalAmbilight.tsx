'use client';

import { siteConfig } from '@/config/site';
import React, { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

const AMBIENT_STYLES = `
@keyframes slowDrift1 {
  0%   { transform: translate(0, 0) scale(1); opacity: 0.03; }
  50%  { transform: translate(2%, 3%) scale(1.05); opacity: 0.06; }
  100% { transform: translate(0, 0) scale(1); opacity: 0.03; }
}
@keyframes slowDrift2 {
  0%   { transform: translate(0, 0) scale(1.05); opacity: 0.02; }
  50%  { transform: translate(-2%, -2%) scale(1); opacity: 0.05; }
  100% { transform: translate(0, 0) scale(1.05); opacity: 0.02; }
}
@keyframes particleFloat {
  0% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
  10% { opacity: 0.25; }
  90% { opacity: 0.25; }
  100% { transform: translateY(-100vh) translateX(30px) scale(0.8); opacity: 0; }
}
`;

export function GlobalAmbilight() {
  const [mounted, setMounted] = useState(false);
  const interactiveLightRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);

    let animationFrameId: number;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const updatePosition = () => {
      // Lerp super suave (0.03 de fricção) para criar um peso na luz (ela arrasta atrás do mouse)
      currentX += (targetX - currentX) * 0.03;
      currentY += (targetY - currentY) * 0.03;

      if (interactiveLightRef.current) {
        interactiveLightRef.current.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
      }
      
      // Efeito Parallax sutil no fundo (movimento contrário ao mouse)
      if (parallaxRef.current) {
        const moveX = (currentX - window.innerWidth / 2) * -0.015;
        const moveY = (currentY - window.innerHeight / 2) * -0.015;
        parallaxRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`;
      }

      animationFrameId = requestAnimationFrame(updatePosition);
    };

    window.addEventListener('mousemove', handleMouseMove);
    updatePosition();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (!siteConfig.features.globalAmbilight || !mounted) return null;

  // Gerar partículas de poeira cinematográfica de forma estática no mount
  // para evitar warnings de hidratação e garantir que são fixas.
  const particles = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: `${Math.random() * 1.5 + 1}px`, // Minúsculas
    duration: `${Math.random() * 30 + 30}s`, // Muito lentas (30-60s)
    delay: `-${Math.random() * 30}s`, // Delay negativo para já começarem na tela
  }));

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden mix-blend-screen">
      <style>{AMBIENT_STYLES}</style>
      
      {/* ── Cinematic Grain / Noise ── */}
      {/* Noise ultra-sutil para evitar banding sem poluir o visual */}
      <div 
        className="absolute inset-0 opacity-[0.012] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* ── Ambient Light (Luz de atmosfera cinematográfica, ultra invisível) ── */}
      <div ref={parallaxRef} className="absolute inset-0 w-full h-full will-change-transform">
        {/* Canto superior direito */}
        <div 
          className="absolute top-[-20%] right-[-10%] w-[60%] h-[70%] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(147,51,234,0.02) 0%, transparent 60%)',
            filter: 'blur(80px)',
            animation: 'slowDrift1 20s ease-in-out infinite',
          }}
        />

        {/* Canto inferior esquerdo */}
        <div 
          className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(123,46,255,0.015) 0%, transparent 60%)',
            filter: 'blur(100px)',
            animation: 'slowDrift2 25s ease-in-out infinite',
          }}
        />
        
        {/* Nuvem central profunda para amarrar o fundo */}
        <div 
          className="absolute top-[20%] left-[20%] w-[60%] h-[60%] rounded-full"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(168,85,247,0.01) 0%, transparent 60%)',
            filter: 'blur(120px)',
            animation: 'slowDrift1 30s ease-in-out infinite reverse',
          }}
        />
      </div>

      {/* ── Interactive Subconscious Light (Acompanha o mouse com inércia) ── */}
      <div 
        ref={interactiveLightRef}
        className="fixed top-0 left-0 w-[800px] h-[800px] rounded-full mix-blend-screen pointer-events-none will-change-transform"
        style={{
          background: 'radial-gradient(circle, rgba(143,68,255,0.015) 0%, rgba(123,46,255,0.005) 40%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* ── Cinematic Dust Particles (Poeira flutuante - Reduzido) ── */}
      {Array.from({ length: 8 }).map((_, i) => {
        const left = `${Math.random() * 100}%`;
        const size = `${Math.random() * 1.2 + 0.5}px`;
        const duration = `${Math.random() * 40 + 40}s`;
        const delay = `-${Math.random() * 40}s`;
        return (
          <div
            key={i}
            className="absolute bottom-[-5%]"
            style={{
              left,
              width: size,
              height: size,
              background: 'rgba(255,255,255,0.4)',
              boxShadow: '0 0 3px rgba(166,97,255,0.2)',
              borderRadius: '50%',
              animation: `particleFloat ${duration} linear ${delay} infinite`,
              opacity: 0,
              filter: 'blur(0.8px)',
            }}
          />
        );
      })}
    </div>
  );
}
