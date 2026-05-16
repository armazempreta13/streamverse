'use client';

import React from 'react';
import { Home, Tv, Clapperboard, Sparkles, Bookmark, Clock, Settings, Search } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

const navItems = [
  { id: 'home', icon: Home, label: 'Início', href: '/' },
  { id: 'search', icon: Search, label: 'Buscar', href: '/search' },
  { id: 'bookmark', icon: Bookmark, label: 'Minha Lista', href: '/my-list' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 h-screen w-[80px] bg-[#050510]/95 backdrop-blur-md flex flex-col items-center py-8 z-50 border-r border-white/5">
      <div className="flex flex-col gap-6 w-full items-center mt-[70px]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <div key={item.id} className="relative group w-full flex justify-center">
              <Link
                href={item.href}
                className={clsx(
                  "relative flex items-center justify-center w-[44px] h-[44px] rounded-[14px] transition-all duration-300",
                  isActive ? "bg-[#8F44FF]/10 shadow-[0_0_15px_rgba(143,68,255,0.15)] scale-105" : "hover:bg-white/5 hover:scale-105"
                )}
              >
                {isActive && (
                  <div className="absolute left-[-16px] w-1 h-8 bg-[#8F44FF] rounded-r-full shadow-[0_0_10px_#8F44FF]" />
                )}
                
                <item.icon
                  className={clsx(
                    "relative z-10 size-[20px] transition-all duration-300",
                    isActive 
                      ? "text-[#A661FF] drop-shadow-[0_0_8px_rgba(166,97,255,0.5)]" 
                      : "text-[#8A93A6] group-hover:text-white"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </Link>
              
              {/* Tooltip */}
              <div className="absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 bg-[#0A0A16] border border-white/10 px-3 py-1.5 rounded-[8px] text-[13px] font-bold text-white shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto flex flex-col items-center justify-center w-full gap-4 relative group">
        <button className="flex items-center justify-center w-[44px] h-[44px] rounded-[14px] hover:bg-white/5 transition-all duration-300 hover:scale-110">
          <Settings className="size-[22px] text-[#8A93A6] group-hover:text-white transition-colors" strokeWidth={2} />
        </button>
        {/* Tooltip */}
        <div className="absolute left-[calc(100%-10px)] top-1/2 -translate-y-1/2 bg-[#0A0A16] border border-white/10 px-3 py-1.5 rounded-[8px] text-[13px] font-bold text-white shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
          Configurações
        </div>
      </div>
    </aside>
  );
}
