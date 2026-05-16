import { useEffect, useRef, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore/lite';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

function parseDurationToSeconds(durationStr: string): number {
  if (!durationStr) return 1440; // Default 24 mins
  const m = durationStr.match(/(\d+)\s*(m|min|minutes|minutos)/i);
  if (m) {
    return parseInt(m[1]) * 60;
  }
  return 1440;
}

export function useWatchProgress({
  contentSlug,
  episodeNumber,
  episodeTitle,
  seasonNumber,
  contentTitle,
  contentImage,
  durationStr,
  isMovie,
  isActive,
}: {
  contentSlug: string;
  episodeNumber?: number;
  episodeTitle?: string;
  seasonNumber?: number;
  contentTitle: string;
  contentImage: string;
  durationStr?: string;
  isMovie: boolean;
  isActive?: boolean;
}) {
  const { user } = useAuth();
  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const totalSeconds = parseDurationToSeconds(durationStr || '24m');
  const lastSavedSecondsRef = useRef(0);
  
  // 1. Fetch initial progress
  useEffect(() => {
    if (!user || !contentSlug) return;
    
    let isMounted = true;
    const fetchProgress = async () => {
      try {
        const docRef = doc(db, 'users', user.uid, 'progress', contentSlug);
        const snap = await getDoc(docRef);
        if (snap.exists() && isMounted) {
          const data = snap.data();
          // Only resume if it's the same episode
          const savedEp = data.episodeNumber;
          if (savedEp === episodeNumber) {
            setWatchedSeconds(data.watchedSeconds || 0);
            lastSavedSecondsRef.current = data.watchedSeconds || 0;
          } else {
            setWatchedSeconds(0);
            lastSavedSecondsRef.current = 0;
          }
        }
      } catch (err) {
        console.error("Failed to load progress", err);
      }
    };
    fetchProgress();
    
    return () => { isMounted = false; };
  }, [user, contentSlug, episodeNumber]);

  // 2. Increment timer
  useEffect(() => {
    if (!user || !contentSlug || isActive === false) return;
    
    const interval = setInterval(() => {
      setWatchedSeconds((prev) => {
        const next = prev + 1;
        return next > totalSeconds ? totalSeconds : next;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [user, contentSlug, totalSeconds, isActive]);
  
  // 3. Save to Firestore every 10 seconds watched
  useEffect(() => {
    if (!user || !contentSlug) return;
    
    // Only save if we advanced at least 10 seconds to avoid spam
    if (watchedSeconds - lastSavedSecondsRef.current >= 10 || watchedSeconds === totalSeconds) {
      lastSavedSecondsRef.current = watchedSeconds;
      
      let subtitle = 'Filme';
      if (!isMovie) {
        subtitle = seasonNumber ? `S${seasonNumber} Ep. ${episodeNumber}` : `Ep. ${episodeNumber}`;
      }
      
      const docRef = doc(db, 'users', user.uid, 'progress', contentSlug);
      setDoc(docRef, {
        contentSlug,
        contentTitle,
        contentImage,
        subtitle,
        episodeNumber,
        episodeTitle,
        seasonNumber,
        watchedSeconds,
        totalSeconds,
        progressPercentage: Math.min(100, Math.round((watchedSeconds / totalSeconds) * 100)),
        updatedAt: serverTimestamp(),
        isMovie
      }, { merge: true }).catch(err => {
         console.error("Failed to save progress", err);
      });
    }
  }, [watchedSeconds, user, contentSlug, contentTitle, contentImage, episodeNumber, episodeTitle, seasonNumber, totalSeconds, isMovie]);

  return { watchedSeconds, totalSeconds };
}
