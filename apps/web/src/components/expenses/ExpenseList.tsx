'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useExpenses } from '@/hooks/useExpenses';
import { Expense, ExpenseStats } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Receipt, Trash2 } from 'lucide-react';

interface ExpenseListProps {
  month?: number;
  year?: number;
  expenses?: Expense[];
  stats?: ExpenseStats;
  deleteExpense?: (id: string) => void;
  isDeleting?: boolean;
}

export function ExpenseList({
  month,
  year,
  expenses: expensesFromProps,
  stats: statsFromProps,
  deleteExpense: deleteExpenseFromProps,
  isDeleting: isDeletingFromProps,
}: ExpenseListProps = {}) {
  const now = new Date();
  const resolvedMonth = month ?? now.getMonth() + 1;
  const resolvedYear = year ?? now.getFullYear();

  const {
    expenses: expensesFromHook,
    stats: statsFromHook,
    deleteExpense: deleteExpenseFromHook,
    isDeleting: isDeletingFromHook,
  } = useExpenses(
    resolvedMonth,
    resolvedYear,
  );

  const expenses = expensesFromProps ?? expensesFromHook;
  const stats = statsFromProps ?? statsFromHook;
  const deleteExpense = deleteExpenseFromProps ?? deleteExpenseFromHook;
  const isDeleting = isDeletingFromProps ?? isDeletingFromHook;

  const totalVariable = stats?.byType?.VARIABLE || 0;
  const totalFixed = stats?.byType?.FIXED || 0;

  if (expenses.length === 0) {
    return (
      <Card title="Despesas do Mês">
        <div className="py-10 text-center">
          <Receipt className="mx-auto mb-3 h-8 w-8 text-[var(--text-tertiary)]" />
          <p className="text-[var(--text-base)] text-[var(--text-secondary)]">Nenhuma despesa registrada neste período.</p>
          <p className="mt-1 text-[var(--text-sm)] text-[var(--text-tertiary)]">Adicione uma despesa para iniciar o acompanhamento.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Despesas do Mês">
      <div className="mb-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-overlay)] p-3 text-[var(--text-sm)] text-[var(--text-secondary)]">
        <span className="font-medium text-[var(--text-primary)]">Variáveis:</span>{' '}
        <span className="financial-figure">{formatCurrency(totalVariable)}</span>
        {' • '}
        <span className="font-medium text-[var(--text-primary)]">Fixas:</span>{' '}
        <span className="financial-figure">{formatCurrency(totalFixed)}</span>
        {' • '}
        <span className="font-medium text-[var(--text-primary)]">Total listado:</span>{' '}
        <span className="financial-figure">{formatCurrency(totalVariable + totalFixed)}</span>
      </div>

      <div className="overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-raised)]">
        <div className="grid min-h-12 grid-cols-[1.7fr_0.9fr_0.8fr_72px] items-center border-b border-[var(--border-subtle)] px-4 text-[11px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
          <span>Categoria</span>
          <span>Tipo</span>
          <span className="text-right">Valor</span>
          <span className="text-right">Ação</span>
        </div>

        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="grid min-h-12 grid-cols-[1.7fr_0.9fr_0.8fr_72px] items-center border-b border-[var(--border-subtle)] px-4 transition-colors hover:bg-[var(--accent-primary-muted)]"
          >
            <div className="py-3">
              <p className="text-[var(--text-base)] font-medium capitalize text-[var(--text-primary)]">{expense.category}</p>
              <p className="financial-figure text-[var(--text-xs)] text-[var(--text-secondary)]">{formatDate(expense.date)}</p>
            </div>

            <div>
              <Badge
                variant="default"
                className={expense.type === 'FIXED'
                  ? 'border-[rgba(245,166,35,0.35)] bg-[rgba(245,166,35,0.16)] text-[var(--accent-warning)]'
                  : 'border-[rgba(45,127,249,0.35)] bg-[var(--accent-primary-muted)] text-[var(--accent-primary)]'}
              >
                {expense.type}
              </Badge>
            </div>

            <div className="text-right">
              <span className="financial-figure text-[var(--text-base)] font-semibold text-[var(--text-primary)]">
                {formatCurrency(expense.amount)}
              </span>
            </div>

            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteExpense(expense.id)}
                disabled={isDeleting}
                aria-label="Excluir despesa"
              >
                <Trash2 className="h-4 w-4 text-[var(--accent-danger)]" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
