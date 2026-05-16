'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore/lite';
import { db } from '@/lib/firebase';
import { siteConfig } from '@/config/site';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'anime' | 'movie' | 'tv';
  imageUrl: string;
  href: string;
  isNew: boolean;
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!siteConfig.features.enableNotifications) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    const fetchNotifs = async () => {
      try {
        const q = query(collection(db, 'contents'), orderBy('createdAt', 'desc'), limit(4));
        const snapshot = await getDocs(q);
        
        const notifs: Notification[] = [];
        
        snapshot.docs.forEach((doc, index) => {
          const data = doc.data();
          const type = data.type as 'movie' | 'tv' | 'anime';
          
          let notifMsg = '';
          if (type === 'movie') {
            notifMsg = 'Novo filme adicionado ao catálogo.';
          } else if (type === 'anime' || (data.categories && data.categories.includes('Anime'))) {
            notifMsg = 'Novo episódio disponível para assistir.';
          } else {
            notifMsg = 'Nova temporada ou episódios adicionados.';
          }

          notifs.push({
            id: doc.id,
            title: data.title || 'Novo Conteúdo',
            message: notifMsg,
            time: index === 0 ? 'Agora mesmo' : index === 1 ? 'Há poucas horas' : 'Recentemente',
            type: (type === 'anime' || (data.categories && data.categories.includes('Anime'))) ? 'anime' : type === 'movie' ? 'movie' : 'tv',
            imageUrl: data.posterImage || data.coverImage || data.thumbnailImage || 'https://picsum.photos/seed/notif/200/300',
            href: `/content/${data.slug}`,
            isNew: index < 2
          });
        });
        
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => n.isNew).length);
      } catch (e) {
        console.error('Erro ao buscar notificações do catálogo:', e);
      }
    };
    
    fetchNotifs();
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
       setUnreadCount(0);
       setNotifications(prev => prev.map(n => ({ ...n, isNew: false })));
    }
  };

  if (!siteConfig.features.enableNotifications) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={handleOpen}
        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors relative group"
      >
        <Bell className="size-5 group-hover:animate-[wiggle_1s_ease-in-out_infinite]" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-[#FF3366] border-2 border-[#050510] rounded-full flex items-center justify-center text-[8px] font-bold text-white shadow-[0_0_10px_#FF3366] animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-[320px] sm:w-[360px] bg-[#0A0C10] border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden z-[9999] animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <h3 className="font-sans font-semibold text-white text-[14px]">Notificações</h3>
            <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
              <X className="size-4" />
            </button>
          </div>
          
          <div className="max-h-[350px] overflow-y-auto scrollbar-hide bg-[#050510]">
            {notifications.length === 0 ? (
              <div className="py-10 px-4 text-center flex flex-col items-center justify-center">
                <Bell className="size-6 text-white/20 mb-2" />
                <p className="text-white/50 text-[13px] font-medium">Você não tem notificações.</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notif) => (
                  <Link 
                    href={notif.href} 
                    key={notif.id}
                    onClick={() => setIsOpen(false)}
                    className="flex items-start gap-3 p-4 hover:bg-white/[0.03] transition-colors border-b border-white/5 last:border-0 relative group"
                  >
                    {/* Poster */}
                    <div className="w-[42px] h-[60px] rounded bg-[#131520] overflow-hidden relative shrink-0 border border-white/5">
                      <Image 
                        src={notif.imageUrl} 
                        alt="capa"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    
                    {/* Text */}
                    <div className="flex-1 flex flex-col min-w-0 pt-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-[13px] font-semibold text-white/90 truncate leading-tight group-hover:text-white transition-colors">{notif.title}</h4>
                        {notif.isNew && (
                          <div className="w-2 h-2 rounded-full bg-[#FF3366] shrink-0 mt-1 shadow-[0_0_8px_rgba(255,51,102,0.6)]" />
                        )}
                      </div>
                      <p className="text-[12px] text-[#8A93A6] line-clamp-2 leading-snug mt-1">{notif.message}</p>
                      <span className="text-[10px] text-[#5C6370] font-medium mt-1.5">{notif.time}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-white/5 bg-white/[0.01] text-center">
            <Link href="/movies" onClick={() => setIsOpen(false)} className="text-[12px] font-semibold text-white/60 hover:text-white transition-colors">
              Ver Catálogo Completo
            </Link>
          </div>
        </div>
      )}
      <style jsx>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
      `}</style>
    </div>
  );
}
