'use client';

import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TrendingCard, MediaCard } from './Cards';
import { collection, getDocs, orderBy, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

interface ContentCarouselProps {
  title: string;
  type?: string; 
  category?: string;
  sortBy?: 'recent' | 'popular';
  cardStyle?: 'trending' | 'media';
  seeAllHref?: string;
}

export function ContentCarousel({ title, type, category, sortBy = 'recent', cardStyle = 'media', seeAllHref }: ContentCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContents = async () => {
      try {
        setLoading(true);
        let constraints = [];
        
        if (type) {
           constraints.push(where('type', '==', type));
        }

        let orderField = sortBy === 'popular' ? 'updatedAt' : 'createdAt';
        
        const q = query(
          collection(db, 'contents'),
          ...constraints,
          orderBy(orderField, 'desc'),
          limit(10)
        );

        const snapshot = await getDocs(q);
        
        let docs = snapshot.docs.map((doc, index) => {
          const data = doc.data();
          let cType = data.type || '';
          let typeLabel = '';
          if (cType === 'movie') typeLabel = 'Filme';
          else if (cType === 'series') typeLabel = 'Série';
          else if (cType === 'anime') typeLabel = 'Anime';
          else typeLabel = cType;

          return {
            title: data.title,
            subtitle: typeLabel,
            rank: index + 1,
            imageUrl: data.coverImage || data.thumbnailImage || 'https://picsum.photos/seed/1/400/600',
            slug: data.slug,
            categories: data.categories || []
          };
        });

        if (category) {
           docs = docs.filter(d => d.categories.some((c: string) => c.toLowerCase() === category.toLowerCase()));
        }

        setData(docs);
      } catch (error) {
        console.error("Error fetching contents: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContents();
  }, [type, category, sortBy]);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -800, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 800, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <section className="relative px-6 sm:px-10 pb-10 pt-6">
        <h3 className="text-[20px] font-display font-bold mb-4 text-white opacity-50 tracking-wide">{title}</h3>
        <div className="flex gap-4 sm:gap-6 overflow-x-hidden pb-4 pt-2 -mx-6 sm:-mx-10 px-6 sm:px-10">
           {[...Array(5)].map((_, i) => (
             <div key={i} className={`shrink-0 bg-[#0B1020] animate-pulse rounded-[16px] ${cardStyle === 'trending' ? 'w-[150px] sm:w-[180px] aspect-[2/3]' : 'w-[280px] sm:w-[320px] aspect-[16/10]'}`} />
           ))}
        </div>
      </section>
    )
  }

  if (data.length === 0) return null;

  return (
    <section className="relative px-6 sm:px-10 pb-12 pt-6 group/section">
      <div className="flex items-end justify-between mb-6">
        <h3 className="text-[24px] font-display font-bold text-white tracking-wide">{title}</h3>
        {seeAllHref && (
           <Link href={seeAllHref} className="text-[13px] font-bold text-[#A661FF] hover:text-[#7B2EFF] transition-colors uppercase tracking-widest flex items-center gap-1 group">
              Ver Todos
              <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
           </Link>
        )}
      </div>
      
      <div className="relative border border-transparent">
        {/* Floating buttons */}
        <button 
          onClick={scrollLeft}
          className="absolute left-[-24px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center z-20 opacity-0 group-hover/section:opacity-100 transition-all duration-300 text-white hover:bg-[#8F44FF] hover:border-[#8F44FF] hover:scale-110 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
        >
          <ChevronLeft className="size-6 ml-[-2px]" />
        </button>
        
        <button 
          onClick={scrollRight}
          className="absolute right-[-24px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center z-20 opacity-0 group-hover/section:opacity-100 transition-all duration-300 text-white hover:bg-[#8F44FF] hover:border-[#8F44FF] hover:scale-110 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
        >
          <ChevronRight className="size-6 mr-[-2px]" />
        </button>

        {/* Scrollable Container */}
        <div 
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-8 pt-2 scrollbar-hide snap-x -mx-6 sm:-mx-10 px-6 sm:px-10"
          style={{ scrollBehavior: 'smooth' }}
        >
          {data.map((item) => (
            <div key={item.slug} className="snap-start shrink-0">
              {cardStyle === 'trending' ? (
                <TrendingCard 
                  title={item.title} 
                  rank={item.rank} 
                  imageUrl={item.imageUrl} 
                  slug={item.slug} 
                />
              ) : (
                <MediaCard 
                  title={item.title}
                  subtitle={item.subtitle}
                  imageUrl={item.imageUrl}
                  slug={item.slug}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
