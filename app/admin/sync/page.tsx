'use client';

import { useEffect, useState, useCallback } from 'react';
import { siteConfig } from '@/config/site';
import { Navbar } from '@/components/Navbar';
import {
  RefreshCw, Play, Pause, AlertCircle, CheckCircle, Clock,
  Database, Zap, Layers, Activity, Terminal, Info
} from 'lucide-react';

const SYNC_SECRET = process.env.NEXT_PUBLIC_SYNC_SECRET || '';

type SyncStatus = {
  lastHeavySync?: string;
  lastLightSync?: string;
  isRunning: boolean;
  isPaused: boolean;
  totalItems: number;
  lastError?: string;
};

type SyncLog = {
  type: 'info' | 'success' | 'warning' | 'error';
  action: string;
  message: string;
  createdAt: string;
};

const LOG_COLORS: Record<string, string> = {
  info: 'text-blue-400',
  success: 'text-emerald-400',
  warning: 'text-amber-400',
  error: 'text-red-400',
};

const LOG_ICONS: Record<string, any> = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: AlertCircle,
};

function timeAgo(iso?: string): string {
  if (!iso) return 'Nunca';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Agora mesmo';
  if (m < 60) return `${m}m atrás`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h atrás`;
  return `${Math.floor(h / 24)}d atrás`;
}

export default function SyncAdminPage() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/sync?secret=${SYNC_SECRET}`);
      if (!res.ok) throw new Error('Não autorizado');
      const data = await res.json();
      setStatus(data.status);
      setLogs(data.logs || []);
    } catch (err: any) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const trigger = async (type: 'heavy' | 'light' | 'pause' | 'resume') => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/sync?secret=${SYNC_SECRET}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-sync-secret': SYNC_SECRET },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro desconhecido');
      setMessage({ type: 'success', text: data.message || 'Operação concluída!' });
      await fetchStatus();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (!siteConfig.features.catalogSync) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center text-white">
        <div className="text-center">
          <Database className="size-16 mx-auto mb-4 text-white/20" />
          <h2 className="text-2xl font-bold mb-2">CatalogSync Desabilitado</h2>
          <p className="text-white/40">Ative <code>catalogSync</code> em <code>config/site.ts</code></p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050510] text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10 pt-24">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#8F44FF]/20 flex items-center justify-center">
              <Database className="size-5 text-[#A661FF]" />
            </div>
            <h1 className="text-3xl font-bold">CatalogSync</h1>
            {status?.isRunning && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                EXECUTANDO
              </span>
            )}
            {status?.isPaused && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
                PAUSADO
              </span>
            )}
          </div>
          <p className="text-white/40">Sistema automático de sincronização com TMDB</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 px-5 py-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            {message.type === 'success' ? <CheckCircle className="size-5 shrink-0" /> : <AlertCircle className="size-5 shrink-0" />}
            {message.text}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#0D0F1F] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="size-4 text-[#A661FF]" />
              <span className="text-xs text-white/40 uppercase tracking-wider">Total no Catálogo</span>
            </div>
            <p className="text-3xl font-bold">{status?.totalItems ?? '—'}</p>
            <p className="text-xs text-white/30 mt-1">itens no Firestore</p>
          </div>

          <div className="bg-[#0D0F1F] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="size-4 text-emerald-400" />
              <span className="text-xs text-white/40 uppercase tracking-wider">Sync Pesado</span>
            </div>
            <p className="text-lg font-bold">{timeAgo(status?.lastHeavySync)}</p>
            <p className="text-xs text-white/30 mt-1">última execução diária</p>
          </div>

          <div className="bg-[#0D0F1F] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <RefreshCw className="size-4 text-blue-400" />
              <span className="text-xs text-white/40 uppercase tracking-wider">Sync Leve</span>
            </div>
            <p className="text-lg font-bold">{timeAgo(status?.lastLightSync)}</p>
            <p className="text-xs text-white/30 mt-1">trending a cada 6h</p>
          </div>

          <div className="bg-[#0D0F1F] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="size-4 text-amber-400" />
              <span className="text-xs text-white/40 uppercase tracking-wider">Status</span>
            </div>
            <p className="text-lg font-bold">
              {status?.isRunning ? '🔄 Executando' : status?.isPaused ? '⏸ Pausado' : '✅ Pronto'}
            </p>
            <p className="text-xs text-white/30 mt-1">estado atual</p>
          </div>
        </div>

        {/* Last Error */}
        {status?.lastError && (
          <div className="mb-6 px-5 py-4 rounded-xl flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400">
            <AlertCircle className="size-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm mb-1">Último erro</p>
              <p className="text-xs font-mono">{status.lastError}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <button
            onClick={() => trigger('heavy')}
            disabled={loading || status?.isRunning}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#8F44FF] hover:bg-[#7B2EFF] disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm transition-colors"
          >
            <Zap className="size-4" />
            Sync Pesado
          </button>

          <button
            onClick={() => trigger('light')}
            disabled={loading || status?.isRunning}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm transition-colors"
          >
            <RefreshCw className="size-4" />
            Sync Leve
          </button>

          {status?.isPaused ? (
            <button
              onClick={() => trigger('resume')}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 font-bold text-sm transition-colors"
            >
              <Play className="size-4" />
              Retomar
            </button>
          ) : (
            <button
              onClick={() => trigger('pause')}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 font-bold text-sm transition-colors"
            >
              <Pause className="size-4" />
              Pausar
            </button>
          )}

          <button
            onClick={fetchStatus}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 font-bold text-sm transition-colors border border-white/10"
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>

        {/* Schedule Info */}
        <div className="mb-8 p-5 rounded-2xl bg-[#0D0F1F] border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="size-4 text-[#A661FF]" />
            <h3 className="font-bold text-sm">Agendamento Automático</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/60">
            <div className="flex items-start gap-3">
              <span className="px-2 py-0.5 rounded bg-[#8F44FF]/20 text-[#A661FF] text-xs font-bold">DIÁRIO</span>
              <span>Sync pesado às 03:00 UTC — atualiza todo o catálogo, metadados, animes e score</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-xs font-bold">A CADA 6H</span>
              <span>Sync leve — atualiza trending, populares e lançamentos do dia</span>
            </div>
          </div>
        </div>

        {/* Logs */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="size-4 text-white/40" />
            <h3 className="font-bold text-sm text-white/60 uppercase tracking-wider">Logs Recentes</h3>
          </div>
          <div className="rounded-2xl bg-[#080A18] border border-white/5 overflow-hidden">
            {logs.length === 0 ? (
              <div className="py-12 text-center text-white/30 text-sm">
                Nenhum log encontrado
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {logs.map((log, i) => {
                  const Icon = LOG_ICONS[log.type] || Info;
                  return (
                    <div key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                      <Icon className={`size-4 shrink-0 mt-0.5 ${LOG_COLORS[log.type]}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-bold text-white/50 uppercase tracking-wider">{log.action}</span>
                          <span className="text-xs text-white/25">{new Date(log.createdAt).toLocaleString('pt-BR')}</span>
                        </div>
                        <p className="text-sm text-white/70 font-mono">{log.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
