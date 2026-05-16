'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface SaveWatchProgressProps {
  id: string;
  type: string;
  title: string;
  posterUrl: string;
}

export function SaveWatchProgress({ id, type, title, posterUrl }: SaveWatchProgressProps) {
  const { user } = useAuth();

  useEffect(() => {
    const saveProgress = async () => {
      const isMovie = type === 'movie';
      const progressObj = {
        title: title,
        subtitle: isMovie ? 'Filme' : 'Série',
        imageUrl: posterUrl,
        progress: 5,
        slug: `tmdb/${type}/${id}`,
        href: `/tmdb/${type}/${id}`,
        id: `tmdb_${id}`
      };

      if (!user) {
        // Fallback local storage
        try {
          const localProgress = JSON.parse(localStorage.getItem('streamverse_progress') || '[]');
          const filtered = localProgress.filter((p:any) => p.id !== progressObj.id);
          filtered.unshift(progressObj);
          localStorage.setItem('streamverse_progress', JSON.stringify(filtered.slice(0, 12)));
        } catch(e){}
        return;
      }

      try {
        const docRef = doc(db, 'users', user.uid, 'progress', progressObj.id);
        await setDoc(docRef, {
          contentId: progressObj.id,
          contentTitle: title,
          contentImage: posterUrl,
          contentSlug: progressObj.slug,
          isMovie: isMovie,
          progressPercentage: 5,
          updatedAt: serverTimestamp(),
          subtitle: progressObj.subtitle
        }, { merge: true });
      } catch (error) {
        console.error("Failed to save progress", error);
      }
    };

    saveProgress();
  }, [user, id, type, title, posterUrl]);

  return null;
}
