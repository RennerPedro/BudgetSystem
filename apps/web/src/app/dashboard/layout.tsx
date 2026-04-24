'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { QueryProvider } from '@/providers/query-provider';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AIHeaderKeyButton } from '@/components/ai/AIHeaderKeyButton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user, logout, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <QueryProvider>
      <div className="min-h-screen bg-[var(--surface-base)]">
        <nav className="border-b border-[var(--border-subtle)] bg-[var(--surface-base)]">
          <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-8">
              <div className="flex items-center">
                <h1 className="text-[var(--text-xl)] font-semibold text-[var(--text-primary)]">
                  Budget System
                </h1>
              </div>

              <div className="flex items-center gap-4">
                <AIHeaderKeyButton />
                <span className="financial-figure text-[var(--text-sm)] text-[var(--text-secondary)]">{user?.email}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </div>
          </div>
        </nav>

        <main className="mx-auto w-full max-w-[1200px] px-8 py-8">
          {children}
        </main>
      </div>
    </QueryProvider>
  );
}
