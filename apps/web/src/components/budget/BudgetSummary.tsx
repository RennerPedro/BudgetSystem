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
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {getMonthName(budget.month)} {budget.year}
          </h2>
          <p className="text-sm text-gray-600">Orçamento do mês</p>
        </div>
        <Badge variant={budget.status}>{budget.status}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-primary-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-primary-700">Renda Mensal</span>
            <DollarSign className="w-5 h-5 text-primary-600" />
          </div>
          <p className="text-2xl font-bold text-primary-900">
            {formatCurrency(budget.totalIncome)}
          </p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-700">Fixos Planejados</span>
            <Calendar className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(fixedPlanned)}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Lançados em despesas: {formatCurrency(fixedSpent)}
          </p>
        </div>

        <div className="p-4 bg-warning-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-warning-700">Gastos Variáveis</span>
            <TrendingDown className="w-5 h-5 text-warning-600" />
          </div>
          <p className="text-2xl font-bold text-warning-900">
            {formatCurrency(variableSpent)}
          </p>
          <p className="text-xs text-warning-700 mt-1">
            {variablePercentage.toFixed(1)}% da renda mensal
          </p>
          <p className="text-xs text-warning-700 mt-1">
            Total lançado no mês: {formatCurrency(totalSpentInMonth)}
          </p>
        </div>

        <div className="p-4 bg-success-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-success-700">Saldo Restante</span>
            <TrendingUp className="w-5 h-5 text-success-600" />
          </div>
          <p className="text-2xl font-bold text-success-900">
            {formatCurrency(remainingRealBalance)}
          </p>
          <p className="text-xs text-success-700 mt-1">
            Renda - total lançado
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progresso do mês
            </span>
            <span className="text-sm text-gray-600">
              Dia {currentDay} de {daysInMonth}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Orçamento diário atual
            </span>
            <span className="text-lg font-bold text-primary-600">
              {formatCurrency(budget.dailyBudget)}
            </span>
          </div>
          <p className="text-xs text-gray-600">
            Estratégia: <span className="font-medium">{budget.strategy}</span>
          </p>
        </div>
      </div>
    </Card>
  );
}
