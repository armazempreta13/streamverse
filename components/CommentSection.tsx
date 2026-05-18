'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp, updateDoc, doc, increment, arrayUnion, arrayRemove } from 'firebase/firestore/lite';
import { MessageSquare, Heart, CornerDownRight, ChevronDown, Loader2, Smile, Send, Flag, ThumbsUp, ThumbsDown, Star, Flame, Laugh } from 'lucide-react';
import { moderateComment, checkRateLimit } from '@/lib/comment-moderation';

interface CommentSectionProps { contentId: string; theme?: 'default' | 'anime'; }

interface Comment {
  id: string; contentId: string; userName: string; userColor: string;
  text: string; createdAt: any; likes: number; dislikes: number;
  reactions: Record<string, number>; parentId?: string; likedBy?: string[]; dislikedBy?: string[];
}

const REACTIONS = [
  { emoji: '🔥', label: 'Fire', key: 'fire' },
  { emoji: '😂', label: 'Funny', key: 'funny' },
  { emoji: '😭', label: 'Sad', key: 'sad' },
  { emoji: '👏', label: 'Clap', key: 'clap' },
  { emoji: '🤯', label: 'Mind blown', key: 'mind' },
  { emoji: '❤️', label: 'Love', key: 'love' },
  { emoji: '😴', label: 'Boring', key: 'boring' },
  { emoji: '⚡', label: 'Epic', key: 'epic' },
];

const EMOJIS = ['😂','😍','🔥','😭','👏','🙌','🤔','👀','❤️','✨','💀','💯','😤','🥹','🫡','😱'];

const USER_COLORS = ['#8F44FF','#FF3366','#00D4FF','#FFB800','#00FF88','#FF6B35','#A855F7','#06B6D4'];

function getUserColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

function timeAgo(seconds: number): string {
  const diff = Math.floor(Date.now() / 1000) - seconds;
  if (diff < 60) return 'agora';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(seconds * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function getUserId(): string {
  try {
    let id = localStorage.getItem('sv_uid');
    if (!id) { id = crypto.randomUUID(); localStorage.setItem('sv_uid', id); }
    return id;
  } catch { return 'anon'; }
}

export function CommentSection({ contentId, theme = 'default' }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [activeReactionPicker, setActiveReactionPicker] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('anon');
  const inputRef = useRef<HTMLInputElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const accentColor = theme === 'anime' ? '#FF3366' : '#8F44FF';

  // Init username and user id
  useEffect(() => {
    setCurrentUserId(getUserId());
    try {
      const saved = localStorage.getItem('streamverse_username');
      if (saved) { setUserName(saved); }
      else { const n = 'Usuário ' + Math.floor(Math.random() * 9999); setUserName(n); localStorage.setItem('streamverse_username', n); }
    } catch {}
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setShowSortMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchComments = async () => {
    setFetching(true);
    try {
      const q = query(collection(db, 'comments'), where('contentId', '==', contentId), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Comment[]);
    } catch (e) { console.error(e); }
    finally { setFetching(false); }
  };

  useEffect(() => { fetchComments(); }, [contentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const t = text.trim();
    if (!t) return;

    // Rate limit
    if (!checkRateLimit()) { setError('Você está enviando comentários muito rápido. Aguarde um momento.'); return; }

    // Recent history for duplicate check
    const history = comments.filter(c => c.userName === userName).slice(0, 5).map(c => c.text);
    const mod = moderateComment(t, history);
    if (!mod.ok) { setError(mod.reason); return; }

    setLoading(true);
    try {
      const color = getUserColor(userName);
      await addDoc(collection(db, 'comments'), {
        contentId, userName, userColor: color,
        text: t, createdAt: serverTimestamp(),
        likes: 0, dislikes: 0,
        reactions: {}, likedBy: [], dislikedBy: [],
        ...(replyTo ? { parentId: replyTo.id } : {}),
      });
      setText(''); setReplyTo(null);
      await fetchComments();
    } catch { setError('Erro ao enviar comentário. Tente novamente.'); }
    finally { setLoading(false); }
  };

  const handleLike = async (commentId: string) => {
    const uid = getUserId();
    const c = comments.find(x => x.id === commentId);
    if (!c) return;
    const liked = c.likedBy?.includes(uid);
    try {
      await updateDoc(doc(db, 'comments', commentId), liked
        ? { likes: increment(-1), likedBy: arrayRemove(uid) }
        : { likes: increment(1), likedBy: arrayUnion(uid), dislikedBy: arrayRemove(uid) }
      );
      setComments(prev => prev.map(x => x.id === commentId
        ? { ...x, likes: liked ? x.likes - 1 : x.likes + 1, likedBy: liked ? x.likedBy?.filter(id => id !== uid) : [...(x.likedBy || []), uid], dislikedBy: x.dislikedBy?.filter(id => id !== uid) }
        : x));
    } catch {}
  };

  const handleDislike = async (commentId: string) => {
    const uid = getUserId();
    const c = comments.find(x => x.id === commentId);
    if (!c) return;
    const disliked = c.dislikedBy?.includes(uid);
    try {
      await updateDoc(doc(db, 'comments', commentId), disliked
        ? { dislikes: increment(-1), dislikedBy: arrayRemove(uid) }
        : { dislikes: increment(1), dislikedBy: arrayUnion(uid), likedBy: arrayRemove(uid) }
      );
      setComments(prev => prev.map(x => x.id === commentId
        ? { ...x, dislikes: disliked ? x.dislikes - 1 : x.dislikes + 1, dislikedBy: disliked ? x.dislikedBy?.filter(id => id !== uid) : [...(x.dislikedBy || []), uid], likedBy: x.likedBy?.filter(id => id !== uid) }
        : x));
    } catch {}
  };

  const handleReaction = async (commentId: string, key: string) => {
    setActiveReactionPicker(null);
    const c = comments.find(x => x.id === commentId);
    if (!c) return;
    const current = c.reactions?.[key] || 0;
    try {
      await updateDoc(doc(db, 'comments', commentId), { [`reactions.${key}`]: increment(1) });
      setComments(prev => prev.map(x => x.id === commentId
        ? { ...x, reactions: { ...x.reactions, [key]: current + 1 } }
        : x));
    } catch {}
  };

  const saveName = () => {
    const n = tempName.trim();
    if (n.length < 2 || n.length > 30) return;
    const mod = moderateComment(n);
    if (!mod.ok) return;
    setUserName(n);
    try { localStorage.setItem('streamverse_username', n); } catch {}
    setEditingName(false);
  };

  // Organize comments
  const { rootComments, repliesMap } = useMemo(() => {
    const root: Comment[] = [];
    const map: Record<string, Comment[]> = {};
    comments.forEach(c => {
      if (c.parentId) { if (!map[c.parentId]) map[c.parentId] = []; map[c.parentId].push(c); }
      else root.push(c);
    });
    if (sortBy === 'popular') root.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    else root.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    return { rootComments: root, repliesMap: map };
  }, [comments, sortBy]);

  const renderComment = (c: Comment, isReply = false) => {
    const uid = currentUserId;
    const liked = c.likedBy?.includes(uid);
    const disliked = c.dislikedBy?.includes(uid);
    const color = c.userColor || getUserColor(c.userName || '');
    const totalReactions = Object.values(c.reactions || {}).reduce((a, b) => a + b, 0);
    const topReactions = Object.entries(c.reactions || {}).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 3);

    return (
      <div key={c.id} className={isReply ? 'ml-12 mt-3' : ''}>
        <div className="flex gap-3 group/comment">
          {/* Avatar */}
          <div className="shrink-0">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold text-white shadow-lg"
              style={{ background: `linear-gradient(135deg, ${color}cc, ${color}44)`, border: `1.5px solid ${color}50` }}>
              {getInitials(c.userName || 'U')}
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 min-w-0">
            <div className="bg-[#0F1018] border border-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3 relative">
              {/* Name + time */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[13px] font-bold" style={{ color }}>{c.userName}</span>
                {isReply && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/30 font-medium">resposta</span>}
                <span className="text-[11px] text-white/20 ml-auto">{c.createdAt ? timeAgo(c.createdAt.seconds) : 'agora'}</span>
              </div>

              {/* Text */}
              <p className="text-[14px] text-[#C1C9D8] leading-relaxed break-words">{c.text}</p>

              {/* Reactions row */}
              {topReactions.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2">
                  {topReactions.map(([key, count]) => {
                    const r = REACTIONS.find(x => x.key === key);
                    return r ? (
                      <span key={key} className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-[12px]">
                        {r.emoji} <span className="text-white/50 text-[10px]">{count}</span>
                      </span>
                    ) : null;
                  })}
                  {totalReactions > 0 && (
                    <span className="text-[10px] text-white/20 ml-1">{totalReactions} reações</span>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 mt-1.5 pl-1">
              {/* Like */}
              <button onClick={() => handleLike(c.id)}
                className={`flex items-center gap-1.5 text-[12px] font-medium transition-colors ${liked ? 'text-[#8F44FF]' : 'text-white/30 hover:text-white/70'}`}>
                <ThumbsUp className={`size-3.5 ${liked ? 'fill-[#8F44FF]' : ''}`} />
                <span>{c.likes || 0}</span>
              </button>

              {/* Dislike */}
              <button onClick={() => handleDislike(c.id)}
                className={`flex items-center gap-1.5 text-[12px] font-medium transition-colors ${disliked ? 'text-red-400' : 'text-white/30 hover:text-white/70'}`}>
                <ThumbsDown className={`size-3.5 ${disliked ? 'fill-red-400' : ''}`} />
                <span>{c.dislikes || 0}</span>
              </button>

              {/* Reaction picker */}
              <div className="relative">
                <button onClick={() => setActiveReactionPicker(activeReactionPicker === c.id ? null : c.id)}
                  className="flex items-center gap-1 text-[12px] text-white/30 hover:text-white/70 transition-colors">
                  <Smile className="size-3.5" /> Reagir
                </button>
                {activeReactionPicker === c.id && (
                  <div className="absolute bottom-full left-0 mb-2 bg-[#131520] border border-white/10 rounded-2xl p-2 flex gap-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2">
                    {REACTIONS.map(r => (
                      <button key={r.key} onClick={() => handleReaction(c.id, r.key)}
                        title={r.label}
                        className="w-9 h-9 flex items-center justify-center text-lg hover:bg-white/10 rounded-xl transition-all hover:scale-125">
                        {r.emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Reply */}
              {!isReply && (
                <button onClick={() => { setReplyTo({ id: c.id, name: c.userName }); inputRef.current?.focus(); }}
                  className="flex items-center gap-1 text-[12px] text-white/30 hover:text-white/70 transition-colors">
                  <CornerDownRight className="size-3.5" /> Responder
                </button>
              )}
            </div>

            {/* Replies toggle */}
            {!isReply && repliesMap[c.id]?.length > 0 && (
              <button onClick={() => setExpandedReplies(prev => {
                const next = new Set(prev);
                next.has(c.id) ? next.delete(c.id) : next.add(c.id);
                return next;
              })}
                className="flex items-center gap-1.5 mt-2 pl-1 text-[12px] font-semibold transition-colors"
                style={{ color: accentColor }}>
                <CornerDownRight className="size-3" />
                {expandedReplies.has(c.id) ? 'Ocultar' : `Ver ${repliesMap[c.id].length} resposta${repliesMap[c.id].length > 1 ? 's' : ''}`}
              </button>
            )}

            {/* Replies list */}
            {!isReply && expandedReplies.has(c.id) && repliesMap[c.id] && (
              <div className="mt-2 space-y-3 pl-1 border-l-2 border-white/5">
                {repliesMap[c.id].map(r => renderComment(r, true))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative z-[100] w-full mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded-full" style={{ background: accentColor }} />
          <h3 className="text-[20px] font-bold text-white">Comentários</h3>
          <span className="text-[12px] font-bold px-2.5 py-0.5 rounded-full border"
            style={{ color: accentColor, borderColor: `${accentColor}40`, background: `${accentColor}10` }}>
            {rootComments.length}
          </span>
        </div>

        {/* Sort */}
        <div ref={sortRef} className="relative">
          <button onClick={() => setShowSortMenu(s => !s)}
            className="flex items-center gap-1.5 text-[13px] text-white/40 hover:text-white transition-colors font-medium">
            {sortBy === 'recent' ? 'Mais recentes' : 'Mais curtidos'}
            <ChevronDown className={`size-3.5 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
          </button>
          {showSortMenu && (
            <div className="absolute right-0 top-full mt-2 w-44 bg-[#131520] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
              {(['recent', 'popular'] as const).map(s => (
                <button key={s} onClick={() => { setSortBy(s); setShowSortMenu(false); }}
                  className={`w-full text-left px-4 py-3 text-[13px] transition-colors hover:bg-white/5 ${sortBy === s ? 'text-white font-bold' : 'text-white/40'}`}>
                  {s === 'recent' ? '🕐 Mais recentes' : '🔥 Mais curtidos'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Username editor */}
      <div className="flex items-center gap-3 mb-5 p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
          style={{ background: `linear-gradient(135deg, ${getUserColor(userName)}cc, ${getUserColor(userName)}44)`, border: `1.5px solid ${getUserColor(userName)}50`, color: '#fff' }}>
          {getInitials(userName || 'U')}
        </div>
        {editingName ? (
          <div className="flex items-center gap-2 flex-1">
            <input value={tempName} onChange={e => setTempName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveName()}
              placeholder="Seu nome (2-30 caracteres)"
              maxLength={30}
              className="flex-1 bg-transparent border-b border-white/20 text-[13px] text-white outline-none pb-0.5 focus:border-white/50 transition-colors" autoFocus />
            <button onClick={saveName} className="text-[12px] font-bold px-3 py-1 rounded-lg transition-colors"
              style={{ background: `${accentColor}20`, color: accentColor }}>Salvar</button>
            <button onClick={() => setEditingName(false)} className="text-[12px] text-white/30 hover:text-white transition-colors">Cancelar</button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1">
            <span className="text-[13px] font-semibold text-white/70">{userName}</span>
            <button onClick={() => { setTempName(userName); setEditingName(true); }}
              className="text-[11px] text-white/25 hover:text-white/60 transition-colors underline underline-offset-2">
              editar nome
            </button>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="mb-8">
        {replyTo && (
          <div className="flex items-center gap-2 mb-2 px-1">
            <CornerDownRight className="size-3.5" style={{ color: accentColor }} />
            <span className="text-[12px] text-white/40">Respondendo a <span className="text-white/70 font-semibold">{replyTo.name}</span></span>
            <button onClick={() => setReplyTo(null)} className="ml-auto text-[11px] text-white/25 hover:text-white/60 transition-colors">✕ cancelar</button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end gap-3 bg-[#0F1018] border border-white/[0.08] rounded-2xl p-3 focus-within:border-white/20 transition-colors">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 mb-0.5"
              style={{ background: `linear-gradient(135deg, ${getUserColor(userName)}cc, ${getUserColor(userName)}44)`, border: `1.5px solid ${getUserColor(userName)}50`, color: '#fff' }}>
              {getInitials(userName || 'U')}
            </div>
            <div className="flex-1">
              <input ref={inputRef} value={text}
                onChange={e => { setText(e.target.value); setError(''); }}
                placeholder={replyTo ? `Respondendo a ${replyTo.name}...` : 'Escreva um comentário...'}
                maxLength={1000}
                className="w-full bg-transparent text-[14px] text-white outline-none placeholder:text-white/20 resize-none"
              />
              {text.length > 0 && (
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-[11px] ${text.length > 900 ? 'text-red-400' : 'text-white/20'}`}>{text.length}/1000</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {/* Emoji picker */}
              <div className="relative">
                <button type="button" onClick={() => setShowEmojiPicker(s => !s)}
                  className={`p-2 rounded-xl transition-colors ${showEmojiPicker ? 'text-white bg-white/10' : 'text-white/30 hover:text-white hover:bg-white/5'}`}>
                  <Smile className="size-4.5" />
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-full right-0 mb-2 bg-[#131520] border border-white/10 rounded-2xl p-3 grid grid-cols-4 gap-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2">
                    {EMOJIS.map(em => (
                      <button key={em} type="button" onClick={() => { setText(t => t + em); setShowEmojiPicker(false); }}
                        className="w-10 h-10 flex items-center justify-center text-xl hover:bg-white/10 rounded-xl transition-all hover:scale-125">
                        {em}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Send */}
              <button type="submit" disabled={loading || !text.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95"
                style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)`, boxShadow: `0 4px 20px ${accentColor}40` }}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : <><Send className="size-3.5" /> Enviar</>}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="flex items-start gap-2 mt-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <span className="text-red-400 text-[13px]">⚠ {error}</span>
          </div>
        )}
      </div>

      {/* Comments list */}
      {fetching ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-8 animate-spin" style={{ color: accentColor }} />
        </div>
      ) : rootComments.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center gap-3">
          <div className="text-4xl">💬</div>
          <p className="text-white/40 text-[14px]">Ninguém comentou ainda.</p>
          <p className="text-white/20 text-[12px]">Seja o primeiro a compartilhar sua opinião!</p>
        </div>
      ) : (
        <div className="space-y-5">
          {rootComments.map(c => renderComment(c))}
        </div>
      )}
    </div>
  );
}
