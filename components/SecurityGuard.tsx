'use client';

/**
 * SecurityGuard — Client-side behavioral fingerprinting & bot detection.
 * Invisible to users. Detects automation, runs silently in the background.
 * 
 * Signals collected:
 *  - Canvas fingerprint
 *  - WebGL renderer
 *  - Audio fingerprint  
 *  - Navigator entropy
 *  - Behavioral signals (mouse, scroll, timing)
 *  - Automation flags
 */

import { useEffect, useRef } from 'react';

// ─── Fingerprint generators ───────────────────────────────────────────────────

function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';
    canvas.width = 200;
    canvas.height = 50;
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('StreamVerse', 2, 15);
    ctx.fillStyle = 'rgba(102,204,0,0.7)';
    ctx.fillText('StreamVerse', 4, 17);
    return canvas.toDataURL().slice(-40);
  } catch {
    return 'canvas-error';
  }
}

function getWebGLRenderer(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    if (!gl) return 'no-webgl';
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    if (!ext) return 'no-ext';
    return gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || 'unknown';
  } catch {
    return 'webgl-error';
  }
}

function getAudioFingerprint(): Promise<string> {
  return new Promise(resolve => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const analyser = ctx.createAnalyser();
      const gain = ctx.createGain();
      const dest = ctx.createMediaStreamDestination();

      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(10000, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      oscillator.connect(analyser);
      analyser.connect(gain);
      gain.connect(dest);
      oscillator.start(0);

      setTimeout(() => {
        const buffer = new Float32Array(analyser.frequencyBinCount);
        analyser.getFloatFrequencyData(buffer);
        oscillator.stop();
        ctx.close();
        const hash = buffer.slice(0, 30).reduce((a, b) => a + Math.abs(b), 0).toFixed(6);
        resolve(hash);
      }, 100);
    } catch {
      resolve('audio-error');
    }
  });
}

function detectAutomation(): string[] {
  const flags: string[] = [];

  // WebDriver flags
  if (navigator.webdriver) flags.push('webdriver');
  if ((window as any).__webdriver_evaluate) flags.push('webdriver_eval');
  if ((window as any).__selenium_unwrapped) flags.push('selenium');
  if ((window as any).__fxdriver_evaluate) flags.push('fxdriver');
  if ((window as any).__driver_evaluate) flags.push('driver_eval');
  if ((window as any).domAutomation) flags.push('dom_automation');
  if ((window as any).domAutomationController) flags.push('dom_automation_ctrl');
  if ((window as any).__nightmare) flags.push('nightmare');
  if ((window as any).callPhantom || (window as any)._phantom) flags.push('phantom');
  if ((window as any).Buffer) flags.push('nodejs_buffer');

  // Chrome-specific headless signals
  if ((navigator as any).languages?.length === 0) flags.push('no_languages');
  if (!('onbeforeunload' in window)) flags.push('no_beforeunload');
  if (!navigator.plugins || navigator.plugins.length === 0) flags.push('no_plugins');

  // Timing: headless Chrome often reports 0 for screen dimensions
  if (screen.width === 0 || screen.height === 0) flags.push('zero_screen');
  if (window.outerWidth === 0 && window.outerHeight === 0) flags.push('zero_outer');

  return flags;
}

function getNavigatorEntropy(): Record<string, any> {
  return {
    ua: navigator.userAgent,
    lang: navigator.language,
    langs: (navigator.languages || []).slice(0, 3),
    platform: navigator.platform,
    threads: navigator.hardwareConcurrency || 0,
    memory: (navigator as any).deviceMemory || 0,
    touch: navigator.maxTouchPoints || 0,
    colorDepth: screen.colorDepth,
    pixelDepth: screen.pixelDepth,
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dnt: navigator.doNotTrack,
    cookieEnabled: navigator.cookieEnabled,
    pdfViewer: (navigator as any).pdfViewerEnabled,
    screenW: screen.width,
    screenH: screen.height,
    viewportW: window.innerWidth,
    viewportH: window.innerHeight,
  };
}

// ─── Behavioral tracking ──────────────────────────────────────────────────────

type BehaviorStats = {
  mouseEvents: number;
  scrollEvents: number;
  keyEvents: number;
  focusChanges: number;
  clickEvents: number;
  timeOnPage: number;
  firstInteraction: number | null;
};

// ─── Simple hash ─────────────────────────────────────────────────────────────

function djb2(str: string): string {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) ^ str.charCodeAt(i);
  return (h >>> 0).toString(16);
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SecurityGuard() {
  const behavior = useRef<BehaviorStats>({
    mouseEvents: 0,
    scrollEvents: 0,
    keyEvents: 0,
    focusChanges: 0,
    clickEvents: 0,
    timeOnPage: 0,
    firstInteraction: null,
  });
  const pageStart = useRef(Date.now());
  const reported = useRef(false);

  useEffect(() => {
    // Track behavioral signals
    const onMouse = () => {
      behavior.current.mouseEvents++;
      if (!behavior.current.firstInteraction) behavior.current.firstInteraction = Date.now() - pageStart.current;
    };
    const onScroll = () => { behavior.current.scrollEvents++; };
    const onKey = () => { behavior.current.keyEvents++; };
    const onClick = () => { behavior.current.clickEvents++; };
    const onFocus = () => { behavior.current.focusChanges++; };

    window.addEventListener('mousemove', onMouse, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKey, { passive: true });
    window.addEventListener('click', onClick, { passive: true });
    window.addEventListener('focus', onFocus, { passive: true });

    // Collect and report fingerprint after 3s (non-blocking)
    const timer = setTimeout(async () => {
      if (reported.current) return;
      reported.current = true;

      try {
        const automationFlags = detectAutomation();
        const navEntropy = getNavigatorEntropy();
        const canvasFP = getCanvasFingerprint();
        const webgl = getWebGLRenderer();
        const audio = await getAudioFingerprint();

        const fpData = {
          canvas: canvasFP,
          webgl: webgl.slice(0, 50),
          audio,
          nav: navEntropy,
          automation: automationFlags,
          behavior: {
            ...behavior.current,
            timeOnPage: Date.now() - pageStart.current,
          },
        };

        const fpStr = JSON.stringify(fpData);
        const fpHash = djb2(fpStr);

        // Store in sessionStorage for reuse
        try {
          sessionStorage.setItem('_sv_fp', fpHash);
          // Also persist across sessions
          const existing = localStorage.getItem('_sv_id');
          if (!existing) {
            localStorage.setItem('_sv_id', fpHash);
          }
        } catch {}

        // If automation detected, log it (silently - no UI change)
        if (automationFlags.length > 2) {
          console.warn('[SV Security] Suspicious client detected:', automationFlags);
        }

        // Send fingerprint to server (fire and forget)
        navigator.sendBeacon?.('/api/fp', JSON.stringify({
          fp: fpHash,
          automation: automationFlags.length,
          firstInteraction: behavior.current.firstInteraction,
        }));

      } catch (e) {
        // Silent fail - security should never break the app
      }
    }, 3000);

    return () => {
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('click', onClick);
      window.removeEventListener('focus', onFocus);
      clearTimeout(timer);
    };
  }, []);

  // Invisible — renders nothing
  return null;
}
