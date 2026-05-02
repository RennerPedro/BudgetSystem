'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Budget, ExpenseStats, AIBudgetPrediction } from '@/types';
import { formatCurrency, getMonthName } from '@/lib/utils';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { AIBadge } from '@/components/ai/AIBadge';

interface BudgetSummaryProps {
  budget: Budget;
  stats?: ExpenseStats;
  aiPrediction?: AIBudgetPrediction | null;
}

export function BudgetSummary({ budget, stats, aiPrediction }: BudgetSummaryProps) {
  const variableSpent = stats?.byType?.VARIABLE ?? budget.totalSpent;
  const fixedPlanned = budget.totalFixed;
  const totalSpentInMonth = variableSpent;
  const remainingRealBalance = budget.totalIncome - fixedPlanned - totalSpentInMonth;
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
        <div className="flex items-center gap-2">
          {aiPrediction && <AIBadge />}
          <Badge variant={budget.status}>{budget.status}</Badge>
        </div>
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
            {variablePercentage.toFixed(1)}% da renda mensal
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

          {aiPrediction && (
            <div className="mt-4 rounded-xl border border-[var(--accent-primary)]/25 bg-[var(--accent-primary)]/8 p-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[var(--text-xs)] font-semibold uppercase tracking-[0.08em] text-[var(--accent-primary)]">
                  Previsao da IA
                </span>
                <span className="text-[var(--text-xs)] text-[var(--text-secondary)]">
                  Confianca: {(aiPrediction.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-[var(--text-sm)] text-[var(--text-primary)]">
                Orcamento diario recomendado: <strong>{formatCurrency(aiPrediction.recommendedDailyBudget)}</strong>
              </p>
              <p className="mt-1 text-[var(--text-xs)] text-[var(--text-secondary)]">
                Nivel de risco: {aiPrediction.riskLevel} | Gasto mensal previsto: {formatCurrency(aiPrediction.predictedTotalSpent)}
              </p>
              {aiPrediction.insights?.length > 0 && (
                <p className="mt-2 text-[var(--text-xs)] text-[var(--text-secondary)]">
                  {aiPrediction.insights[0]}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
