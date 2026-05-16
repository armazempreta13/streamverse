'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, doc, deleteDoc, query, orderBy } from 'firebase/firestore/lite';
import { db } from '@/lib/firebase';
import { Plus, Edit2, Trash2, Video, ListVideo, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [contents, setContents] = useState<any[]>([]);
  const [loadingContents, setLoadingContents] = useState(true);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, loading, router]);

  useEffect(() => {
    const fetchContents = async () => {
      if (!isAdmin) return;
      try {
        const q = query(collection(db, 'contents'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        setContents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching contents: ", error);
      } finally {
        setLoadingContents(false);
      }
    };
    if (isAdmin) {
      fetchContents();
    }
  }, [isAdmin]);

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Tem certeza que deseja excluir '${title}'?`)) {
      try {
        await deleteDoc(doc(db, 'contents', id));
        setContents(c => c.filter(item => item.id !== id));
      } catch (error) {
        console.error("Error deleting content: ", error);
        alert("Erro ao excluir.");
      }
    }
  };

  if (loading || loadingContents) {
    return <div className="min-h-screen bg-[#0A0C10] flex flex-col items-center justify-center text-white pt-24"><p>Carregando...</p></div>;
  }

  if (!isAdmin) {
    return null; // Will redirect
  }

  return (
    <main className="min-h-screen bg-[#0A0C10] text-white pt-24 pb-20 px-8">
      <div className="max-w-6xl mx-auto pl-20">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 text-[#8A93A6] hover:text-white bg-[#131520] rounded-lg transition-colors border border-white/5" title="Voltar ao site">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="flex-1 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Painel de Administração</h1>
              <p className="text-[#8A93A6]">Gerencie o catálogo de filmes, séries e animes do StreamVerse.</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={async () => {
                  if (confirm('Atenção: Isso vai excluir TODOS os animes do banco de dados. Tem certeza?')) {
                    try {
                      const { collection, getDocs, query, where, doc, deleteDoc } = await import('firebase/firestore/lite');
                      const { db } = await import('@/lib/firebase');
                      const q = query(collection(db, 'contents'), where('type', '==', 'anime'));
                      const snapshot = await getDocs(q);
                      if (snapshot.empty) {
                        alert('Nenhum anime encontrado para apagar.');
                        return;
                      }
                      
                      let count = 0;
                      for (const d of snapshot.docs) {
                        await deleteDoc(doc(db, 'contents', d.id));
                        count++;
                      }
                      
                      alert(`Foram apagados ${count} animes com sucesso! Atualize a página.`);
                      window.location.reload();
                    } catch (e: any) {
                      console.error(e);
                      alert('Erro ao apagar animes: ' + e.message);
                    }
                  }
                }}
                className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600 border border-red-600 transition-colors text-white px-5 py-2.5 rounded-lg font-semibold"
              >
                <Trash2 className="size-5" />
                Apagar Animes
              </button>
              <Link 
                href="/admin/catalogo/tmdb"
                className="flex items-center gap-2 bg-[#3D5AFE] hover:bg-[#324BE6] text-white px-5 py-2.5 rounded-lg font-semibold transition-colors shadow-lg"
              >
                Integração TMDB / EmbedMovies
              </Link>
              <Link 
                href="/admin/contents/new"
                className="flex items-center gap-2 bg-[#8F44FF] hover:bg-[#7B2EFF] text-white px-5 py-2.5 rounded-lg font-semibold transition-colors shadow-lg shadow-[#8F44FF]/20"
              >
                <Plus className="size-5" />
                Novo Conteúdo
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-[#131520] border border-white/5 rounded-xl overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-[#171926]">
                <th className="p-5 text-xs uppercase tracking-wider font-semibold text-[#8A93A6]">Título</th>
                <th className="p-5 text-xs uppercase tracking-wider font-semibold text-[#8A93A6]">Tipo</th>
                <th className="p-5 text-xs uppercase tracking-wider font-semibold text-[#8A93A6]">Ano</th>
                <th className="p-5 text-xs uppercase tracking-wider font-semibold text-[#8A93A6] text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {contents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-[#8A93A6] bg-white/[0.01]">
                    <div className="flex flex-col items-center gap-3">
                      <Video className="size-10 text-[#8A93A6]/40" />
                      <p>Nenhum conteúdo cadastrado ainda.</p>
                      <Link 
                        href="/admin/contents/new"
                        className="text-[#8F44FF] hover:underline"
                      >
                        Adicionar seu primeiro conteúdo
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                contents.map(content => (
                  <tr key={content.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        {content.thumbnailImage ? (
                          <div className="w-14 h-20 relative bg-[#2A2D3A] rounded-md shadow-md border border-white/5 overflow-hidden shrink-0">
                            <Image src={content.thumbnailImage} alt={content.title} fill className="object-cover" unoptimized />
                          </div>
                        ) : (
                          <div className="w-14 h-20 bg-[#2A2D3A] rounded-md flex items-center justify-center shrink-0 border border-white/5">
                            <Video className="size-5 text-[#8A93A6]" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-[15px]">{content.title}</p>
                          <p className="text-xs text-[#8A93A6] line-clamp-1 mt-1 font-mono">{content.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-[#8F44FF]/10 text-[#A661FF]">
                        {content.type === 'movie' ? 'Filme' : content.type === 'series' ? 'Série' : 'Anime'}
                      </span>
                    </td>
                    <td className="p-5 text-[#8A93A6] font-medium">{content.year}</td>
                    <td className="p-5">
                      <div className="flex items-center justify-end gap-3">
                        {content.type !== 'movie' && (
                          <Link 
                            href={`/admin/contents/${content.id}/episodes`}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#8A93A6] hover:text-[#A661FF] hover:bg-[#8F44FF]/10 rounded-lg transition-colors border border-transparent hover:border-[#8F44FF]/20"
                            title="Gerenciar Episódios"
                          >
                            <ListVideo className="size-3.5" />
                            Episódios
                          </Link>
                        )}
                        <Link 
                          href={`/admin/contents/${content.id}/edit`}
                          className="p-2 text-[#8A93A6] hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10"
                          title="Editar"
                        >
                          <Edit2 className="size-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(content.id, content.title)}
                          className="p-2 text-[#8A93A6] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors border border-transparent hover:border-red-400/20"
                          title="Excluir"
                        >
                          <Trash2 className="size-4" />
                        </button>
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
