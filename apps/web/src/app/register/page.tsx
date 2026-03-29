'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.register({
        email: email.trim().toLowerCase(),
        password,
      });
      login(response.access_token, response.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--surface-base)] p-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-[var(--text-display)] font-semibold text-[var(--text-primary)]">Budget System</h1>
          <p className="mt-2 text-[var(--text-base)] text-[var(--text-secondary)]">Controle financeiro com precisão operacional</p>
        </div>

        <Card>
          <h2 className="mb-6 text-[var(--text-2xl)] font-semibold text-[var(--text-primary)]">Criar Conta</h2>

          {error && (
            <div className="mb-4 rounded-lg border border-[rgba(255,77,77,0.45)] bg-[rgba(255,77,77,0.12)] p-3">
              <p className="text-[var(--text-sm)] text-[var(--accent-danger)]">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Input
              label="Confirmar Senha"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Criar Conta
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[var(--text-sm)] text-[var(--text-secondary)]">
              Já tem uma conta?{' '}
              <Link href="/login" className="font-medium text-[var(--accent-primary)] hover:opacity-90">
                Entrar
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
