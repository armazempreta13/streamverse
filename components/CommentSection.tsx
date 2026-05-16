'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp, limit } from 'firebase/firestore/lite';
import { MessageSquare, User, Mail, Send, Loader2 } from 'lucide-react';

interface CommentSectionProps {
  contentId: string;
  theme?: 'default' | 'anime';
}

export function CommentSection({ contentId, theme = 'default' }: CommentSectionProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [contentId]);

  const fetchComments = async () => {
    try {
      const q = query(
        collection(db, 'comments'), 
        where('contentId', '==', contentId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComments(data);
    } catch (e) {
      console.error("Error fetching comments:", e);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim() || !email.trim()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'comments'), {
        contentId,
        userName: name.trim(),
        userEmail: email.trim(),
        text: comment.trim(),
        createdAt: serverTimestamp(),
        approved: true // Auto-approve for now as requested
      });
      
      setName('');
      setEmail('');
      setComment('');
      setSuccess(true);
      fetchComments();
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error("Error adding comment:", e);
      alert("Erro ao enviar comentário. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-8">
      {/* Comment Form */}
      <div className="bg-[#131520] border border-white/5 p-6 md:p-8 rounded-[24px] shadow-xl">
        <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <MessageSquare className={`size-5 ${theme === 'anime' ? 'text-[#FF3366]' : 'text-[#8F44FF]'}`} />
          Diga o que você achou
        </h4>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#8A93A6]" />
              <input 
                type="text" 
                placeholder="Seu nome" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={`w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-[#5C6370] ${theme === 'anime' ? 'focus:border-[#FF3366]/50' : 'focus:border-[#8F44FF]/50'}`}
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#8A93A6]" />
              <input 
                type="email" 
                placeholder="Seu e-mail" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-[#5C6370] ${theme === 'anime' ? 'focus:border-[#FF3366]/50' : 'focus:border-[#8F44FF]/50'}`}
              />
            </div>
          </div>
          
          <textarea 
            placeholder="Escreva seu comentário aqui..." 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            rows={4}
            className={`w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white outline-none transition-all placeholder:text-[#5C6370] resize-none ${theme === 'anime' ? 'focus:border-[#FF3366]/50' : 'focus:border-[#8F44FF]/50'}`}
          />
          
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-[#5C6370]">Seu e-mail não será exibido publicamente.</p>
            <button 
              type="submit" 
              disabled={loading}
              className={`text-white px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-50 ${
                theme === 'anime' 
                  ? 'bg-[#FF3366] hover:bg-[#FF6699] shadow-lg shadow-[#FF3366]/20' 
                  : 'bg-[#8F44FF] hover:bg-[#A661FF] shadow-lg shadow-[#8F44FF]/20'
              }`}
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              {loading ? 'Enviando...' : 'Publicar Comentário'}
            </button>
          </div>
          
          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-center text-sm animate-in fade-in slide-in-from-top-2">
              Comentário enviado com sucesso!
            </div>
          )}
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        <h4 className="text-sm font-black text-[#5C6370] uppercase tracking-[0.2em] px-2">Comentários Recentes ({comments.length})</h4>
        
        {fetching ? (
          <div className="flex justify-center py-12">
            <Loader2 className={`size-8 animate-spin ${theme === 'anime' ? 'text-[#FF3366]' : 'text-[#8F44FF]'}`} />
          </div>
        ) : comments.length === 0 ? (
          <div className="bg-[#131520]/50 border border-dashed border-white/5 p-12 rounded-[24px] text-center">
            <p className="text-[#8A93A6] text-sm">Ninguém comentou ainda. Seja o primeiro!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {comments.map((c) => (
              <div key={c.id} className="bg-[#131520]/80 border border-white/5 p-5 rounded-2xl flex gap-4 animate-in fade-in duration-500">
                <div className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 ${
                  theme === 'anime' ? 'bg-[#FF3366]/20 border-[#FF3366]/20' : 'bg-[#8F44FF]/20 border-[#8F44FF]/20'
                }`}>
                  <span className={`font-black text-sm ${theme === 'anime' ? 'text-[#FF3366]' : 'text-[#A661FF]'}`}>{c.userName.substring(0, 1).toUpperCase()}</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-white">{c.userName}</span>
                    <span className="text-[10px] text-[#5C6370]">• {c.createdAt ? new Date(c.createdAt.seconds * 1000).toLocaleDateString('pt-BR') : 'Agora'}</span>
                  </div>
                  <p className="text-[13px] text-[#8A93A6] leading-relaxed break-words">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
