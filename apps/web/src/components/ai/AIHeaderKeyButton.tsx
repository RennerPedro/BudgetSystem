'use client';

import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useDeepSeek } from '@/hooks/useDeepSeek';
import { AISetupModal } from '@/components/ai/AISetupModal';

export function AIHeaderKeyButton() {
  const [open, setOpen] = useState(false);
  const { keyStatus, isLoadingStatus } = useDeepSeek();

  if (isLoadingStatus) {
    return null;
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        title="Configurar API Key da DeepSeek"
      >
        <KeyRound className="mr-2 h-4 w-4" />
        {keyStatus?.configured ? 'IA Configurada' : 'Configurar IA'}
      </Button>

      <AISetupModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
