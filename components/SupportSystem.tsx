'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Heart, Sparkles, X, Check, Copy, ArrowRight, QrCode, Shield, Info, HeartHandshake } from 'lucide-react';
import { supportSystemConfig } from '@/config/site';
import QRCode from 'qrcode';
import { usePathname } from 'next/navigation';

// ── SISTEMA DE GERAÇÃO EMV PIX DINÂMICO ──
// Implementação em conformidade com o padrão BCB (Banco Central do Brasil) / EMV Co.
function calculateCRC16(str: string): string {
  let crc = 0xFFFF;
  const polynomial = 0x1021;

  for (let i = 0; i < str.length; i++) {
    const b = str.charCodeAt(i);
    for (let j = 0; j < 8; j++) {
      const bit = ((b >> (7 - j)) & 1) === 1;
      const c15 = ((crc >> 15) & 1) === 1;
      crc <<= 1;
      if (c15 !== bit) {
        crc ^= polynomial;
      }
    }
  }

  crc &= 0xFFFF;
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function generatePixPayload(key: string, name: string, city: string, amount: string, description: string = '') {
  // Limpa chave se parecer com CPF ou celular, mas mantém o resto como está
  let sanitizedKey = key;
  if (/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(key) || /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(key) || /^\d{11}$/.test(key.replace(/\D/g, ''))) {
    sanitizedKey = key.replace(/\D/g, '');
  }

  const formatField = (id: string, value: string) => {
    const len = value.length.toString().padStart(2, '0');
    return `${id}${len}${value}`;
  };

  // Merchant Account Info (ID 26)
  const sub00 = formatField('00', 'br.gov.bcb.pix');
  const sub01 = formatField('01', sanitizedKey);
  const sub02 = description ? formatField('02', description.normalize("NFD").replace(/[\u0300-\u036f]/g, "").substring(0, 25)) : '';
  const merchantAccountInfo = formatField('26', `${sub00}${sub01}${sub02}`);

  const mcc = formatField('52', '0000');
  const currency = formatField('53', '986'); // BRL

  // Formata o valor com 2 casas decimais
  let amountField = '';
  const parsedAmount = parseFloat(amount);
  if (!isNaN(parsedAmount) && parsedAmount > 0) {
    amountField = formatField('54', parsedAmount.toFixed(2));
  }

  const country = formatField('58', 'BR');

  // Nome e Cidade normalizados para ASCII padrão EMV
  const normalize = (txt: string) => txt.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const normalizedName = normalize(name).substring(0, 25);
  const normalizedCity = normalize(city).substring(0, 15);

  const mName = formatField('59', normalizedName);
  const mCity = formatField('60', normalizedCity);

  const txId = formatField('05', '***');
  const additionalData = formatField('62', txId);

  let payload = `000201${merchantAccountInfo}${mcc}${currency}${amountField}${country}${mName}${mCity}${additionalData}6304`;

  const crcStr = calculateCRC16(payload);
  return `${payload}${crcStr}`;
}

export function SupportSystem() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);
  const [sessionsCount, setSessionsCount] = useState(0);
  const [minutesActive, setMinutesActive] = useState(0);

  // Kids Mode Protection State
  const [isKidsModeActive, setIsKidsModeActive] = useState(false);

  // UI Display States
  const [showModal, setShowModal] = useState(false);
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkKidsMode = () => {
      const activeLocal = localStorage.getItem('streamverse_kids_active') === 'true';
      const activeCookie = document.cookie.includes('kids_active=true');
      const activePath = pathname.startsWith('/kids');
      setIsKidsModeActive(activeLocal || activeCookie || activePath);
    };

    checkKidsMode();
    const interval = setInterval(checkKidsMode, 1000);
    return () => clearInterval(interval);
  }, [pathname]);

  // Dynamic PIX States
  const [pixAmount, setPixAmount] = useState<string>('15.00'); // Default donation of R$ 15.00
  const [customAmount, setCustomAmount] = useState<string>('');
  const [pixPayload, setPixPayload] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  
  // Custom Donor identification States
  const [donorName, setDonorName] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Interaction states
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getPixKeyTypeLabel = (keyStr: string) => {
    if (/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(keyStr) || /^\d{11}$/.test(keyStr.replace(/\D/g, ''))) return 'CPF';
    if (/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(keyStr)) return 'CNPJ';
    if (keyStr.includes('@')) return 'E-mail';
    if (/^\+?\d{10,14}$/.test(keyStr.replace(/\D/g, ''))) return 'Celular';
    return 'Chave Aleatória';
  };

  const trackerInterval = useRef<NodeJS.Timeout | null>(null);

  // Recalculates PIX payload and QR Code locally using qrcode package
  useEffect(() => {
    if (!supportSystemConfig.pix) return;

    // Create a dynamic, compliance-valid EMV description carrying the donor's name if they typed one
    const normalizedDonor = donorName
      ? donorName.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9 ]/g, "").substring(0, 15)
      : "";
    const customDesc = normalizedDonor 
      ? `Apoio ${normalizedDonor}`
      : supportSystemConfig.pix.description;

    const payload = generatePixPayload(
      supportSystemConfig.pix.key,
      supportSystemConfig.pix.recipient,
      supportSystemConfig.pix.city,
      pixAmount,
      customDesc
    );

    setPixPayload(payload);

    // Render QR Code 100% offline as a base64 Data URL
    QRCode.toDataURL(payload, {
      margin: 1,
      width: 320,
      color: {
        dark: '#09090b',
        light: '#ffffff'
      }
    })
    .then((url) => {
      setQrCodeUrl(url);
    })
    .catch((err) => {
      console.error('Failed to generate local QR Code', err);
      // Fail-proof fallback using Google Chart API
      setQrCodeUrl(`https://chart.googleapis.com/chart?cht=qr&chs=300x300&chld=L|1&chl=${encodeURIComponent(payload)}`);
    });
  }, [pixAmount, donorName]);

  // Helper to verify if the cooldown is active
  const isCooldownActive = useCallback(() => {
    if (!supportSystemConfig.rememberDismissedState) return false;

    try {
      const cooldownUntilStr = localStorage.getItem('streamverse_support_cooldown_until');
      const permanentlyDismissed = localStorage.getItem('streamverse_support_permanently_dismissed') === 'true';
      const supported = localStorage.getItem('streamverse_support_completed') === 'true';

      if (permanentlyDismissed || supported) {
        return true;
      }

      if (cooldownUntilStr) {
        const cooldownUntil = new Date(cooldownUntilStr);
        if (new Date() < cooldownUntil) {
          return true;
        }
      }
    } catch (e) {
      console.error('LocalStorage not accessible', e);
    }

    return false;
  }, []);

  // Sync state and check triggers
  const evaluateTriggers = useCallback((sessions: number, seconds: number) => {
    if (!supportSystemConfig.enabled) return;
    if (isCooldownActive()) return;

    const minutes = seconds / 60;
    const sessionRequirementMet = sessions >= supportSystemConfig.minimumSessions;
    const timeRequirementMet = minutes >= supportSystemConfig.showOnlyAfterMinutes;

    // We never interrupt active movie/episode playback
    if (supportSystemConfig.neverInterruptPlayback && (window as any).__streamverse_video_playing) {
      return;
    }

    if (sessionRequirementMet && timeRequirementMet) {
      const deepEngagementMet = minutes >= (supportSystemConfig.showOnlyAfterMinutes * 2);

      if (deepEngagementMet && !localStorage.getItem('streamverse_support_modal_shown_this_session')) {
        setShowModal(true);
        setShowCard(false);
        try {
          localStorage.setItem('streamverse_support_modal_shown_this_session', 'true');
        } catch (e) { }
      } else {
        setShowCard(true);
      }
    }
  }, [isCooldownActive]);

  // Copy to clipboard helper
  const handleCopy = useCallback((text: string, label: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2500);
    } catch (e) {
      console.error('Failed to copy to clipboard', e);
    }
  }, []);

  // Cooldown / Close triggers
  const handleDismiss = useCallback((permanent = false) => {
    setShowModal(false);
    setShowCard(false);

    try {
      if (permanent) {
        localStorage.setItem('streamverse_support_permanently_dismissed', 'true');
      } else {
        const cooldownDate = new Date();
        cooldownDate.setDate(cooldownDate.getDate() + supportSystemConfig.cooldownDays);
        localStorage.setItem('streamverse_support_cooldown_until', cooldownDate.toISOString());
      }
    } catch (e) { }
  }, []);

  const handleSupported = useCallback(() => {
    setShowModal(false);
    setShowCard(false);
    try {
      localStorage.setItem('streamverse_support_completed', 'true');
    } catch (e) { }
  }, []);

  // Listen to video playing state on window
  useEffect(() => {
    const checkVideoState = setInterval(() => {
      if (typeof window !== 'undefined') {
        const isPlaying = !!(window as any).__streamverse_video_playing;
        setVideoPlaying(isPlaying);

        if (isPlaying && supportSystemConfig.neverInterruptPlayback) {
          if (showModal) {
            setShowModal(false);
            setShowCard(true);
          }
        }
      }

      const fs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      setIsFullscreen(fs);
    }, 1000);

    return () => clearInterval(checkVideoState);
  }, [showModal]);

  // Session & time tracking
  useEffect(() => {
    if (typeof window === 'undefined' || !supportSystemConfig.enabled) return;

    setEnabled(true);

    try {
      const isNewSession = !sessionStorage.getItem('streamverse_session_active');
      let currentSessions = Number(localStorage.getItem('streamverse_support_sessions') || '0');

      if (isNewSession) {
        currentSessions += 1;
        localStorage.setItem('streamverse_support_sessions', String(currentSessions));
        sessionStorage.setItem('streamverse_session_active', 'true');
      }
      setSessionsCount(currentSessions);

      let activeSeconds = Number(localStorage.getItem('streamverse_support_time') || '0');
      setMinutesActive(Math.floor(activeSeconds / 60));

      trackerInterval.current = setInterval(() => {
        if (document.hidden) return;

        activeSeconds += 5;
        localStorage.setItem('streamverse_support_time', String(activeSeconds));

        const newMinutes = Math.floor(activeSeconds / 60);
        setMinutesActive(newMinutes);

        evaluateTriggers(currentSessions, activeSeconds);
      }, 5000);

    } catch (e) {
      console.error('Session tracking error', e);
    }

    return () => {
      if (trackerInterval.current) clearInterval(trackerInterval.current);
    };
  }, [evaluateTriggers]);

  // Dev triggers for checking layouts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).triggerStreamverseSupportModal = () => {
        setShowModal(true);
      };
      (window as any).triggerStreamverseSupportCard = () => {
        setShowCard(true);
      };
    }
  }, []);

  // Handles manual value keyboard input with Brazilian standard sanitization
  const handleCustomAmountChange = (val: string) => {
    let clean = val.replace(',', '.').replace(/[^\d.]/g, '');

    const parts = clean.split('.');
    if (parts.length > 2) {
      clean = parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts[1] && parts[1].length > 2) {
      clean = parts[0] + '.' + parts[1].substring(0, 2);
    }

    setCustomAmount(val);

    const parsed = parseFloat(clean);
    if (!isNaN(parsed) && parsed > 0) {
      setPixAmount(clean);
    } else {
      setPixAmount('');
    }
  };

  if (isKidsModeActive || pathname.startsWith('/kids')) return null;
  if (!enabled) return null;
  if (isFullscreen && supportSystemConfig.disableOnMobileFullscreen) return null;

  return (
    <>
      {/* ── CARD FLUTUANTE DISCRETO (Canto Inferior) ── */}
      {showCard && !showModal && !videoPlaying && (
        <div
          className="fixed bottom-6 right-6 z-[500] max-w-sm w-full bg-[#0d0d19]/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] animate-in fade-in slide-in-from-bottom-5 duration-500 group"
          style={{
            backgroundImage: 'radial-gradient(circle at top right, rgba(143,68,255,0.08) 0%, transparent 60%)'
          }}
        >
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <span className="text-[7px] text-white/20 select-none uppercase tracking-widest pointer-events-none group-hover:opacity-100 opacity-0 transition-opacity">Apoio</span>
            <button
              onClick={() => handleDismiss()}
              className="p-1 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all"
              title="Talvez depois"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(143,68,255,0.15)] relative">
              <span className="absolute inset-0 rounded-xl bg-purple-500/20 blur-sm animate-pulse" />
              <Heart className="size-5 text-purple-400 fill-purple-400 relative z-10 animate-pulse" />
            </div>

            <div className="flex-1 min-w-0 pr-2">
              <h4 className="text-white text-[13px] font-black tracking-wide uppercase flex items-center gap-1.5">
                StreamVerse Voluntário
                <Sparkles className="size-3 text-amber-400" />
              </h4>
              <p className="text-white/60 text-xs mt-1.5 leading-relaxed font-medium">
                Sabia que mantemos essa experiência 100% livre de propagandas irritantes? Apoie para continuar assim!
              </p>

              <div className="flex items-center gap-3 mt-3.5">
                <button
                  onClick={() => setShowModal(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-[10px] uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all flex items-center gap-1 shadow-md shadow-purple-950/20"
                >
                  <span>Apoiar via Pix</span>
                  <ArrowRight className="size-3" />
                </button>
                <button
                  onClick={() => handleDismiss()}
                  className="text-white/40 hover:text-white text-[10px] font-black uppercase tracking-wider transition-colors"
                >
                  Talvez Depois
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL CINEMATOGRÁFICO DE PIX DINÂMICO REAL (Sem placebo!) ── */}
      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-500">
          
          {isSuccess ? (
            /* ── TELA DE CELEBRAÇÃO E AGRADECIMENTO ESPECIAL (CONFIRMADO) ── */
            <div
              className="relative max-w-md w-full bg-[#06060c] border border-emerald-500/20 rounded-3xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.05)] p-8 text-center animate-in zoom-in-95 duration-500 flex flex-col items-center"
              style={{
                backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(16,185,129,0.15) 0%, transparent 60%)'
              }}
            >
              {/* Celebração de Confetes em CSS */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                {Array.from({ length: 24 }).map((_, i) => {
                  const left = Math.random() * 100;
                  const delay = Math.random() * 2.5;
                  const duration = Math.random() * 2 + 3.5;
                  const colors = ['#10b981', '#3b82f6', '#f43f5e', '#fbbf24', '#a855f7'];
                  const color = colors[Math.floor(Math.random() * colors.length)];
                  return (
                    <span
                      key={i}
                      className="absolute w-2 h-4 rounded-sm animate-confetti-fall pointer-events-none select-none opacity-0"
                      style={{
                        left: `${left}%`,
                        top: `-20px`,
                        backgroundColor: color,
                        animationDelay: `${delay}s`,
                        animationDuration: `${duration}s`,
                        transform: `rotate(${Math.random() * 360}deg)`
                      }}
                    />
                  );
                })}
              </div>

              <style dangerouslySetInnerHTML={{ __html: `
                @keyframes confettiFall {
                  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
                  10% { opacity: 1; }
                  90% { opacity: 0.8; }
                  100% { transform: translateY(420px) rotate(720deg); opacity: 0; }
                }
                .animate-confetti-fall {
                  animation: confettiFall 4.5s linear infinite;
                }
              `}} />

              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/35 flex items-center justify-center mb-6 relative z-10 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                <Check className="size-8 text-emerald-400 stroke-[3.5px] animate-bounce" />
              </div>

              <h3 className="text-white font-black text-xl tracking-tight relative z-10">
                {donorName ? `Muito Obrigado, ${donorName.trim()}! 💖` : 'Apoio Recebido com Carinho! 💖'}
              </h3>
              <p className="text-white/60 text-xs mt-3 leading-relaxed relative z-10">
                Seu apoio voluntário de <strong className="text-emerald-400">R$ {parseFloat(pixAmount || '15').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> faz uma diferença gigantesca! Com ele, garantimos servidores de alta velocidade e mantemos a plataforma livre de anúncios chatos para você e toda a comunidade.
              </p>

              <div className="w-full bg-white/[0.02] border border-white/[0.04] p-4 rounded-2xl my-6 text-left space-y-3 relative z-10">
                <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Premium Liberado nesta Máquina:</h4>
                <ul className="text-[10px] text-white/50 space-y-2 font-medium">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                    <span>Transmissão em HD e Ultra-HD liberada</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                    <span>Desativação permanente de avisos e banners</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                    <span>Prioridade nos servidores de vídeo da StreamVerse</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => {
                  handleSupported();
                  setIsSuccess(false);
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 z-10 cursor-pointer"
              >
                Voltar a Assistir sem Anúncios 🚀
              </button>
            </div>
          ) : (
            /* ── TELA PRINCIPAL DO SISTEMA DE APOIO ── */
            <div
              className="relative max-w-2xl w-full bg-[#06060c] border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.05)] flex flex-col animate-in zoom-in-95 duration-500 max-h-[95vh]"
              style={{
                backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(143,68,255,0.15) 0%, transparent 60%)'
              }}
            >
              {/* Linha brilhante premium no topo */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-90 shadow-[0_1px_20px_rgba(143,68,255,0.6)]" />

              {/* Header */}
              <div className="p-6 md:p-8 flex items-center justify-between border-b border-white/[0.05] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center shrink-0">
                    <Heart className="size-5 text-purple-400 fill-purple-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-sm md:text-base tracking-widest uppercase flex items-center gap-1.5 leading-none">
                      StreamVerse Plus
                      <span className="text-[9px] font-black text-purple-300 bg-purple-500/15 border border-purple-500/20 px-2 py-0.5 rounded-full uppercase tracking-widest">100% Livre de Ads</span>
                    </h3>
                    <p className="text-[10px] text-white/40 tracking-wider uppercase mt-1">Apoio Coletivo Real via Pix Dinâmico</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDismiss()}
                  className="p-2 rounded-xl text-white/30 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                  title="Fechar"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Corpo do Modal (Scrollable) */}
              <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar space-y-6">

                {/* Apresentação Filosófica Compacta */}
                <div className="text-center max-w-lg mx-auto">
                  <h4 className="text-white text-base md:text-lg font-black tracking-tight leading-snug">
                    Ajude a manter o StreamVerse Vivo, Rápido e Sem Anúncios!
                  </h4>
                  <p className="text-white/60 text-xs mt-2 leading-relaxed font-medium">
                    Não temos banners irritantes, rastreadores invasivos ou propagandas de cassino. O projeto é mantido apenas por uma pessoa e financiado exclusivamente por doações espontâneas da própria comunidade.
                  </p>
                </div>

                {/* Seção Principal: Grid Interativo */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">

                  {/* COLUNA ESQUERDA: QR CODE DINÂMICO EM TEMPO REAL */}
                  <div className="md:col-span-5 flex flex-col items-center">
                    <div className="relative p-4 rounded-3xl bg-white border border-slate-200 shadow-[0_15px_40px_rgba(0,0,0,0.5)] group overflow-hidden">
                      {/* Linha laser de escaneamento em loop */}
                      <div className="absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_12px_#8f44ff] animate-bounce pointer-events-none" style={{ animationDuration: '3.5s' }} />

                      <div className="w-36 h-36 border border-slate-100 flex items-center justify-center relative bg-white rounded-2xl select-none">
                        {qrCodeUrl ? (
                          <img
                            src={qrCodeUrl}
                            alt="Pix QR Code"
                            className="w-full h-full object-contain rounded-2xl transition-all duration-300"
                          />
                        ) : (
                          <div className="size-full flex items-center justify-center bg-slate-50 text-slate-400">
                            <QrCode className="size-12 animate-pulse" />
                          </div>
                        )}

                        {/* Logo centralizada para premium visual */}
                        {qrCodeUrl && (
                          <div className="absolute inset-0 m-auto w-9 h-9 rounded-full bg-slate-950 border-2 border-white flex items-center justify-center shadow-lg pointer-events-none">
                            <Heart className="size-4 text-purple-400 fill-purple-400" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-center mt-3">
                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Escaneie o QR Code</span>
                      <span className="text-[11px] text-purple-400 font-extrabold block mt-0.5">
                        {pixAmount ? `Valor: R$ ${parseFloat(pixAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Defina o valor no banco!'}
                      </span>
                    </div>
                  </div>

                  {/* COLUNA DIREITA: FORMULÁRIO DE SELEÇÃO E COPIE E COLE */}
                  <div className="md:col-span-7 flex flex-col gap-4">

                    {/* Seleção de Valor Dinâmica */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block">Escolha o valor do apoio</label>
                      <div className="grid grid-cols-5 gap-1.5">
                        {['5.00', '10.00', '25.00', '50.00', '100.00'].map((val) => {
                          const numericVal = parseFloat(val);
                          const isSelected = pixAmount === val && !customAmount;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => {
                                setPixAmount(val);
                                setCustomAmount('');
                              }}
                              className={`py-2 rounded-xl text-xs font-black transition-all border cursor-pointer ${isSelected
                                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-500 shadow-md shadow-purple-950/40 scale-[1.03]'
                                  : 'bg-white/[0.03] border-white/5 text-white/60 hover:bg-white/[0.06] hover:text-white'
                                }`}
                            >
                              R$ {numericVal}
                            </button>
                          );
                        })}
                      </div>

                      {/* Input customizado de valor */}
                      <div className="relative mt-2">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <span className="text-white/40 text-xs font-bold font-mono">Outro Valor: R$</span>
                        </div>
                        <input
                          type="text"
                          value={customAmount}
                          onChange={(e) => handleCustomAmountChange(e.target.value)}
                          placeholder="0,00"
                          className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-purple-500 focus:shadow-[0_0_15px_rgba(143,68,255,0.15)] transition-all rounded-xl py-2.5 pl-28 pr-4 outline-none text-xs text-white font-black placeholder:text-white/25"
                        />
                      </div>
                    </div>

                    {/* Identificação de Origem (Para Philippe identificar no extrato do banco!) */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block">Identifique seu Apoio (Opcional)</label>
                      <input
                        type="text"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value.substring(0, 15))}
                        placeholder="Ex: Seu Nome ou Mensagem Rápida"
                        className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-purple-500 focus:shadow-[0_0_15px_rgba(143,68,255,0.15)] transition-all rounded-xl py-2 px-3 outline-none text-xs text-white font-semibold placeholder:text-white/20"
                      />
                      <p className="text-[8px] text-white/30 font-bold uppercase tracking-wider">
                        {donorName.trim() 
                          ? `Codificado no Pix: "Apoio ${donorName.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9 ]/g, "")}"`
                          : "Aparecerá na notificação do banco de destino!"}
                      </p>
                    </div>

                    {/* Campo Pix Copie e Cole Real-Time */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block">Pix Copie e Cole</span>
                      <div className="flex bg-white/[0.02] border border-white/10 rounded-xl p-2 items-center justify-between gap-3 hover:border-purple-500/25 transition-colors">
                        <code className="text-purple-300 font-mono text-[10px] select-all truncate pl-2 font-bold max-w-[220px] sm:max-w-[280px]">
                          {pixPayload || 'Gerando código...'}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopy(pixPayload, 'pix')}
                          disabled={!pixPayload}
                          className="px-3.5 py-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 text-purple-300 font-black text-[9px] uppercase tracking-wider shrink-0 transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                          {copiedText === 'pix' ? (
                            <>
                              <Check className="size-3 text-emerald-400" />
                              <span className="text-emerald-400">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="size-3" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Informações Bancárias Seguras do Pix */}
                    <div className="grid grid-cols-3 gap-3 text-[9px] text-white/30 font-bold uppercase tracking-wider bg-white/[0.01] border border-white/[0.04] p-3 rounded-xl select-none">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-white/20 text-[7px] tracking-widest">Beneficiário</span>
                        <span className="text-white/60 truncate">{supportSystemConfig.pix?.recipient || 'João Philippe'}</span>
                      </div>
                      <div className="flex flex-col gap-0.5 border-l border-white/5 pl-3 relative group">
                        <span className="text-white/20 text-[7px] tracking-widest">{getPixKeyTypeLabel(supportSystemConfig.pix?.key || '')}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-white/60 truncate select-all">{supportSystemConfig.pix?.key}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(supportSystemConfig.pix?.key || '', 'key')}
                            className="text-purple-400 hover:text-purple-300 transition-colors p-0.5 cursor-pointer"
                            title="Copiar Chave Pix"
                          >
                            {copiedText === 'key' ? (
                              <Check className="size-2.5 text-emerald-400" />
                            ) : (
                              <Copy className="size-2.5" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col gap-0.5 border-l border-white/5 pl-3">
                        <span className="text-white/20 text-[7px] tracking-widest">Cidade</span>
                        <span className="text-white/60">{supportSystemConfig.pix?.city || 'Rio de Janeiro'}</span>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Informações Adicionais / Garantias de segurança */}
                <div className="flex gap-2.5 items-start bg-emerald-500/5 border border-emerald-500/10 p-3.5 rounded-xl text-left">
                  <Shield className="size-4.5 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <h5 className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">Apoio Direto Totalmente Seguro</h5>
                    <p className="text-[10px] text-emerald-400/70 mt-0.5 leading-normal font-semibold">
                      Este Pix é gerado de forma padronizada de acordo com as diretrizes de segurança do Banco Central do Brasil. Todo valor arrecadado é transferido sem intermediários para custear a manutenção técnica da infraestrutura.
                    </p>
                  </div>
                </div>

              </div>

              {/* Rodapé Premium do Modal */}
              <div className="p-5 bg-white/[0.01] border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDismiss()}
                    className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-black text-[10px] uppercase tracking-wider transition-all border border-white/5 cursor-pointer"
                  >
                    Talvez Depois
                  </button>
                </div>

                <button
                  onClick={() => handleDismiss(true)}
                  className="text-white/20 hover:text-red-400 hover:bg-red-500/5 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all cursor-pointer"
                  title="Não exibir avisos de apoio novamente nesta máquina"
                >
                  Não mostrar novamente
                </button>
              </div>

            </div>
          )}

        </div>
      )}
    </>
  );
}
