'use client';

import React, { useEffect, useRef } from 'react';

export function AtmosphereLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Array<{ x: number, y: number, radius: number, vx: number, vy: number, alpha: number }> = [];
    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const numParticles = Math.floor((canvas.width * canvas.height) / 30000); // Very sparse, ~1 per 30k px
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.2 + 0.3,
          vx: (Math.random() - 0.5) * 0.08, // Extremely slow drift
          vy: (Math.random() - 0.5) * 0.08 - 0.02, // Slightly upwards
          alpha: Math.random() * 0.3 + 0.05,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around smoothly
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;

        // Soft outer glow (purple tint)
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168, 85, 247, ${p.alpha * 0.2})`;
        ctx.fill();
        
        // Inner core (white/light purple)
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.5})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-[#050510]">
        {/* Deep cinematic background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0B0F1E] via-[#050510] to-[#04040a]" />

        {/* Lighting / glowing orbs */}
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-[#7B2EFF] rounded-full mix-blend-screen filter blur-[150px] animate-pulse-slow will-change-transform opacity-30" />
        <div className="absolute top-[40%] -right-[10%] w-[70%] h-[70%] bg-[#A855F7] rounded-full mix-blend-screen filter blur-[200px] animate-pulse-slower will-change-transform opacity-20" />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] bg-[#3B82F6] rounded-full mix-blend-screen filter blur-[180px] opacity-[0.02] animate-float-slow will-change-transform" />
      </div>

      <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
        {/* Particles layer */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-70 pointer-events-none" />
      </div>
    </>
  );
}
