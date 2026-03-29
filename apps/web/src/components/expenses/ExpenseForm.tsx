'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useExpenses } from '@/hooks/useExpenses';
import { ExpenseType } from '@/types';

interface ExpenseFormProps {
  month?: number;
  year?: number;
}

export function ExpenseForm({ month, year }: ExpenseFormProps = {}) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<ExpenseType>('VARIABLE');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const { createExpense, isCreating } = useExpenses(month, year);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createExpense(
      {
        amount: parseFloat(amount),
        category,
        type,
        date,
      },
      {
        onSuccess: () => {
          setAmount('');
          setCategory('');
          setType('VARIABLE');
          setDate(new Date().toISOString().split('T')[0]);
        },
      }
    );
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoria
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="alimentação, transporte, lazer..."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={type}
            onChange={(e) => setType(e.target.value as ExpenseType)}
          >
            <option value="VARIABLE">Variável</option>
            <option value="FIXED">Fixa</option>
          </select>
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
