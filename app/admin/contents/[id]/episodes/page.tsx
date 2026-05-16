'use client';

import React, { useState, useEffect, use } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore/lite';
import { db } from '@/lib/firebase';
import { ArrowLeft, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import Link from 'next/link';

export default function EpisodesManagerPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const contentId = unwrappedParams.id;
  const { isAdmin, loading } = useAuth();
  const router = useRouter();
  
  const [contentTitle, setContentTitle] = useState('');
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [currentEpisodeId, setCurrentEpisodeId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    number: '',
    season: '1',
    duration: '',
    thumbnailUrl: '',
    videoUrl: '',
    videoUrl2: ''
  });

  useEffect(() => {
    if (!loading && !isAdmin) router.push('/');
  }, [isAdmin, loading, router]);

  const fetchEpisodes = async () => {
    try {
      const q = query(collection(db, `contents/${contentId}/episodes`), orderBy('season'), orderBy('number'));
      const snapshot = await getDocs(q);
      setEpisodes(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const contentDoc = await getDoc(doc(db, 'contents', contentId));
        if (contentDoc.exists()) {
          setContentTitle(contentDoc.data().title);
        }
        await fetchEpisodes();
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    };

    if (isAdmin && contentId) {
      fetchContent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, contentId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenForm = (episode: any = null) => {
    if (episode) {
      setCurrentEpisodeId(episode.id);
      setFormData({
        title: episode.title || '',
        number: episode.number?.toString() || '',
        season: episode.season?.toString() || '1',
        duration: episode.duration || '',
        thumbnailUrl: episode.thumbnailUrl || '',
        videoUrl: episode.videoUrl || '',
        videoUrl2: episode.videoUrl2 || ''
      });
    } else {
      setCurrentEpisodeId(null);
      setFormData({
        title: '',
        number: (episodes.length + 1).toString(),
        season: '1',
        duration: '',
        thumbnailUrl: '',
        videoUrl: '',
        videoUrl2: ''
      });
    }
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dbData = {
        title: formData.title,
        number: Number(formData.number),
        season: Number(formData.season),
        duration: formData.duration,
        thumbnailUrl: formData.thumbnailUrl,
        videoUrl: formData.videoUrl,
        videoUrl2: formData.videoUrl2,
        updatedAt: serverTimestamp(),
      };

      if (currentEpisodeId) {
        await updateDoc(doc(db, `contents/${contentId}/episodes`, currentEpisodeId), dbData);
      } else {
        const newId = doc(collection(db, `contents/${contentId}/episodes`)).id;
        await setDoc(doc(db, `contents/${contentId}/episodes`, newId), {
          ...dbData,
          createdAt: serverTimestamp(),
        });
      }
      setIsEditing(false);
      fetchEpisodes();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar episódio.');
    }
  };

  const handleDelete = async (episodeId: string) => {
    if (confirm('Excluir este episódio?')) {
      try {
        await deleteDoc(doc(db, `contents/${contentId}/episodes`, episodeId));
        fetchEpisodes();
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading || !isAdmin || loadingData) return <div className="min-h-screen bg-[#0A0C10] text-white pt-24"><p className="text-center">Carregando...</p></div>;

  return (
    <main className="min-h-screen bg-[#0A0C10] text-white pt-24 pb-20 px-8">
      <div className="max-w-6xl mx-auto pl-20">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="p-2 text-[#8A93A6] hover:text-white bg-[#131520] rounded-lg transition-colors border border-white/5">
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Episódios</h1>
            <p className="text-[#8A93A6]">{contentTitle}</p>
          </div>
          {!isEditing && (
            <button 
              onClick={() => handleOpenForm()}
              className="ml-auto flex items-center gap-2 bg-[#8F44FF] hover:bg-[#7B2EFF] text-white px-5 py-2.5 rounded-lg font-semibold transition-colors"
            >
              <Plus className="size-5" />
              Novo Episódio
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="bg-[#131520] border border-white/5 rounded-xl p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{currentEpisodeId ? 'Editar Episódio' : 'Adicionar Episódio'}</h2>
              <button type="button" onClick={() => setIsEditing(false)} className="text-[#8A93A6] hover:text-white"><X className="size-5" /></button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-[#8A93A6]">Título</label>
                <input required name="title" value={formData.title} onChange={handleChange} className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#8F44FF] transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#8A93A6]">Temporada</label>
                <input required type="number" name="season" value={formData.season} onChange={handleChange} className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#8F44FF] transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#8A93A6]">Número</label>
                <input required type="number" name="number" value={formData.number} onChange={handleChange} className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#8F44FF] transition-colors" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#8A93A6]">Duração (ex: 24m)</label>
                <input required name="duration" value={formData.duration} onChange={handleChange} className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#8F44FF] transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#8A93A6]">URL da Thumbnail</label>
                <input required name="thumbnailUrl" value={formData.thumbnailUrl} onChange={handleChange} className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#8F44FF] transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#8A93A6]">Player 1 (URL Vídeo/Iframe)</label>
                <input required name="videoUrl" value={formData.videoUrl} onChange={handleChange} className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#8F44FF] transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#8A93A6]">Player 2 (URL Vídeo/Iframe)</label>
                <input name="videoUrl2" value={formData.videoUrl2} onChange={handleChange} className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#8F44FF] transition-colors" />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-2.5 rounded-lg font-semibold text-[#8A93A6] hover:text-white transition-colors">Cancelar</button>
              <button type="submit" className="flex items-center gap-2 bg-[#8F44FF] hover:bg-[#7B2EFF] text-white px-5 py-2.5 rounded-lg font-semibold transition-colors">
                <Save className="size-4" />
                Salvar
              </button>
            </div>
          </form>
        ) : null}

        <div className="bg-[#131520] border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="p-4 text-sm font-medium text-[#8A93A6]">T / Ep</th>
                <th className="p-4 text-sm font-medium text-[#8A93A6]">Título</th>
                <th className="p-4 text-sm font-medium text-[#8A93A6]">Duração</th>
                <th className="p-4 text-sm font-medium text-[#8A93A6] text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {episodes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-[#8A93A6]">Nenhum episódio cadastrado.</td>
                </tr>
              ) : (
                episodes.map(episode => (
                  <tr key={episode.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 text-[#8A93A6]">T{episode.season} E{episode.number}</td>
                    <td className="p-4 font-medium">{episode.title}</td>
                    <td className="p-4 text-[#8A93A6]">{episode.duration}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenForm(episode)} className="p-2 text-[#8A93A6] hover:text-white hover:bg-white/5 rounded-lg transition-colors"><Edit2 className="size-4" /></button>
                        <button onClick={() => handleDelete(episode.id)} className="p-2 text-[#8A93A6] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Trash2 className="size-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
