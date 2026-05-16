'use client';

import React from 'react';
import { Share2, Check } from 'lucide-react';

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleShare = async () => {
    const shareData = {
      title: title,
      text: `Assista ${title} online no StreamVerse!`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Error copying to clipboard:', err);
      }
    }
  };

  return (
    <button 
      onClick={handleShare}
      className="bg-transparent hover:bg-white/5 text-[#8A93A6] hover:text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
    >
      {copied ? (
        <>
          <Check className="size-4 text-emerald-500" /> Link Copiado
        </>
      ) : (
        <>
          <Share2 className="size-4" /> Compartilhar
        </>
      )}
    </button>
  );
}
