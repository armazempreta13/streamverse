'use client';

import { useEffect, useState, useMemo } from 'react';
import { ambientLightingConfig } from '@/config/site';
import { extractColorsFromImage, getGenreFallback, Palette } from '../core/colorExtractor';

export interface UseAmbientLightingProps {
  imageUrl: string;
  contentId: string;
  contentType: 'movie' | 'series' | 'anime' | 'episode' | 'character';
  genres?: string | string[];
  enabled?: boolean;
}

export function useAmbientLighting({
  imageUrl,
  contentId,
  contentType,
  genres = [],
  enabled = true,
}: UseAmbientLightingProps) {
  const [palette, setPalette] = useState<Palette>(() => getGenreFallback(genres));
  const [isLoading, setIsLoading] = useState(true);
  const [fallbackUsed, setFallbackUsed] = useState(false);
  const [quality, setQuality] = useState<'ultra' | 'high' | 'medium' | 'low' | 'off'>('high');

  const shouldRun = useMemo(() => {
    if (!ambientLightingConfig.enabled || !enabled) return false;
    
    // Page type checking
    const pageKey = contentType === 'series' ? 'series' : contentType;
    if (pageKey in ambientLightingConfig.pages) {
      return (ambientLightingConfig.pages as any)[pageKey] === true;
    }
    return true;
  }, [contentType, enabled]);

  useEffect(() => {
    if (!shouldRun) {
      setQuality('off');
      setIsLoading(false);
      return;
    }

    if (typeof window === 'undefined') return;

    const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;
    const respectMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    let currentQuality: 'ultra' | 'high' | 'medium' | 'low' | 'off' = 'high';
    if (ambientLightingConfig.adaptiveQuality) {
      if (isMobile) {
        currentQuality = 'medium';
      } else if (window.innerWidth >= 1920) {
        currentQuality = 'ultra';
      }
    }
    if (respectMotion && ambientLightingConfig.respectReducedMotion) {
      currentQuality = 'low';
    }
    setQuality(currentQuality);

    let active = true;
    setIsLoading(true);

    extractColorsFromImage(imageUrl, genres).then(({ palette: extracted, fallbackUsed: fallback }) => {
      if (!active) return;
      
      setPalette(extracted);
      setFallbackUsed(fallback);
      setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, [imageUrl, genres, shouldRun]);

  const cssVariables = useMemo(() => {
    if (quality === 'off') return {};

    const intensity = ambientLightingConfig.intensity;
    const blur = ambientLightingConfig.blur;
    
    return {
      '--ambient-dominant': palette.dominant,
      '--ambient-secondary': palette.secondary,
      '--ambient-tertiary': palette.tertiary,
      '--ambient-intensity': intensity.toString(),
      '--ambient-blur': `${blur}px`,
    } as React.CSSProperties;
  }, [palette, quality]);

  return {
    palette,
    cssVariables,
    isLoading,
    quality,
    fallbackUsed,
  };
}
export type { Palette };
