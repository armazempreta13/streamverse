'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp, updateDoc, doc, increment } from 'firebase/firestore/lite';
import { MessageSquare, Smile, ThumbsUp, CornerDownRight, MoreHorizontal, Heart, ChevronLeft, ChevronRight, ChevronDown, Loader2 } from 'lucide-react';

interface CommentSectionProps {
  contentId: string;
  theme?: 'default' | 'anime';
}

interface Comment {
  id: string;
  contentId: string;
  userName: string;
  text: string;
  createdAt: any;
  likes: number;
  parentId?: string;
}

export function CommentSection({ contentId, theme = 'default' }: CommentSectionProps) {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // States for the new features
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojis = ['😂', '😍', '🔥', '😭', '👏', '🙌', '🤔', '👀', '❤️', '✨', '💀', '💯'];
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 5;

  const themeColor = theme === 'anime' ? '#FF3366' : '#8F44FF';

  useEffect(() => {
    fetchComments();
  }, [contentId]);

  const fetchComments = async () => {
    try {
      const q = query(
        collection(db, 'comments'), 
        where('contentId', '==', contentId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Comment[];
      setComments(data);
    } catch (e) {
      console.error("Error fetching comments:", e);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setLoading(true);
    try {
      // Create a temporary ID based on localStorage or just use "User"
      let userName = localStorage.getItem('streamverse_username');
      if (!userName) {
        userName = "Usuário " + Math.floor(Math.random() * 10000);
        localStorage.setItem('streamverse_username', userName);
      }

      await addDoc(collection(db, 'comments'), {
        contentId,
        userName,
        text: comment.trim(),
        createdAt: serverTimestamp(),
        likes: 0,
        ...(replyingTo ? { parentId: replyingTo } : {})
      });
      
      setComment('');
      setReplyingTo(null);
      fetchComments();
    } catch (e) {
      console.error("Error adding comment:", e);
      alert("Erro ao enviar comentário.");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (commentId: string) => {
    const liked = localStorage.getItem(`liked_${commentId}`);
    if (liked) return; // Prevent multiple likes from same browser

    try {
      localStorage.setItem(`liked_${commentId}`, 'true');
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c));
      await updateDoc(doc(db, 'comments', commentId), {
        likes: increment(1)
      });
    } catch (e) {
      console.error("Error liking comment:", e);
    }
  };

  // Organize comments into root and replies
  const { rootComments, repliesMap } = useMemo(() => {
    const root: Comment[] = [];
    const map: Record<string, Comment[]> = {};

    comments.forEach(c => {
      if (c.parentId) {
        if (!map[c.parentId]) map[c.parentId] = [];
        map[c.parentId].push(c);
      } else {
        root.push(c);
      }
    });

    if (sortBy === 'popular') {
      root.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else {
      root.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
    }

    return { rootComments: root, repliesMap: map };
  }, [comments, sortBy]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(rootComments.length / commentsPerPage));
  const currentComments = rootComments.slice((currentPage - 1) * commentsPerPage, currentPage * commentsPerPage);

  const renderComment = (c: Comment, isReply = false) => {
    const isLiked = typeof window !== 'undefined' ? localStorage.getItem(`liked_${c.id}`) : false;
    const initial = c.userName ? c.userName.substring(0, 1).toUpperCase() : 'U';

    return (
      <div key={c.id} className={`flex gap-4 ${isReply ? 'ml-12 mt-4 relative before:content-[""] before:absolute before:left-[-24px] before:top-[-20px] before:w-[2px] before:h-[40px] before:bg-white/5 before:rounded-bl-xl after:content-[""] after:absolute after:left-[-24px] after:top-[20px] after:w-[12px] after:h-[2px] after:bg-white/5' : 'pt-6 border-t border-white/5 first:border-0 first:pt-0'}`}>
        <div className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 shadow-lg ${theme === 'anime' ? 'bg-[#FF3366]/10 border-[#FF3366]/30 shadow-[#FF3366]/20' : 'bg-[#8F44FF]/10 border-[#8F44FF]/30 shadow-[#8F44FF]/20'}`}>
          <span className="font-bold text-sm" style={{ color: themeColor }}>{initial}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-bold text-white">{c.userName}</span>
              <span className="text-[#5C6370] text-[10px]">•</span>
              <span className="text-[11px] text-[#5C6370]">
                {c.createdAt ? new Date(c.createdAt.seconds * 1000).toLocaleDateString('pt-BR') : 'Agora'}
              </span>
            </div>
          </div>
          
          <p className="text-[14px] text-[#A1ABBF] leading-relaxed break-words mb-3">
            {c.text}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => handleLike(c.id)}
                className={`flex items-center gap-2 text-[12px] font-medium transition-colors ${isLiked ? 'text-white' : 'text-[#8A93A6] hover:text-white'}`}
              >
                <ThumbsUp className={`size-3.5 ${isLiked ? 'fill-current' : ''}`} />
                Curtir
              </button>
              
              {!isReply && (
                <button 
                  onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
                  className="flex items-center gap-2 text-[12px] font-medium text-[#8A93A6] hover:text-white transition-colors"
                >
                  <CornerDownRight className="size-3.5" />
                  Responder
                </button>
              )}
              
              <button className="text-[#8A93A6] hover:text-white transition-colors">
                <MoreHorizontal className="size-4" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => handleLike(c.id)}
                className={`flex items-center gap-1.5 text-[12px] font-medium transition-colors ${isLiked ? 'text-white' : 'text-[#8A93A6] hover:text-[#FF3366]'}`}
              >
                <Heart className={`size-3.5 ${isLiked ? 'fill-[#FF3366] text-[#FF3366]' : ''}`} />
                {c.likes || 0}
              </button>
              <button className="text-[#8A93A6] hover:text-white transition-colors hidden sm:block">
                <MoreHorizontal className="size-4" />
              </button>
            </div>
          </div>

          {/* Render Replies */}
          {repliesMap[c.id] && repliesMap[c.id].map(reply => renderComment(reply, true))}
        </div>
      </div>
    );
  };

  return (
    <div className="relative z-[100] bg-[#0A0A16] border border-white/5 rounded-[24px] p-6 sm:p-8 w-full mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <MessageSquare className="size-5" style={{ color: themeColor }} />
            <h3 className="text-xl font-bold text-white">Comentários</h3>
            <span className="bg-white/5 text-[#FF3366] text-xs font-bold px-2 py-0.5 rounded-md">
              {comments.length}
            </span>
          </div>
          <p className="text-[#8A93A6] text-sm mt-1">Compartilhe sua opinião sobre este conteúdo</p>
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-2 text-[#8A93A6] hover:text-white transition-colors text-sm font-medium"
          >
            {sortBy === 'recent' ? 'Mais recentes' : 'Populares'}
            <ChevronDown className={`size-4 transition-transform duration-300 ${showSortMenu ? 'rotate-180' : ''}`} />
          </button>
          
          {showSortMenu && (
            <div className="absolute right-0 top-full mt-2 w-40 bg-[#131520] border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <button 
                onClick={() => { setSortBy('recent'); setShowSortMenu(false); }} 
                className={`w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors ${sortBy === 'recent' ? 'text-white font-bold' : 'text-[#8A93A6]'}`}
              >
                Mais recentes
              </button>
              <button 
                onClick={() => { setSortBy('popular'); setShowSortMenu(false); }} 
                className={`w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors border-t border-white/5 ${sortBy === 'popular' ? 'text-white font-bold' : 'text-[#8A93A6]'}`}
              >
                Populares
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Input Box */}
      <div className="flex gap-4 mb-10">
        <div className={`w-12 h-12 rounded-full border flex items-center justify-center shrink-0 shadow-lg ${theme === 'anime' ? 'bg-[#FF3366]/10 border-[#FF3366]/30 text-[#FF3366]' : 'bg-[#8F44FF]/10 border-[#8F44FF]/30 text-[#8F44FF]'}`}>
          <span className="font-bold">
            {typeof window !== 'undefined' ? (localStorage.getItem('streamverse_username')?.[0]?.toUpperCase() || 'U') : 'U'}
          </span>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 relative">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={replyingTo ? "Respondendo ao comentário..." : "Escreva seu comentário..."}
            className="w-full h-12 bg-[#131520] border border-white/5 rounded-full pl-6 pr-32 text-sm text-white outline-none focus:border-white/20 transition-all placeholder:text-[#5C6370]"
          />
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button 
              type="button" 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`hover:text-white transition-colors p-2 ${showEmojiPicker ? 'text-white' : 'text-[#5C6370]'}`}
            >
              <Smile className="size-5" />
            </button>
            <button 
              type="submit"
              disabled={loading || !comment.trim()}
              className="text-white px-5 h-9 rounded-full font-bold text-sm transition-all shadow-lg disabled:opacity-50"
              style={{ backgroundColor: themeColor, boxShadow: `0 4px 15px ${themeColor}40` }}
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : 'Enviar'}
            </button>
          </div>

          {showEmojiPicker && (
            <div className="absolute right-0 bottom-full mb-4 bg-[#131520] border border-white/10 rounded-xl p-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] grid grid-cols-4 gap-2 z-50 animate-in fade-in slide-in-from-bottom-2">
              {emojis.map(emoji => (
                <button 
                  key={emoji}
                  type="button" 
                  onClick={() => { setComment(prev => prev + emoji); setShowEmojiPicker(false); }}
                  className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg text-xl transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {fetching ? (
          <div className="flex justify-center py-12">
            <Loader2 className="size-8 animate-spin" style={{ color: themeColor }} />
          </div>
        ) : rootComments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#8A93A6] text-sm">Ninguém comentou ainda. Seja o primeiro!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {currentComments.map(c => renderComment(c))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-10 pt-6 border-t border-white/5">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#131520] text-[#8A93A6] hover:text-white disabled:opacity-50 transition-colors"
          >
            <ChevronLeft className="size-4" />
          </button>
          
          <div 
            className="w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm text-white shadow-lg"
            style={{ backgroundColor: themeColor, boxShadow: `0 4px 15px ${themeColor}40` }}
          >
            {currentPage}
          </div>

          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#131520] text-[#8A93A6] hover:text-white disabled:opacity-50 transition-colors"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
