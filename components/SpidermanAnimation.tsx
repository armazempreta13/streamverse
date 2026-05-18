'use client';

import { useEffect } from 'react';
import { siteConfig } from '@/config/site';

interface SpidermanAnimationProps {
  title: string;
  slug?: string;
}

export function SpidermanAnimation({ title, slug = '' }: SpidermanAnimationProps) {
  useEffect(() => {
    if (!siteConfig.features.enableSpidermanAnimation) {
      return;
    }

    const titleLower = title.toLowerCase();
    const slugLower = slug.toLowerCase();
    
    const isSpiderman = 
      titleLower.includes('spider-man') || 
      titleLower.includes('spiderman') || 
      titleLower.includes('homem-aranha') || 
      titleLower.includes('homem aranha') ||
      titleLower.includes('aranhaverso') ||
      titleLower.includes('aranha-verso') ||
      slugLower.includes('spider-man') ||
      slugLower.includes('spiderman') ||
      slugLower.includes('homem-aranha') ||
      slugLower.includes('aranhaverso') ||
      slugLower.includes('aranha-verso');

    if (isSpiderman) {
      let cleanupFn: (() => void) | null = null;
      
      // Import dynamically to avoid SSR execution
      import('@/app/watch/[slug]/spiderman')
        .then(({ initSpiderman }) => {
          if (typeof initSpiderman === 'function') {
            cleanupFn = initSpiderman();
          }
        })
        .catch(console.error);

      return () => {
        if (cleanupFn) {
          cleanupFn();
        }
      };
    }
  }, [title, slug]);

  return null;
}
