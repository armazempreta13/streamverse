'use client';

import React from 'react';
import { useAmbientLighting } from './hooks/useAmbientLighting';
import { AmbientLightingRenderer } from './renderer/AmbientLightingRenderer';

interface AmbientLightingProps {
  imageUrl: string;
  contentId: string;
  contentType: 'movie' | 'series' | 'anime' | 'episode' | 'character';
  genres?: string | string[];
  enabled?: boolean;
}

export function AmbientLighting({
  imageUrl,
  contentId,
  contentType,
  genres,
  enabled,
}: AmbientLightingProps) {
  const { cssVariables, quality } = useAmbientLighting({
    imageUrl,
    contentId,
    contentType,
    genres,
    enabled,
  });

  return <AmbientLightingRenderer cssVariables={cssVariables} quality={quality} />;
}
