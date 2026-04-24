'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useExpenses } from '@/hooks/useExpenses';
import { useDeepSeek } from '@/hooks/useDeepSeek';
import { deepseekService } from '@/services/deepseek.service';

interface ExpenseFormProps {
  month?: number;
  year?: number;
}

export function ExpenseForm({ month, year }: ExpenseFormProps = {}) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSuggestingCategory, setIsSuggestingCategory] = useState(false);

  const { createExpense, isCreating } = useExpenses(month, year);
  const { keyStatus } = useDeepSeek();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createExpense(
      {
        amount: parseFloat(amount),
        category,
        type: 'VARIABLE',
        date,
      },
      {
        onSuccess: () => {
          setAmount('');
          setCategory('');
          setDate(new Date().toISOString().split('T')[0]);
        },
      }
    );
  };

  const handleSuggestCategory = async () => {
    const parsedAmount = parseFloat(amount);
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    setIsSuggestingCategory(true);
    try {
      const suggestion = await deepseekService.suggestCategory(category || 'expense', parsedAmount);
      setCategory(suggestion.category);
    } finally {
      setIsSuggestingCategory(false);
    }
  };

  return (
    <Card title="Adicionar Despesa">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Valor"
          type="number"
          step="0.01"
          placeholder="100.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <div>
          <label className="mb-2 block text-[var(--text-sm)] font-medium text-[var(--text-secondary)]">
            Categoria
          </label>
          <input
            type="text"
            className="input-shell"
            placeholder="alimentação, transporte, lazer..."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
          {keyStatus?.enabled && (
            <button
              type="button"
              onClick={handleSuggestCategory}
              className="mt-2 text-[var(--text-xs)] font-medium text-[var(--accent-primary)]"
              disabled={isSuggestingCategory}
            >
              {isSuggestingCategory ? 'Sugerindo categoria...' : 'Sugerir categoria com AI'}
            </button>
          )}
        </div>

        <Input
          label="Data"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <Button type="submit" className="w-full" isLoading={isCreating}>
          Adicionar Despesa
        </Button>
      </form>
    </Card>
  );
}
