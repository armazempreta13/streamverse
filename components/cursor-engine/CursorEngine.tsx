'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cursorEngineConfig } from './config';
import { cursorThemes, CursorThemeId, CursorRenderContext } from './themes';

export function CursorEngine() {
  const [mounted, setMounted] = useState(false);
  const [activeTheme, setActiveTheme] = useState<CursorThemeId>('default');
  
  const pathname = usePathname();
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Physics & Animation state
  const mouseRef = useRef({ x: 0, y: 0 });
  const cursorRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0, speed: 0 });
  const hoverProgressRef = useRef(0);
  const targetHoverProgressRef = useRef(0);
  const isClickingRef = useRef(false);
  const lastTimeRef = useRef(0);

  // Set mounted status on client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Detect active hero theme dynamically based on page title or content
  useEffect(() => {
    if (!mounted || !cursorEngineConfig.enabled) return;

    const detectTheme = () => {
      const title = typeof document !== 'undefined' ? document.title.toLowerCase() : '';
      const url = typeof window !== 'undefined' ? window.location.href.toLowerCase() : '';
      
      if (title.includes('spider-man') || title.includes('spiderman') || title.includes('homem-aranha') || url.includes('spider-man') || url.includes('spiderman')) {
        setActiveTheme('spiderman');
      } else if (title.includes('iron man') || title.includes('ironman') || title.includes('homem de ferro') || url.includes('iron-man')) {
        setActiveTheme('ironman');
      } else if (title.includes('batman') || url.includes('batman')) {
        setActiveTheme('batman');
      } else if (title.includes('flash') || url.includes('flash')) {
        setActiveTheme('flash');
      } else if (title.includes('doutor estranho') || title.includes('doctor strange') || url.includes('strange') || url.includes('estranho')) {
        setActiveTheme('strange');
      } else if (title.includes('superman') || title.includes('super-man') || title.includes('homem de aço') || url.includes('superman') || url.includes('super-man')) {
        setActiveTheme('superman');
      } else if (
        title.includes('marvel') || title.includes('vingadores') || title.includes('avengers') || 
        title.includes('thor') || title.includes('hulk') || title.includes('capitão américa') || title.includes('captain america') ||
        url.includes('marvel') || url.includes('avengers')
      ) {
        setActiveTheme('marvel');
      } else {
        setActiveTheme('default');
      }
    };

    // Run detection immediately
    detectTheme();

    // Re-check detection shortly after navigation completes to ensure title is fully populated
    const timer = setTimeout(detectTheme, 150);

    // Create a MutationObserver to listen to title changes dynamically
    const target = document.querySelector('title');
    if (target) {
      const observer = new MutationObserver(() => {
        detectTheme();
      });
      observer.observe(target, { childList: true, characterData: true });
      return () => {
        clearTimeout(timer);
        observer.disconnect();
      };
    }

    return () => clearTimeout(timer);
  }, [mounted, pathname]);

  // Main Cursor Engine loop & event listeners
  useEffect(() => {
    if (!mounted || !cursorEngineConfig.enabled) return;

    // Acessibilidade: Respeita preferências de redução de movimento do usuário
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (cursorEngineConfig.respectReducedMotion && prefersReducedMotion) {
      return; // Return early, falling back to original native cursor
    }

    // Touch/Mobile detection
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (cursorEngineConfig.disableOnTouchDevices && isTouchDevice) {
      return; // Return early on touchscreens
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-density retina displays
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Track mouse coordinates
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    // Track click state
    const onMouseDown = () => { isClickingRef.current = true; };
    const onMouseUp = () => { isClickingRef.current = false; };

    // Track hover states for interactive tags
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      
      const isInteractive = 
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' || 
        target.tagName === 'INPUT' || 
        target.tagName === 'SELECT' || 
        target.tagName === 'TEXTAREA' || 
        target.closest('a') !== null || 
        target.closest('button') !== null || 
        target.closest('.cursor-pointer') !== null || 
        target.getAttribute('role') === 'button';

      if (isInteractive) {
        targetHoverProgressRef.current = 1;
      } else {
        targetHoverProgressRef.current = 0;
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });
    window.addEventListener('mouseover', onMouseOver, { passive: true });

    // Animation & physics update loop using requestAnimationFrame
    let animId: number;
    
    const update = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      // 1. Coordinates mapped 1:1 with zero delay, offset by +20px so it does not overlap the native arrow
      const prevX = cursorRef.current.x;
      const prevY = cursorRef.current.y;
      
      cursorRef.current.x = mouseRef.current.x + 20;
      cursorRef.current.y = mouseRef.current.y + 20;

      // 2. Calculate dynamic mouse velocity vectors
      const vx = cursorRef.current.x - prevX;
      const vy = cursorRef.current.y - prevY;
      const speed = Math.sqrt(vx * vx + vy * vy);
      
      // Decay velocity smoothly
      velocityRef.current.x = velocityRef.current.x * 0.8 + vx * 0.2;
      velocityRef.current.y = velocityRef.current.y * 0.8 + vy * 0.2;
      velocityRef.current.speed = velocityRef.current.speed * 0.8 + speed * 0.2;

      // 3. Update micro-animation hover progress state
      hoverProgressRef.current += (targetHoverProgressRef.current - hoverProgressRef.current) * 0.15;

      // 4. Render
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const theme = cursorThemes[activeTheme] || cursorThemes.default;
      
      if (theme.customRender) {
        ctx.save();
        ctx.translate(cursorRef.current.x, cursorRef.current.y);
        
        theme.customRender({
          ctx,
          x: cursorRef.current.x,
          y: cursorRef.current.y,
          hoverProgress: hoverProgressRef.current,
          velocity: velocityRef.current,
          time: timestamp,
          isClicking: isClickingRef.current
        });
        
        ctx.restore();
      }

      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);

    // Cleanup correctly
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mouseover', onMouseOver);
    };
  }, [mounted, activeTheme]);

  if (!mounted || !cursorEngineConfig.enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[999999] select-none will-change-transform"
      style={{ mixBlendMode: 'normal' }}
    />
  );
}
