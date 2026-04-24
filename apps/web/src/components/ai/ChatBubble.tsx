'use client';

import { MessageSquare } from 'lucide-react';

interface ChatBubbleProps {
  onClick: () => void;
}

export function ChatBubble({ onClick }: ChatBubbleProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-primary)] text-white shadow-[0_12px_35px_rgba(0,0,0,0.28)] transition-transform hover:scale-105"
      aria-label="Open budget assistant"
    >
      <MessageSquare className="h-6 w-6" />
    </button>
  );
}
