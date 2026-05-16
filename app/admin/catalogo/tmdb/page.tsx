'use client';

import React, { useState } from 'react';
import { ArrowLeft, Search, CheckCircle2, Film } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';

export default function TmdbImportPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  const [apiKey, setApiKey] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'movie' | 'tv'>('movie');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);

  if (loading) return null;
  if (!isAdmin) {
    router.push('/');
    return null;
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey || !searchQuery) return alert('Insira a chave da API do TMDB e o termo de busca.');
    
    setIsSearching(true);
    try {
      const url = `https://api.themoviedb.org/3/search/${searchType}?api_key=${apiKey}&language=pt-BR&query=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.results) {
        setResults(data.results.slice(0, 10)); // pega top 10
      } else {
        alert('Nenhum resultado ou chave inválida.');
      }
    } catch (error: any) {
      alert('Erro na busca: ' + error.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleImport = async (item: any) => {
    const itemName = searchType === 'movie' ? item.title : item.name;
    if (!confirm(`Deseja importar "${itemName}" diretamente para o catálogo com o link do EmbedMovies?`)) return;
    setImportingId(item.id.toString());
    
    try {
      const detailUrl = `https://api.themoviedb.org/3/${searchType}/${item.id}?api_key=${apiKey}&language=pt-BR`;
      const detailRes = await fetch(detailUrl);
      const tmdbData = await detailRes.json();

      const originalName = searchType === 'movie' ? tmdbData.original_title : tmdbData.original_name;
      const slug = itemName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      const q = query(collection(db, 'contents'), where('slug', '==', slug));
      const snap = await getDocs(q);
      if (!snap.empty) {
         alert('Uma obra com este nome já existe no catálogo!');
         setImportingId(null);
         return;
      }

      const videoUrl = searchType === 'movie' 
        ? `https://myembed.biz/filme/${tmdbData.id}`
        : `https://myembed.biz/serie/${tmdbData.id}`;

      const genres = tmdbData.genres?.map((g: any) => g.name) || (searchType === 'movie' ? ['Filme'] : ['Série']);
      
      const content = {
        title: itemName,
        originalTitle: originalName,
        slug,
        description: tmdbData.overview || 'Sinopse indisponível.',
        coverImage: tmdbData.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}` : '',
        heroImage: tmdbData.backdrop_path ? `https://image.tmdb.org/t/p/original${tmdbData.backdrop_path}` : '',
        thumbnailImage: tmdbData.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}` : '',
        type: searchType === 'movie' ? 'movie' : 'series',
        seasons: searchType === 'tv' ? tmdbData.number_of_seasons : undefined,
        year: searchType === 'movie' 
          ? (tmdbData.release_date ? parseInt(tmdbData.release_date.split('-')[0]) : new Date().getFullYear())
          : (tmdbData.first_air_date ? parseInt(tmdbData.first_air_date.split('-')[0]) : new Date().getFullYear()),
        categories: genres,
        genres: genres,
        score: tmdbData.vote_average?.toFixed(1) || '0.0',
        videoUrl, 
        status: tmdbData.status === 'Ended' ? 'Finalizado' : 'Em Lançamento',
        searchTerms: [slug, itemName.toLowerCase()],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'contents'), content);
      alert(`Obra "${itemName}" adicionada com sucesso!`);
      
    } catch (err: any) {
      alert('Erro ao salvar no banco: ' + err.message);
    } finally {
      setImportingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0C10] text-white pt-24 pb-20 px-8">
      <div className="max-w-4xl mx-auto pl-20">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="p-2 text-[#8A93A6] hover:text-white bg-[#131520] rounded-lg transition-colors border border-white/5">
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Buscar TMDb + EmbedMovies</h1>
            <p className="text-[#8A93A6]">Encontre filmes e integre automaticamente o player do EmbedMovies.org</p>
          </div>
        </div>

        <div className="bg-[#131520] border border-white/5 p-6 rounded-2xl mb-8">
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
             <div>
               <label className="block text-sm font-medium text-[#8A93A6] mb-1">Chave de API do TMDb (v3)</label>
               <input 
                 type="text" 
                 value={apiKey}
                 onChange={(e) => setApiKey(e.target.value)}
                 className="w-full bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#3D5AFE]"
                 placeholder="Sua chave de API do TMDB..."
                 required
               />
               <p className="text-xs text-[#8A93A6] mt-1">
                 Obtenha em <a href="https://www.themoviedb.org/settings/api" target="_blank" className="text-[#3D5AFE] hover:underline" rel="noreferrer">tmdb.org</a>. (Não guardamos esta chave).
               </p>
             </div>
             
             <div>
               <label className="block text-sm font-medium text-[#8A93A6] mb-1">Título da Obra</label>
               <div className="flex gap-2">
                 <select 
                   className="bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#3D5AFE]"
                   value={searchType}
                   onChange={(e) => setSearchType(e.target.value as 'movie' | 'tv')}
                 >
                   <option value="movie">Filme</option>
                   <option value="tv">Série</option>
                 </select>
                 <input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="flex-1 bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#3D5AFE]"
                   placeholder="Ex: Clube da Luta"
                   required
                 />
                 <button 
                   type="submit" 
                   disabled={isSearching}
                   className="bg-[#3D5AFE] hover:bg-[#324BE6] text-white px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                 >
                   {isSearching ? 'Buscando...' : <><Search className="size-5" /> Buscar</>}
                 </button>
               </div>
             </div>
          </form>
        </div>

        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Resultados ({results.length})</h2>
            {results.map((movie) => {
              const itemTitle = searchType === 'movie' ? movie.title : movie.name;
              const itemDate = searchType === 'movie' ? movie.release_date : movie.first_air_date;

              return (
              <div key={movie.id} className="bg-[#131520] border border-white/5 rounded-xl p-4 flex gap-4 items-center">
                 {movie.poster_path ? (
                   <div className="w-16 h-24 shrink-0 relative rounded-md overflow-hidden bg-[#0A0C10]">
                     <Image src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt={itemTitle} fill className="object-cover" unoptimized/>
                   </div>
                 ) : (
                   <div className="w-16 h-24 shrink-0 rounded-md bg-[#0A0C10] flex items-center justify-center border border-white/5">
                     <Film className="size-6 text-[#8A93A6]" />
                   </div>
                 )}
                 <div className="flex-1">
                   <h3 className="font-bold text-lg">{itemTitle}</h3>
                   <p className="text-sm text-[#8A93A6] mb-1">{itemDate ? itemDate.split('-')[0] : 'Ano desconhecido'}</p>
                   <p className="text-sm text-[#8A93A6] line-clamp-2 md:line-clamp-1">{movie.overview}</p>
                 </div>
                 <div>
                   <button 
                     onClick={() => handleImport(movie)}
                     disabled={importingId === movie.id.toString()}
                     className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                   >
                     {importingId === movie.id.toString() ? 'Importando...' : <><CheckCircle2 className="size-4" /> Importar</>}
                   </button>
                 </div>
              </div>
            )})}
          </div>
        )}

      </div>
    </main>
  );
}
