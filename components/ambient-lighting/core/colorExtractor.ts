export interface Palette {
  dominant: string;
  secondary: string;
  tertiary: string;
}

const cache = new Map<string, Palette>();

// Fallbacks per genre
export const genreFallbackPalettes: Record<string, string[]> = {
  horror: ["#020617", "#111827", "#450a0a"],
  action: ["#111827", "#7f1d1d", "#f97316"],
  sciFi: ["#020617", "#1e1b4b", "#0ea5e9"],
  romance: ["#1f1020", "#be185d", "#f9a8d4"],
  anime: ["#111827", "#7c3aed", "#ec4899"],
  fantasy: ["#120a1f", "#6d28d9", "#22d3ee"],
  drama: ["#111827", "#374151", "#92400e"],
  comedy: ["#18181b", "#ca8a04", "#facc15"],
  default: ["#111827", "#1f2937", "#3b0764"]
};

export function getGenreFallback(genresInput: string | string[]): Palette {
  const list = Array.isArray(genresInput) 
    ? genresInput 
    : (typeof genresInput === 'string' ? genresInput.split(',') : []);
  
  const normalized = list.map(g => g.trim().toLowerCase());
  
  let match = 'default';
  if (normalized.some(g => g.includes('horror') || g.includes('terror') || g.includes('suspense') || g.includes('medo'))) match = 'horror';
  else if (normalized.some(g => g.includes('action') || g.includes('ação') || g.includes('aventura') || g.includes('adventure') || g.includes('guerra') || g.includes('war'))) match = 'action';
  else if (normalized.some(g => g.includes('sci-fi') || g.includes('ficção') || g.includes('science') || g.includes('espaço') || g.includes('espacial') || g.includes('futurista'))) match = 'sciFi';
  else if (normalized.some(g => g.includes('romance') || g.includes('romântico') || g.includes('amor') || g.includes('apaixonado'))) match = 'romance';
  else if (normalized.some(g => g.includes('anime') || g.includes('animação') || g.includes('animation') || g.includes('desenho'))) match = 'anime';
  else if (normalized.some(g => g.includes('fantasy') || g.includes('fantasia') || g.includes('magia') || g.includes('bruxo') || g.includes('elfo'))) match = 'fantasy';
  else if (normalized.some(g => g.includes('drama') || g.includes('dramático') || g.includes('crime') || g.includes('policial') || g.includes('mistério'))) match = 'drama';
  else if (normalized.some(g => g.includes('comedy') || g.includes('comédia') || g.includes('humor') || g.includes('funny') || g.includes('engraçado'))) match = 'comedy';

  const colors = genreFallbackPalettes[match] || genreFallbackPalettes.default;
  return {
    dominant: colors[2],
    secondary: colors[1],
    tertiary: colors[0]
  };
}

export function extractColorsFromImage(imageUrl: string, genres: string | string[]): Promise<{ palette: Palette, fallbackUsed: boolean }> {
  if (!imageUrl) {
    return Promise.resolve({ palette: getGenreFallback(genres), fallbackUsed: true });
  }

  if (cache.has(imageUrl)) {
    return Promise.resolve({ palette: cache.get(imageUrl)!, fallbackUsed: false });
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    const fallback = getGenreFallback(genres);

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ palette: fallback, fallbackUsed: true });
          return;
        }

        ctx.drawImage(img, 0, 0, 16, 16);
        const imgData = ctx.getImageData(0, 0, 16, 16).data;

        // Collect colors and filter out extremely dark/light colors to avoid muddy palettes
        const colors: { r: number; g: number; b: number; s: number; l: number }[] = [];
        
        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i+1];
          const b = imgData[i+2];
          const a = imgData[i+3];
          
          if (a < 150) continue; // Skip semi-transparent pixels

          const { s, l } = rgbToHsl(r, g, b);
          
          // Filter out black/white pixels (keep color in active range)
          if (l > 0.08 && l < 0.90) {
            colors.push({ r, g, b, s, l });
          }
        }

        if (colors.length === 0) {
          resolve({ palette: fallback, fallbackUsed: true });
          return;
        }

        // Sort by saturation desc to get vibrant accents first
        colors.sort((a, b) => b.s - a.s);

        const dom = colors[0];
        
        let sec = colors[Math.floor(colors.length * 0.25)] || dom;
        let ter = colors[Math.floor(colors.length * 0.5)] || dom;

        // If secondary or tertiary is too close, pick another
        for (let i = 1; i < colors.length; i++) {
          const c = colors[i];
          const dist = Math.abs(c.r - dom.r) + Math.abs(c.g - dom.g) + Math.abs(c.b - dom.b);
          if (dist > 60) {
            sec = c;
            break;
          }
        }
        for (let i = colors.length - 1; i >= 0; i--) {
          const c = colors[i];
          const dist1 = Math.abs(c.r - dom.r) + Math.abs(c.g - dom.g) + Math.abs(c.b - dom.b);
          const dist2 = Math.abs(c.r - sec.r) + Math.abs(c.g - sec.g) + Math.abs(c.b - sec.b);
          if (dist1 > 60 && dist2 > 60) {
            ter = c;
            break;
          }
        }

        const palette = {
          dominant: rgbToHex(dom.r, dom.g, dom.b),
          secondary: rgbToHex(sec.r, sec.g, sec.b),
          tertiary: rgbToHex(ter.r, ter.g, ter.b)
        };

        cache.set(imageUrl, palette);
        resolve({ palette, fallbackUsed: false });
      } catch (err) {
        console.warn('Canvas color extraction failed (CORS likely). Using fallback.', err);
        resolve({ palette: fallback, fallbackUsed: true });
      }
    };

    img.onerror = () => {
      resolve({ palette: fallback, fallbackUsed: true });
    };

    img.src = imageUrl;
  });
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h, s, l };
}

function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}
