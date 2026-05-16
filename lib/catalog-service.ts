import { collection, query, where, getDocs, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { handleFirestoreError, OperationType } from '@/lib/error-handler';

export type ImportStats = {
  animesAdded: number;
  animesUpdated: number;
  episodesAdded: number;
  episodesUpdated: number;
  iframesAdded: number;
  errors: any[];
  processedAnimes: any[];
};

export async function processCatalogChunk(jsonChunk: any, authUid: string, isDryRun: boolean): Promise<ImportStats> {
  const stats: ImportStats = {
    animesAdded: 0,
    animesUpdated: 0,
    episodesAdded: 0,
    episodesUpdated: 0,
    iframesAdded: 0,
    errors: [],
    processedAnimes: [],
  };

  try {
    const res = await fetch('/api/admin/catalog/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jsonChunk),
    });

    const data = await res.json();
    if (!data.success) {
      stats.errors.push(data.error);
      return stats;
    }

    const { ops } = data;
    let batch = writeBatch(db);
    let batchCount = 0;

    // Fast mappings
    const fetchedAnimes = new Map();
    const fetchedEpisodes = new Map();

    // 1. Check existing Animes by slug
    const slugs = ops.animes.map((a: any) => a.slug).filter(Boolean);
    if (slugs.length > 0) {
      // Chunk max 30 for 'in'
      for (let i = 0; i < slugs.length; i += 30) {
        const chunkSlugs = slugs.slice(i, i + 30);
        const q = query(collection(db, 'contents'), where('slug', 'in', chunkSlugs));
        const snap = await getDocs(q);
        snap.forEach(d => fetchedAnimes.set(d.data().slug, { id: d.id, ...d.data() }));
      }
    }

    // Process Animes
    const animeIdMap = new Map(); // map anime slug -> contentId
    for (const animeOp of ops.animes) {
      const existing = fetchedAnimes.get(animeOp.slug);
      let contentId;

      if (existing) {
        stats.animesUpdated++;
        contentId = existing.id;
        animeIdMap.set(animeOp.slug, contentId);
        stats.processedAnimes.push({ ...animeOp, status: 'updated' });
        
        if (!isDryRun) {
          const docRef = doc(db, 'contents', contentId);
          // Merge categories
          const mergedCategories = Array.from(new Set([...(existing.categories || []), ...(animeOp.categories || [])]));
          
          batch.update(docRef, {
            ...animeOp,
            type: existing.type || animeOp.type,
            year: existing.year || animeOp.year,
            categories: mergedCategories.length > 0 ? mergedCategories : ['Anime'],
            videoUrl: existing.videoUrl || '',
            seasons: Math.max(existing.seasons || 0, animeOp.seasons || 0),
            updatedAt: serverTimestamp(),
          });
          batchCount++;
        }
      } else {
        stats.animesAdded++;
        contentId = doc(collection(db, 'contents')).id;
        animeIdMap.set(animeOp.slug, contentId);
        stats.processedAnimes.push({ ...animeOp, status: 'added' });
        
        if (!isDryRun) {
          const docRef = doc(db, 'contents', contentId);
          batch.set(docRef, {
            ...animeOp,
            year: new Date().getFullYear(),
            categories: [], // Add default empty
            videoUrl: '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          batchCount++;
        }
      }
    }

    // 2. Check existing Episodes
    // Group episodes by animeId to query individually
    
    // We will query the episodes collection for EACH anime we just processed
    // Fetch all existing episodes and map them by a composite key
    for (const contentId of Array.from(animeIdMap.values())) {
        const q = query(collection(db, `contents/${contentId}/episodes`));
        const snap = await getDocs(q).catch(() => ({ docs: [] })); 
        snap.docs.forEach(d => {
           const data = d.data();
           fetchedEpisodes.set(`${contentId}-${data.season || 1}-${data.number || 1}`, { id: d.id, contentId });
        });
    }

    // Process Episodes
    for (const epOp of ops.episodes) {
      const contentId = animeIdMap.get(epOp.animeSlug);
      if (!contentId) continue; // Skip if we failed to map

      const epKey = `${contentId}-${epOp.season || 1}-${epOp.number || 1}`;
      const existingEp = fetchedEpisodes.get(epKey);
      stats.iframesAdded += epOp.iframes?.length || 0;

      if (existingEp) {
        stats.episodesUpdated++;
        if (!isDryRun) {
          const epRef = doc(db, `contents/${contentId}/episodes`, existingEp.id);
          // Only update specific fields so we don't accidentally wipe out manually added iframes
          batch.update(epRef, {
            title: epOp.title,
            duration: epOp.duration,
            thumbnailUrl: epOp.thumbnailUrl,
            sourceUrl: epOp.sourceUrl,
            videoUrl: epOp.videoUrl,
            videoUrl2: epOp.videoUrl2,
            iframes: epOp.iframes, 
            updatedAt: serverTimestamp(),
          });
          batchCount++;
        }
      } else {
        stats.episodesAdded++;
        if (!isDryRun) {
          const newEpId = doc(collection(db, `contents/${contentId}/episodes`)).id;
          const epRef = doc(db, `contents/${contentId}/episodes`, newEpId);
          batch.set(epRef, {
            ...epOp,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          batchCount++;
        }
      }

      // Firestore batches are limited to 500 writes
      if (batchCount >= 400 && !isDryRun) {
        await batch.commit();
        batch = writeBatch(db);
        batchCount = 0;
      }
    }

    if (!isDryRun && batchCount > 0) {
      await batch.commit();
    }

  } catch (error: any) {
    stats.errors.push(error.message);
  }

  return stats;
}
