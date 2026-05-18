import React, { useState } from 'react';
import { Settings, X, Star, Clock, EyeOff, Search, History, Heart, Copy, Check, QrCode, Shield } from 'lucide-react';
import QRCode from 'qrcode';
import { generatePixPayload } from '@/components/SupportSystem';
import { supportSystemConfig } from '@/config/site';

interface ParentalDashboardModalProps {
  maxRating: 'G' | 'PG';
  handleSaveRating: (r: 'G' | 'PG') => void;
  screenTimeLimit: number;
  handleResetTimer: (mins: number) => void;
  blockedIds: number[];
  handleToggleBlockTitle: (id: number) => void;
  history: { id: string | number; title: string; date: string }[];
  handleClearHistory: () => void;
  childName: string;
  handleSaveChildName: (val: string) => void;
  childGender: 'boy' | 'girl' | 'neutral';
  handleSaveChildGender: (val: 'boy' | 'girl' | 'neutral') => void;
  parentPin: string;
  handleSaveParentPin: (val: string) => void;
  onClose: () => void;
}

export function ParentalDashboardModal({
  maxRating,
  handleSaveRating,
  screenTimeLimit,
  handleResetTimer,
  blockedIds,
  handleToggleBlockTitle,
  history,
  handleClearHistory,
  childName,
  handleSaveChildName,
  childGender,
  handleSaveChildGender,
  parentPin,
  handleSaveParentPin,
  onClose,
}: ParentalDashboardModalProps) {
  const [blockSearchQuery, setBlockSearchQuery] = useState('');
  const [blockSearchResults, setBlockSearchResults] = useState<any[]>([]);
  const [blockSearchLoading, setBlockSearchLoading] = useState(false);

  // Support / Donation states
  const [pixAmount, setPixAmount] = useState<string>('15.00'); // Default donation of R$ 15.00
  const [customAmount, setCustomAmount] = useState<string>('');
  const [pixPayload, setPixPayload] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [donorName, setDonorName] = useState<string>('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Recalculates PIX payload and QR Code locally using qrcode package
  React.useEffect(() => {
    if (!supportSystemConfig.pix) return;

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

    QRCode.toDataURL(payload, {
      margin: 1,
      width: 300,
      color: {
        dark: '#0E062F',
        light: '#ffffff'
      }
    })
    .then((url) => {
      setQrCodeUrl(url);
    })
    .catch((err) => {
      console.error('Failed to generate local QR Code', err);
      setQrCodeUrl(`https://chart.googleapis.com/chart?cht=qr&chs=300x300&chld=L|1&chl=${encodeURIComponent(payload)}`);
    });
  }, [pixAmount, donorName]);

  const handleCopy = (text: string, label: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2500);
    } catch (e) {
      console.error('Failed to copy to clipboard', e);
    }
  };

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

  // Search titles for parents to block
  const handleSearchBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockSearchQuery.trim()) return;
    setBlockSearchLoading(true);
    try {
      const res = await fetch(`/api/catalog?type=search&q=${encodeURIComponent(blockSearchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setBlockSearchResults((data?.results || []).map((item: any) => ({
          id: item.id,
          title: item.title,
          posterUrl: item.posterUrl,
          backdropUrl: item.backdropUrl,
          type: item.type === 'tv' ? 'tv' : 'movie'
        })));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBlockSearchLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div
        className="relative max-w-2xl w-full bg-[#0E062F] border border-indigo-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 max-h-[90vh]"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 60%)'
        }}
      >
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-indigo-500/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
              <Settings className="size-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-white font-black text-base tracking-widest uppercase" style={{ fontFamily: "'Baloo 2', cursive" }}>Controle dos Pais</h3>
              <p className="text-[10px] text-indigo-300 tracking-wider uppercase mt-0.5 font-bold">Supervisão & Segurança Kids</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-indigo-300 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Scrollable Dashboard Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-8 custom-scrollbar">

          {/* 0. PERFIL DO PEQUENO EXPLORADOR */}
          <div className="space-y-4">
            <h4 className="text-white text-sm font-black uppercase tracking-wider flex items-center gap-2">
              <span className="text-indigo-400 text-xl">👤</span>
              Perfil do Pequeno Explorador
            </h4>
            <p className="text-indigo-200 text-xs leading-relaxed font-semibold">
              Personalize o nome e pronome da criança para que os mascotes do site conversem diretamente com ela, criando uma atmosfera mágica e 100% imersiva!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <label className="text-[10px] text-indigo-300 font-black uppercase tracking-wider block">Nome da Criança</label>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => handleSaveChildName(e.target.value)}
                  placeholder="Ex: João, Sofia, Cris..."
                  className="w-full bg-white/5 border border-white/10 focus:border-indigo-400 rounded-xl p-3.5 text-white text-sm font-bold placeholder:text-white/20 outline-none transition-colors shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-indigo-300 font-black uppercase tracking-wider block">Gênero / Pronome</label>
                <div className="flex gap-2">
                  {[
                    { val: 'boy', label: 'Menino (Ele)' },
                    { val: 'girl', label: 'Menina (Ela)' },
                    { val: 'neutral', label: 'Neutro (Astronauta)' }
                  ].map((gender) => (
                    <button
                      key={gender.val}
                      onClick={() => handleSaveChildGender(gender.val as any)}
                      className={`flex-1 py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all text-center ${
                        childGender === gender.val
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                          : 'bg-white/5 border-white/10 text-indigo-200/60 hover:bg-white/10'
                      }`}
                    >
                      {gender.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* PIN DE SEGURANÇA PARENTAL */}
          <div className="space-y-4">
            <h4 className="text-white text-sm font-black uppercase tracking-wider flex items-center gap-2">
              <span className="text-yellow-400 text-xl">🔑</span>
              PIN de Segurança Parental
            </h4>
            <p className="text-indigo-200 text-xs leading-relaxed font-semibold">
              Defina um PIN de 4 dígitos numéricos para acessar as configurações rapidamente. Caso esqueça, os pais podem redefinir o acesso resolvendo o Desafio Matemático Avançado.
            </p>
            <div className="w-full max-w-xs pt-2">
              <label className="text-[10px] text-indigo-300 font-black uppercase tracking-wider block mb-2">PIN Parental Atual (4 dígitos)</label>
              <input
                type="text"
                pattern="\d*"
                maxLength={4}
                value={parentPin}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '');
                  handleSaveParentPin(cleaned);
                }}
                placeholder="Ex: 0000"
                className="w-full bg-white/5 border border-white/10 focus:border-indigo-400 rounded-xl p-3.5 text-center text-white text-base font-black tracking-widest placeholder:text-white/20 outline-none transition-colors shadow-inner"
              />
            </div>
          </div>

          <div className="h-px bg-indigo-500/20" />

          {/* 1. CLASSIFICAÇÃO INDICATIVA */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-black uppercase tracking-wider flex items-center gap-2">
              <Star className="size-5 text-yellow-400 fill-yellow-400" />
              Classificação Indicativa Máxima
            </h4>
            <p className="text-indigo-200 text-xs leading-relaxed font-semibold">
              Filtre os títulos exibidos na sessão baseados nas diretrizes de certificação do TMDB.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                onClick={() => handleSaveRating('G')}
                className={`p-5 rounded-2xl border-2 text-left transition-all ${maxRating === 'G'
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
              >
                <span className="block font-black text-sm uppercase tracking-wider">Livre (L / G)</span>
                <span className={`block text-[10px] mt-1.5 ${maxRating === 'G' ? 'text-indigo-200' : 'text-white/40'}`}>Conteúdo adequado para crianças de todas as idades. Sem agressividade ou linguagem imprópria.</span>
              </button>
              <button
                onClick={() => handleSaveRating('PG')}
                className={`p-5 rounded-2xl border-2 text-left transition-all ${maxRating === 'PG'
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
              >
                <span className="block font-black text-sm uppercase tracking-wider">Até 10 / 12 Anos (PG)</span>
                <span className={`block text-[10px] mt-1.5 ${maxRating === 'PG' ? 'text-indigo-200' : 'text-white/40'}`}>Orientação dos pais recomendada. Pode conter fantasias mais maduras ou ação moderada.</span>
              </button>
            </div>
          </div>

          <div className="h-px bg-indigo-500/20" />

          {/* 2. LIMITE DE TEMPO DE TELA */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-black uppercase tracking-wider flex items-center gap-2">
              <Clock className="size-5 text-pink-400" />
              Limite Diário de Tempo de Tela
            </h4>
            <p className="text-indigo-200 text-xs leading-relaxed font-semibold">
              A criança será bloqueada automaticamente após o limite de tempo configurado ser atingido.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              {[
                { label: 'Sem limite', value: -1 },
                { label: '15 Min', value: 15 },
                { label: '30 Min', value: 30 },
                { label: '1 Hora', value: 60 },
                { label: '2 Horas', value: 120 },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleResetTimer(opt.value)}
                  className={`px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all border-2 ${screenTimeLimit === opt.value
                    ? 'bg-pink-500 border-pink-400 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)]'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-indigo-500/20" />

          {/* 3. GERENCIAR BLOQUEIOS DE TÍTULO */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-black uppercase tracking-wider flex items-center gap-2">
              <EyeOff className="size-5 text-teal-400" />
              Bloquear Títulos Específicos
            </h4>
            <p className="text-indigo-200 text-xs leading-relaxed font-semibold">
              Pesquise por qualquer filme ou série que queira ocultar totalmente do catálogo infantil.
            </p>

            {/* Block search box */}
            <form onSubmit={handleSearchBlock} className="flex gap-3 pt-2">
              <input
                type="text"
                placeholder="Pesquisar título para bloquear..."
                value={blockSearchQuery}
                onChange={(e) => setBlockSearchQuery(e.target.value)}
                className="flex-1 bg-white/5 border-2 border-white/10 rounded-xl px-5 py-3 text-sm text-white placeholder:text-white/30 focus:border-indigo-400 outline-none transition-colors font-bold"
              />
              <button
                type="submit"
                disabled={blockSearchLoading}
                className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
              >
                <Search className="size-4" />
                <span>{blockSearchLoading ? 'Buscando...' : 'Buscar'}</span>
              </button>
            </form>

            {/* Search Results */}
            {blockSearchResults.length > 0 && (
              <div className="bg-black/40 border border-white/10 rounded-2xl p-3 max-h-48 overflow-y-auto space-y-2 mt-3 custom-scrollbar">
                {blockSearchResults.map((item) => {
                  const isBlocked = blockedIds.includes(Number(item.id));
                  return (
                    <div key={item.id} className="flex items-center justify-between gap-3 text-xs bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/5 transition-colors">
                      <span className="font-bold truncate max-w-md text-white">{item.title} <span className="text-white/40 font-normal">({item.type === 'movie' ? 'Filme' : 'Série'})</span></span>
                      <button
                        onClick={() => handleToggleBlockTitle(Number(item.id))}
                        className={`px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${isBlocked
                          ? 'bg-teal-500/20 border border-teal-500/50 text-teal-300'
                          : 'bg-rose-500/20 border border-rose-500/50 text-rose-300 hover:bg-rose-500/30'
                          }`}
                      >
                        {isBlocked ? 'Desbloquear' : 'Bloquear'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* List of blocked IDs */}
            {blockedIds.length > 0 && (
              <div className="pt-3">
                <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest block mb-3">Títulos Atualmente Bloqueados (IDs)</span>
                <div className="flex flex-wrap gap-2">
                  {blockedIds.map((id) => (
                    <div key={id} className="flex items-center gap-2 bg-rose-500/20 border border-rose-500/40 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-300">
                      <span>{id}</span>
                      <button onClick={() => handleToggleBlockTitle(id)} className="text-rose-300 hover:text-white transition-colors">
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-indigo-500/20" />

          {/* 4. HISTÓRICO DE VISUALIZAÇÕES DO PEQUENO EXPLORADOR */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-white text-sm font-black uppercase tracking-wider flex items-center gap-2">
                <History className="size-5 text-sky-400" />
                Histórico de Reprodução
              </h4>
              {history.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-white/40 hover:text-rose-400 text-[10px] font-black uppercase tracking-widest transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg"
                >
                  Limpar Histórico
                </button>
              )}
            </div>
            <p className="text-indigo-200 text-xs leading-relaxed font-semibold">
              Acompanhe exatamente o que seu filho assistiu no StreamVerse Kids.
            </p>

            {history.length === 0 ? (
              <div className="bg-black/20 rounded-xl p-4 text-center">
                <p className="text-white/40 text-[11px] uppercase font-bold">Nenhum histórico gravado nesta máquina.</p>
              </div>
            ) : (
              <div className="bg-black/40 border border-white/10 rounded-2xl p-4 max-h-48 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
                {history.map((h, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 text-xs py-3 first:pt-0 last:pb-0">
                    <span className="font-bold text-white/90">{h.title}</span>
                    <span className="text-[10px] text-white/40 font-semibold">{h.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="h-px bg-indigo-500/20" />

          {/* 5. APOIO AO STREAMVERSE (VOLUNTÁRIO) */}
          <div className="space-y-4 bg-indigo-950/20 border border-indigo-500/10 p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none select-none">
              <Heart className="size-24 text-pink-400 fill-pink-400 animate-pulse" />
            </div>

            <h4 className="text-white text-sm font-black uppercase tracking-wider flex items-center gap-2">
              <Heart className="size-5 text-pink-500 fill-pink-500 animate-pulse" />
              Apoiar o StreamVerse (Voluntário)
            </h4>
            <p className="text-indigo-200 text-xs leading-relaxed font-semibold">
              O StreamVerse Kids é 100% gratuito e livre de anúncios comerciais, chats e riscos de compras. Se você gosta do nosso trabalho e quer nos ajudar a manter os servidores de alta velocidade funcionando, considere fazer uma contribuição espontânea!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
              {/* QR Code Section */}
              <div className="md:col-span-4 flex flex-col items-center">
                <div className="p-3 rounded-2xl bg-white border border-indigo-500/10 shadow-lg group overflow-hidden">
                  <div className="w-32 h-32 flex items-center justify-center relative bg-white rounded-xl select-none">
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="Pix QR Code" className="w-full h-full object-contain rounded-xl" />
                    ) : (
                      <div className="size-full flex items-center justify-center bg-slate-50 text-slate-400">
                        <QrCode className="size-10 animate-pulse" />
                      </div>
                    )}
                    {qrCodeUrl && (
                      <div className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-[#0E062F] border-2 border-white flex items-center justify-center shadow-lg pointer-events-none">
                        <Heart className="size-3 text-pink-500 fill-pink-500" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-center mt-2.5">
                  <span className="text-[10px] text-indigo-300 font-extrabold uppercase tracking-widest">Escaneie com seu Banco</span>
                  <span className="text-[11px] text-pink-400 font-black block mt-0.5">
                    {pixAmount ? `Valor: R$ ${parseFloat(pixAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Escolha o valor abaixo!'}
                  </span>
                </div>
              </div>

              {/* Form & Copy Pix Section */}
              <div className="md:col-span-8 flex flex-col gap-3 text-left">
                {/* Price Options */}
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest block">Escolha ou digite um valor</span>
                  <div className="grid grid-cols-5 gap-1">
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
                          className={`py-1.5 rounded-lg text-[10px] font-black transition-all border ${
                            isSelected
                              ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white border-pink-400 shadow-md scale-[1.03]'
                              : 'bg-white/5 border-white/5 text-indigo-200/60 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          R$ {numericVal}
                        </button>
                      );
                    })}
                  </div>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-indigo-300/40 text-[10px] font-bold font-mono">Outro Valor: R$</span>
                    </div>
                    <input
                      type="text"
                      value={customAmount}
                      onChange={(e) => handleCustomAmountChange(e.target.value)}
                      placeholder="0,00"
                      className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-indigo-400 transition-all rounded-lg py-2 pl-24 pr-3 outline-none text-xs text-white font-black placeholder:text-white/20"
                    />
                  </div>
                </div>

                {/* Optional donor identification */}
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest block">Identifique seu apoio (Opcional)</span>
                  <input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value.substring(0, 15))}
                    placeholder="Ex: Seu Nome ou Família"
                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-indigo-400 transition-all rounded-lg py-1.5 px-3 outline-none text-xs text-white font-semibold placeholder:text-white/20"
                  />
                </div>

                {/* Copie e Cole */}
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest block">Código Pix Copie e Cole</span>
                  <div className="flex bg-white/5 border border-white/10 rounded-lg p-1.5 items-center justify-between gap-2 hover:border-indigo-500/25 transition-colors">
                    <code className="text-indigo-200 font-mono text-[9px] select-all truncate pl-1 font-bold max-w-[200px] sm:max-w-[240px]">
                      {pixPayload || 'Gerando código...'}
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopy(pixPayload, 'pix')}
                      disabled={!pixPayload}
                      className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 font-black text-[8px] uppercase tracking-wider shrink-0 transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50"
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

                {/* Pix Security Info */}
                <div className="flex gap-2 items-start bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-lg text-left">
                  <Shield className="size-4 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                  <div className="leading-tight">
                    <span className="text-[8px] font-black text-emerald-300 uppercase tracking-wider block">Doação Pix Segura</span>
                    <span className="text-[8px] text-emerald-400/70 block mt-0.5 leading-normal font-semibold">
                      Chave Pix: {supportSystemConfig.pix?.key} ({supportSystemConfig.pix?.recipient})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 bg-black/40 border-t border-indigo-500/20 text-center shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-10 py-3 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)]"
          >
            Voltar ao Modo Kids
          </button>
        </div>

      </div>
    </div>
  );
}
