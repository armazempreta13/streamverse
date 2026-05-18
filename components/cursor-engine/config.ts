import { siteConfig } from '@/config/site';

export const cursorEngineConfig = {
  // Driven by global site configuration, but has a local override fallback
  enabled: typeof window !== 'undefined' ? (siteConfig.features as any).enableCustomCursors ?? false : false,
  libraryMode: "custom", // highly optimized custom engine
  adaptiveQuality: true,
  cinematicMotion: true,
  magneticHover: true,
  smoothInterpolation: true,
  enableMicroAnimations: true,
  autoDetectPerformance: true,
  disableOnTouchDevices: true,
  respectReducedMotion: true,
  fallbackToNativeCursor: true,
  maxFPS: 60
};
