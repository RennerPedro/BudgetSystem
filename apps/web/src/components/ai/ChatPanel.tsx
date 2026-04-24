'use client';

import { useMemo, useState } from 'react';
import { Send, X } from 'lucide-react';
import { useChatAssistant } from '@/hooks/useChatAssistant';
import { Button } from '@/components/ui/Button';

interface ChatPanelProps {
  open: boolean;
  onClose: () => void;
}

export function ChatPanel({ open, onClose }: ChatPanelProps) {
  const { history, ask, isAsking } = useChatAssistant(open);
  const [message, setMessage] = useState('');

  const quickActions = useMemo(
    () => [
      'Quanto posso gastar com seguranca hoje?',
      'Em qual categoria estou gastando demais?',
      'Consigo arcar com uma despesa de R$ 500 na proxima semana?',
    ],
    [],
  );

  if (!open) {
    return null;
  }

  const submit = () => {
    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }

    ask(trimmed);
    setMessage('');
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 w-[min(94vw,420px)] rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-base)] shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
        <div>
          <h3 className="text-[var(--text-base)] font-semibold text-[var(--text-primary)]">Assistente Finley</h3>
          <p className="text-[var(--text-xs)] text-[var(--text-secondary)]">Pergunte sobre orcamento, risco e planejamento de gastos</p>
        </div>
        <button onClick={onClose} className="text-[var(--text-secondary)]">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="max-h-[340px] space-y-3 overflow-y-auto px-4 py-3">
        {history.length === 0 && (
          <div className="space-y-2">
            {quickActions.map((action) => (
              <button
                key={action}
                className="w-full rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-left text-[var(--text-xs)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-overlay)] disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => ask(action)}
                disabled={isAsking}
                type="button"
              >
                {action}
              </button>
            ))}
          </div>
        )}

        {history.map((item) => (
          <div
            key={item.id}
            className={`max-w-[92%] rounded-xl px-3 py-2 text-[var(--text-sm)] ${
              item.role === 'assistant'
                ? 'bg-[var(--surface-overlay)] text-[var(--text-primary)]'
                : 'ml-auto bg-[var(--accent-primary)] text-white'
            }`}
          >
            {item.content}
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--border-subtle)] p-3">
        <div className="flex gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Pergunte ao Finley sobre seu orcamento..."
            className="input-shell"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                submit();
              }
            }}
          />
          <Button onClick={submit} disabled={isAsking || !message.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
