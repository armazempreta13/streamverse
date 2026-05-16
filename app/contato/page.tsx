'use client';

import React, { useState, Suspense } from 'react';
import { Navbar } from '@/components/Navbar';
import { Mail, MessageSquare, Send } from 'lucide-react';

export default function ContatoPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    // Simulate sending
    setTimeout(() => setStatus('success'), 1500);
  };

  return (
    <div className="min-h-screen bg-[#050510] text-[#D1D5DB] font-sans selection:bg-[#8F44FF]/30">
      <Suspense fallback={<div className="h-[80px] bg-[#050510]" />}>
        <Navbar />
      </Suspense>
      
      <div className="pt-32 pb-20 px-6 md:px-10 max-w-[900px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 tracking-tight">
            Fale <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8F44FF] to-[#FF3366]">Conosco</span>
          </h1>
          <p className="text-[#8A93A6] text-lg">Envie sua dúvida, sugestão ou notificação legal (DMCA)</p>
        </div>

        <div className="grid md:grid-cols-5 gap-10">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl shadow-xl hover:bg-white/[0.03] transition-colors">
              <div className="w-12 h-12 rounded-full bg-[#8F44FF]/10 flex items-center justify-center mb-4 border border-[#8F44FF]/20">
                <Mail className="size-5 text-[#A661FF]" />
              </div>
              <h3 className="text-lg font-display font-bold text-white mb-2">E-mail de Suporte</h3>
              <p className="text-sm text-[#8A93A6]">contato@streamverse.com.br</p>
              <p className="text-xs text-[#8A93A6]/60 mt-1">Responderemos em até 48h úteis.</p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl shadow-xl hover:bg-white/[0.03] transition-colors">
              <div className="w-12 h-12 rounded-full bg-[#FF3366]/10 flex items-center justify-center mb-4 border border-[#FF3366]/20">
                <MessageSquare className="size-5 text-[#FF3366]" />
              </div>
              <h3 className="text-lg font-display font-bold text-white mb-2">DMCA & Legal</h3>
              <p className="text-sm text-[#8A93A6]">dmca@streamverse.com.br</p>
              <p className="text-xs text-[#8A93A6]/60 mt-1">Para assuntos estritamente legais e remoções.</p>
            </div>
          </div>

          <div className="md:col-span-3">
            <form onSubmit={handleSubmit} className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl shadow-xl flex flex-col gap-5 relative overflow-hidden">
              {status === 'success' ? (
                <div className="absolute inset-0 bg-[#0A0C10]/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <Send className="size-6 text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Mensagem Enviada!</h3>
                  <p className="text-[#8A93A6] mb-6">Recebemos seu contato com sucesso. Nossa equipe retornará o mais breve possível.</p>
                  <button 
                    type="button" 
                    onClick={() => setStatus('idle')}
                    className="px-6 py-2.5 rounded-full bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
                  >
                    Enviar outra mensagem
                  </button>
                </div>
              ) : null}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#8A93A6] uppercase tracking-wider pl-1">Seu Nome</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-[#050510] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#8A93A6]/50 focus:border-[#8F44FF]/50 focus:shadow-[0_0_15px_rgba(143,68,255,0.2)] outline-none transition-all"
                  placeholder="Ex: João Silva"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#8A93A6] uppercase tracking-wider pl-1">Seu E-mail</label>
                <input 
                  type="email" 
                  required
                  className="w-full bg-[#050510] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#8A93A6]/50 focus:border-[#8F44FF]/50 focus:shadow-[0_0_15px_rgba(143,68,255,0.2)] outline-none transition-all"
                  placeholder="Ex: joao@email.com"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#8A93A6] uppercase tracking-wider pl-1">Assunto</label>
                <select className="w-full bg-[#050510] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#8F44FF]/50 outline-none transition-all appearance-none">
                  <option>Dúvida Geral</option>
                  <option>Reportar Erro / Bug</option>
                  <option>Sugestão de Conteúdo</option>
                  <option>Notificação DMCA</option>
                  <option>Parceria</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#8A93A6] uppercase tracking-wider pl-1">Mensagem</label>
                <textarea 
                  required
                  rows={5}
                  className="w-full bg-[#050510] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#8A93A6]/50 focus:border-[#8F44FF]/50 focus:shadow-[0_0_15px_rgba(143,68,255,0.2)] outline-none transition-all resize-none"
                  placeholder="Escreva sua mensagem aqui..."
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={status === 'loading'}
                className="mt-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-[#8F44FF] to-[#FF3366] text-white font-bold tracking-wide hover:opacity-90 hover:shadow-[0_0_30px_rgba(143,68,255,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {status === 'loading' ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>Enviar Mensagem <Send className="size-4 ml-1" /></>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
