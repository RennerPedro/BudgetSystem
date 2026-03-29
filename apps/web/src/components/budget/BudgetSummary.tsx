'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Budget, ExpenseStats } from '@/types';
import { formatCurrency, getMonthName } from '@/lib/utils';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';

interface BudgetSummaryProps {
  budget: Budget;
  stats?: ExpenseStats;
}

export function BudgetSummary({ budget, stats }: BudgetSummaryProps) {
  const variableSpent = stats?.byType?.VARIABLE ?? budget.totalSpent;
  const fixedSpent = stats?.byType?.FIXED ?? 0;
  const fixedPlanned = budget.totalFixed;
  const totalSpentInMonth = variableSpent + fixedSpent;
  const remainingRealBalance = budget.totalIncome - totalSpentInMonth;
  const variablePercentage = budget.totalIncome > 0
    ? (variableSpent / budget.totalIncome) * 100
    : 0;
  const daysInMonth = new Date(budget.year, budget.month, 0).getDate();
  const currentDay = new Date().getDate();
  const progressPercentage = (currentDay / daysInMonth) * 100;

  return (
    <Card>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-[var(--text-2xl)] font-semibold text-[var(--text-primary)]">
            {getMonthName(budget.month)} {budget.year}
          </h2>
          <p className="mt-1 text-[var(--text-sm)] text-[var(--text-secondary)]">Orçamento do mês</p>
        </div>
        <Badge variant={budget.status}>{budget.status}</Badge>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="card-shell p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="stat-label">Renda Mensal</span>
            <DollarSign className="h-4 w-4 text-[var(--text-secondary)]" />
          </div>
          <p className="stat-value-primary">
            {formatCurrency(budget.totalIncome)}
          </p>
        </div>

        <div className="card-shell p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="stat-label">Fixos Planejados</span>
            <Calendar className="h-4 w-4 text-[var(--text-secondary)]" />
          </div>
          <p className="stat-value">
            {formatCurrency(fixedPlanned)}
          </p>
          <p className="stat-note mt-2">
            Lançados em despesas: {formatCurrency(fixedSpent)}
          </p>
        </div>

        <div className="card-shell p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="stat-label">Gastos Variáveis</span>
            <TrendingDown className="h-4 w-4 text-[var(--text-secondary)]" />
          </div>
          <p className="stat-value">
            {formatCurrency(variableSpent)}
          </p>
          <p className="financial-figure mt-2 text-[var(--text-xs)] text-[var(--accent-warning)]">
            {variablePercentage.toFixed(1)}% da renda mensal (somente variáveis)
          </p>
          <p className="stat-note financial-figure mt-1">
            Total lançado no mês: {formatCurrency(totalSpentInMonth)}
          </p>
        </div>

        <div className="card-shell p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="stat-label">Saldo Restante</span>
            <TrendingUp className="h-4 w-4 text-[var(--text-secondary)]" />
          </div>
          <p className="stat-value-primary">
            {formatCurrency(remainingRealBalance)}
          </p>
          <p className="stat-note mt-2">
            Renda - total lançado
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[var(--text-sm)] font-medium text-[var(--text-secondary)]">
              Progresso do mês
            </span>
            <span className="financial-figure text-[var(--text-sm)] text-[var(--text-secondary)]">
              Dia {currentDay} de {daysInMonth}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-[var(--surface-overlay)]">
            <div
              className="h-2 rounded-full bg-[var(--accent-primary)] transition-all"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>

        <div className="border-t border-[var(--border-subtle)] pt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[var(--text-sm)] font-medium text-[var(--text-secondary)]">
              Orçamento diário atual
            </span>
            <span className="financial-figure text-[var(--text-xl)] font-semibold text-[var(--accent-primary)]">
              {formatCurrency(budget.dailyBudget)}
            </span>
          </div>
          <p className="text-[var(--text-xs)] text-[var(--text-secondary)]">
            Estratégia: <span className="font-medium text-[var(--text-primary)]">{budget.strategy}</span>
          </p>
        </div>
      </div>
    </Card>
  );
}
