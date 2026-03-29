'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useExpenses } from '@/hooks/useExpenses';
import { Expense, ExpenseStats } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Trash2 } from 'lucide-react';

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
        <p className="text-center text-gray-500 py-8">
          Nenhuma despesa registrada ainda.
        </p>
      </Card>
    );
  }

  return (
    <Card title="Despesas do Mês">
      <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
        <span className="font-medium">Variáveis:</span> {formatCurrency(totalVariable)}
        {' • '}
        <span className="font-medium">Fixas:</span> {formatCurrency(totalFixed)}
        {' • '}
        <span className="font-medium">Total listado:</span> {formatCurrency(totalVariable + totalFixed)}
      </div>

      <div className="space-y-3">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900 capitalize">
                  {expense.category}
                </span>
                <Badge variant="default">{expense.type}</Badge>
              </div>
              <p className="text-sm text-gray-600">
                {formatDate(expense.date)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(expense.amount)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteExpense(expense.id)}
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4 text-danger-600" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
