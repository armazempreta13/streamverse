'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, deleteDoc, getDocs, query, orderBy } from 'firebase/firestore/lite';

export interface WatchlistItem {
  id: string;
  type: 'movie' | 'tv';
  title: string;
  posterUrl: string;
  backdropUrl?: string;
  addedAt: number;
}

interface WatchlistContextType {
  watchlist: WatchlistItem[];
  addToWatchlist: (item: Omit<WatchlistItem, 'addedAt'>) => void;
  removeFromWatchlist: (id: string, type: 'movie' | 'tv') => void;
  isInWatchlist: (id: string, type: 'movie' | 'tv') => boolean;
  toggleWatchlist: (item: Omit<WatchlistItem, 'addedAt'>) => void;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Watchlist
  useEffect(() => {
    const loadWatchlist = async () => {
      if (user) {
        try {
          const qRef = query(collection(db, 'users', user.uid, 'watchlist'), orderBy('addedAt', 'desc'));
          const snapshot = await getDocs(qRef);
          const docs = snapshot.docs.map(doc => doc.data() as WatchlistItem);
          setWatchlist(docs);
        } catch (e) {
          console.error('Firebase watchlist load failed:', e);
        }
      } else {
        try {
          const stored = localStorage.getItem('streamverse_watchlist');
          if (stored) setWatchlist(JSON.parse(stored));
        } catch (e) {
          console.error('Local watchlist load failed:', e);
        }
      }
      setIsLoaded(true);
    };
    loadWatchlist();
  }, [user]);

  // Save to LocalStorage if not logged in
  useEffect(() => {
    if (isLoaded && !user) {
      try {
        localStorage.setItem('streamverse_watchlist', JSON.stringify(watchlist));
      } catch (e) {
        console.error('Failed to save watchlist', e);
      }
    }
  }, [watchlist, isLoaded, user]);

  const addToWatchlist = async (item: Omit<WatchlistItem, 'addedAt'>) => {
    const newItem = { ...item, addedAt: Date.now() };
    setWatchlist(prev => {
      if (prev.some(w => w.id === item.id && w.type === item.type)) return prev;
      return [newItem, ...prev];
    });

    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid, 'watchlist', `${item.type}_${item.id}`);
        await setDoc(docRef, {
          ...newItem,
          slug: item.title, // Adicionando slug e imageUrl para compatibilidade com o layout de my-list antigo
          imageUrl: item.posterUrl
        });
      } catch (e) {
        console.error('Failed to save to firebase', e);
      }
    }
  };

  const removeFromWatchlist = async (id: string, type: 'movie' | 'tv') => {
    setWatchlist(prev => prev.filter(w => !(w.id === id && w.type === type)));
    
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid, 'watchlist', `${type}_${id}`);
        await deleteDoc(docRef);
      } catch (e) {
        console.error('Failed to delete from firebase', e);
      }
    }
  };

  const isInWatchlist = (id: string, type: 'movie' | 'tv') => {
    return watchlist.some(w => w.id === id && w.type === type);
  };

  const toggleWatchlist = (item: Omit<WatchlistItem, 'addedAt'>) => {
    if (isInWatchlist(item.id, item.type)) {
      removeFromWatchlist(item.id, item.type);
    } else {
      addToWatchlist(item);
    }
  };

  return (
    <WatchlistContext.Provider value={{ watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist, toggleWatchlist }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}
