import React, { useState } from 'react';
import { Lock, ShieldAlert, X, Key, Brain } from 'lucide-react';

interface ParentalGateModalProps {
  gateQuestionText: string;
  gateInput: string;
  setGateInput: (val: string) => void;
  gateError: boolean;
  onVerify: (e: React.FormEvent, mode: 'pin' | 'challenge') => void;
  onClose: () => void;
}

export function ParentalGateModal({
  gateQuestionText,
  gateInput,
  setGateInput,
  gateError,
  onVerify,
  onClose,
}: ParentalGateModalProps) {
  const [activeMode, setActiveMode] = useState<'pin' | 'challenge'>('pin');

  const handleModeSwitch = (mode: 'pin' | 'challenge') => {
    setActiveMode(mode);
    setGateInput('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVerify(e, activeMode);
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300 select-none">
      <div className="relative max-w-md w-full bg-[#0a0720]/95 border border-white/10 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        
        {/* Decorative top gradient line */}
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
        
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 text-white/30 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
        >
          <X className="size-5" />
        </button>

        <div className="text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-violet-600/10 border border-violet-500/25 flex items-center justify-center mx-auto text-violet-400">
            {activeMode === 'pin' ? (
              <Key className="size-6 animate-pulse text-yellow-400" />
            ) : (
              <Brain className="size-6 animate-pulse text-pink-400" />
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-white font-black text-base tracking-widest uppercase" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Área Restrita aos Pais 🔐
            </h3>
            <p className="text-indigo-200/50 text-xs font-bold leading-relaxed px-4">
              {activeMode === 'pin' 
                ? "Digite seu PIN parental de 4 dígitos para gerenciar limites, classificações e bloquear títulos:"
                : "Para provar que é um adulto, resolva o desafio avançado gerado abaixo:"}
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-5 pt-3 text-left">
            {activeMode === 'challenge' && (
              <div className="bg-[#0F0A28]/85 border border-white/5 rounded-2xl p-5 text-center space-y-2 shadow-inner">
                <span className="text-[10px] text-pink-400 font-black uppercase tracking-widest flex items-center justify-center gap-1.5 leading-none mb-1">
                  <ShieldAlert className="size-3.5 text-pink-400" />
                  Desafio de Segurança Adulto
                </span>
                <div 
                  className="text-base sm:text-lg font-black text-indigo-100 tracking-wide leading-relaxed"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  {gateQuestionText}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <input
                type={activeMode === 'pin' ? 'password' : 'text'}
                value={gateInput}
                onChange={(e) => setGateInput(e.target.value)}
                maxLength={activeMode === 'pin' ? 4 : 50}
                placeholder={activeMode === 'pin' ? "PIN de 4 dígitos..." : "Digite sua resposta..."}
                className="w-full bg-[#0C0626] border border-white/10 focus:border-violet-500 rounded-2xl p-4 text-center text-white text-base font-bold placeholder:text-white/20 outline-none transition-all shadow-inner uppercase tracking-wider"
                autoFocus
                required
                autoComplete="off"
              />
              
              {gateError && (
                <p className="text-red-400 text-[10px] font-black text-center uppercase tracking-wider animate-bounce">
                  {activeMode === 'pin' ? '❌ PIN Incorreto! Tente novamente.' : '❌ Desafio incorreto! Tente de novo.'}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-950/20 active:scale-[0.98]"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Confirmar Acesso
            </button>

            {/* Toggle mode helper at the bottom */}
            <div className="text-center pt-2">
              {activeMode === 'pin' ? (
                <button
                  type="button"
                  onClick={() => handleModeSwitch('challenge')}
                  className="text-[10px] text-indigo-300/50 hover:text-indigo-300 font-bold uppercase tracking-wider underline transition-colors"
                >
                  Esqueceu o PIN? Resolver Desafio Matemático 🧠
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleModeSwitch('pin')}
                  className="text-[10px] text-indigo-300/50 hover:text-indigo-300 font-bold uppercase tracking-wider underline transition-colors"
                >
                  Voltar para Entrada de PIN 🔑
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
