'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore/lite';
import { db } from '@/lib/firebase';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { handleFirestoreError, OperationType } from '@/lib/error-handler';

export function ContentForm({ initialData = null, id = null }: { initialData?: any, id?: string | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    originalTitle: initialData?.originalTitle || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    type: initialData?.type || 'movie',
    year: initialData?.year || new Date().getFullYear(),
    categories: initialData?.categories?.join(', ') || '',
    thumbnailImage: initialData?.thumbnailImage || '',
    coverImage: initialData?.coverImage || '',
    videoUrl: initialData?.videoUrl || '',
    videoUrl2: initialData?.videoUrl2 || '',
    seasons: initialData?.seasons || 0,
    score: initialData?.score || '9.0',
    relevance: initialData?.relevance || '95%',
    reviews: initialData?.reviews || '10K+',
    duration: initialData?.duration || '24m',
    status: initialData?.status || 'Finalizado',
    studio: initialData?.studio || 'Desconhecido',
    classification: initialData?.classification || '14',
    audio: initialData?.audio || 'Original',
    subtitles: initialData?.subtitles || 'Português',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'seasons' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dbData = {
        title: formData.title,
        originalTitle: formData.originalTitle || formData.title,
        slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: formData.description,
        type: formData.type,
        year: Number(formData.year),
        categories: formData.categories.split(',').map((c: string) => c.trim()).filter((c: string) => c),
        thumbnailImage: formData.thumbnailImage,
        coverImage: formData.coverImage,
        videoUrl: formData.videoUrl,
        videoUrl2: formData.videoUrl2,
        seasons: Number(formData.seasons),
        score: formData.score,
        relevance: formData.relevance,
        reviews: formData.reviews,
        duration: formData.duration,
        status: formData.status,
        studio: formData.studio,
        classification: formData.classification,
        audio: formData.audio,
        subtitles: formData.subtitles,
        updatedAt: serverTimestamp(),
      };

      if (id) {
        await updateDoc(doc(db, 'contents', id), dbData);
      } else {
        const newId = doc(collection(db, 'contents')).id;
        await setDoc(doc(db, 'contents', newId), {
          ...dbData,
          createdAt: serverTimestamp(),
        });
      }
      
      router.push('/admin');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar conteúdo. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/admin" className="p-2 text-[#8A93A6] hover:text-white bg-[#131520] rounded-lg transition-colors border border-white/5">
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-2xl font-bold">{id ? 'Editar Conteúdo' : 'Novo Conteúdo'}</h1>
      </div>

      <div className="bg-[#131520] border border-white/5 rounded-xl p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#8A93A6]">Título Principal</label>
            <input required name="title" value={formData.title} onChange={handleChange} className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#8F44FF] transition-colors" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#8A93A6]">Título Original / Japonês</label>
            <input name="originalTitle" value={formData.originalTitle} onChange={handleChange} className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#8F44FF] transition-colors" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#8A93A6]">Slug (URL amigável)</label>
            <input required name="slug" value={formData.slug} onChange={handleChange} className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#8F44FF] transition-colors" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#8A93A6]">Descrição (Sinopse)</label>
          <textarea required name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#8F44FF] transition-colors resize-none" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#8A93A6]">Tipo</label>
            <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#8F44FF] transition-colors appearance-none">
              <option value="movie">Filme</option>
              <option value="series">Série</option>
              <option value="anime">Anime</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#8A93A6]">Ano</label>
            <input required type="number" name="year" value={formData.year} onChange={handleChange} className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#8F44FF] transition-colors" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#8A93A6]">Temporadas (0 p/ filmes)</label>
            <input required type="number" name="seasons" value={formData.seasons} onChange={handleChange} className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#8F44FF] transition-colors" disabled={formData.type === 'movie'} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#8A93A6]">Duração Média</label>
            <input name="duration" value={formData.duration} onChange={handleChange} placeholder="24m" className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#8F44FF] transition-colors" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#8A93A6]">Nota (ex: 9.0)</label>
            <input name="score" value={formData.score} onChange={handleChange} className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#8F44FF] transition-colors" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#8A93A6]">Qtd. Avaliações</label>
            <input name="reviews" value={formData.reviews} onChange={handleChange} placeholder="10K+" className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#8F44FF] transition-colors" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#8A93A6]">Relevância (%)</label>
            <input name="relevance" value={formData.relevance} onChange={handleChange} placeholder="95%" className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#8F44FF] transition-colors" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#8A93A6]">Status</label>
            <input name="status" value={formData.status} onChange={handleChange} className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#8F44FF] transition-colors" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#8A93A6]">Estúdio</label>
            <input name="studio" value={formData.studio} onChange={handleChange} className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#8F44FF] transition-colors" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#8A93A6]">Classificação</label>
            <input name="classification" value={formData.classification} onChange={handleChange} className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#8F44FF] transition-colors" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#8A93A6]">Áudio</label>
            <input name="audio" value={formData.audio} onChange={handleChange} className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#8F44FF] transition-colors" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#8A93A6]">Legenda</label>
            <input name="subtitles" value={formData.subtitles} onChange={handleChange} className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#8F44FF] transition-colors" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#8A93A6]">Gêneros / Categorias (separadas por vírgula)</label>
          <input name="categories" value={formData.categories} onChange={handleChange} placeholder="Ação, Aventura, Fantasia" className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#8F44FF] transition-colors" />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#8A93A6]">URL da Thumbnail (Vertical/Poster)</label>
            <input required name="thumbnailImage" value={formData.thumbnailImage} onChange={handleChange} className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#8F44FF] transition-colors" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#8A93A6]">URL da Capa (Horizontal)</label>
            <input required name="coverImage" value={formData.coverImage} onChange={handleChange} className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#8F44FF] transition-colors" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#8A93A6]">Player 1 (URL/Iframe Embed)</label>
            <input name="videoUrl" value={formData.videoUrl} onChange={handleChange} className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#8F44FF] transition-colors" />
            <p className="text-xs text-[#8A93A6]">
              Link direto ou código do embed <code>&lt;iframe&gt;...</code>. Os episódios têm prioridade.
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#8A93A6]">Player 2 (Alternativo)</label>
            <input name="videoUrl2" value={formData.videoUrl2} onChange={handleChange} className="w-full bg-[#0A0C10] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#8F44FF] transition-colors" />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          type="submit" 
          disabled={loading}
          className="flex items-center gap-2 bg-[#8F44FF] hover:bg-[#7B2EFF] text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
        >
          <Save className="size-5" />
          {loading ? 'Salvando...' : 'Salvar Conteúdo'}
        </button>
      </div>
    </form>
  );
}
