'use client';

import { useState } from 'react';
import { AxiosError, isAxiosError } from 'axios';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useDeepSeek } from '@/hooks/useDeepSeek';

type ApiErrorResponse = {
  message?: string | string[];
};

interface AISetupModalProps {
  open: boolean;
  onClose: () => void;
}

export function AISetupModal({ open, onClose }: AISetupModalProps) {
  const { setApiKey, isSettingKey } = useDeepSeek();
  const [apiKey, setApiKeyValue] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorText, setErrorText] = useState('');

  if (!open) {
    return null;
  }

  const handleSave = () => {
    setStatus('testing');
    setErrorText('');

    setApiKey(
      { apiKey, autoEnable: true },
      {
        onSuccess: () => {
          setStatus('success');
          setTimeout(() => {
            onClose();
          }, 800);
        },
        onError: (error: Error) => {
          setStatus('error');
          const axiosError = isAxiosError(error)
            ? (error as AxiosError<ApiErrorResponse>)
            : undefined;
          const apiMessage = axiosError?.response?.data?.message;
          setErrorText(
            Array.isArray(apiMessage)
              ? apiMessage[0] || 'Falha ao validar a chave da API'
              : apiMessage || 'Falha ao validar a chave da API',
          );
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-base)] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.25)]">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[var(--accent-primary)]/10 px-3 py-1 text-[11px] font-semibold text-[var(--accent-primary)]">
              <Sparkles className="h-3.5 w-3.5" />
              Desbloqueie o Orcamento com IA
            </div>
            <h3 className="text-[var(--text-xl)] font-semibold text-[var(--text-primary)]">
              Ative Previsoes Inteligentes
            </h3>
            <p className="mt-1 text-[var(--text-sm)] text-[var(--text-secondary)]">
              Cole sua chave da DeepSeek uma unica vez e ative insights personalizados.
            </p>
          </div>
        </div>

        <label className="mb-2 block text-[var(--text-sm)] font-medium text-[var(--text-secondary)]">
          DeepSeek API Key
        </label>
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            className="input-shell pr-12"
            placeholder="sk-proj-..."
            value={apiKey}
            onChange={(e) => setApiKeyValue(e.target.value)}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
            onClick={() => setShowKey((prev) => !prev)}
          >
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <p className="mt-2 text-[var(--text-xs)] text-[var(--text-secondary)]">
          Obtenha sua chave em platform.deepseek.com/api_keys. Sua chave e criptografada com AES-256-GCM e armazenada com seguranca.
        </p>

        {status === 'error' && (
          <p className="mt-3 rounded-lg border border-[var(--accent-danger)]/20 bg-[var(--accent-danger)]/10 p-2 text-[var(--text-xs)] text-[var(--accent-danger)]">
            {errorText}
          </p>
        )}

        {status === 'success' && (
          <p className="mt-3 rounded-lg border border-emerald-300/30 bg-emerald-400/10 p-2 text-[var(--text-xs)] text-emerald-600">
            Chave validada com sucesso. Os recursos de IA ja estao ativos.
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isSettingKey}>
            Depois
          </Button>
          <Button
            onClick={handleSave}
            isLoading={isSettingKey || status === 'testing'}
            disabled={!apiKey.trim()}
          >
            Testar e Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}
