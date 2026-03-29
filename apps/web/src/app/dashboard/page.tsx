'use client';

import { useEffect, useState } from 'react';
import { useBudget } from '@/hooks/useBudget';
import { BudgetSummary } from '@/components/budget/BudgetSummary';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { ExpenseList } from '@/components/expenses/ExpenseList';
import { AlertsPanel } from '@/components/alerts/AlertsPanel';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useExpenses } from '@/hooks/useExpenses';
import { Plus, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const {
    budget,
    isLoading,
    createBudget,
    isCreating,
    updateStrategy,
    isUpdatingStrategy,
    updateIncome,
    isUpdatingIncome,
    updateFixed,
    isUpdatingFixed,
  } = useBudget();
  const budgetMonth = budget?.month ?? currentMonth;
  const budgetYear = budget?.year ?? currentYear;

  const {
    expenses,
    stats,
    deleteExpense,
    isDeleting,
  } = useExpenses(budgetMonth, budgetYear);
  const [showCreateBudget, setShowCreateBudget] = useState(false);
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [monthlyFixed, setMonthlyFixed] = useState('');
  const [incomeInput, setIncomeInput] = useState('');
  const [fixedInput, setFixedInput] = useState('');
  const [selectedStrategy, setSelectedStrategy] = useState<'LINEAR' | 'AGGRESSIVE' | 'SMART'>('LINEAR');
  const [strategy, setStrategy] = useState<'LINEAR' | 'AGGRESSIVE' | 'SMART'>('LINEAR');

  useEffect(() => {
    if (budget) {
      setIncomeInput(budget.totalIncome.toFixed(2));
      setFixedInput(budget.totalFixed.toFixed(2));
      setSelectedStrategy(budget.strategy);
    }
  }, [budget]);

  const handleCreateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedIncome = parseFloat(monthlyIncome);
    const parsedFixed = parseFloat(monthlyFixed);

    if (Number.isNaN(parsedIncome) || parsedIncome < 0) {
      return;
    }

    if (Number.isNaN(parsedFixed) || parsedFixed < 0) {
      return;
    }

    createBudget(
      {
        totalIncome: parsedIncome,
        totalFixed: parsedFixed,
        strategy,
      },
      {
        onSuccess: () => {
          setShowCreateBudget(false);
          setMonthlyIncome('');
          setMonthlyFixed('');
        },
      }
    );
  };

  const handleUpdateIncome = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedIncome = parseFloat(incomeInput);
    if (Number.isNaN(parsedIncome) || parsedIncome < 0) {
      return;
    }

    updateIncome(parsedIncome);
  };

  const handleUpdateFixed = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedFixed = parseFloat(fixedInput);
    if (Number.isNaN(parsedFixed) || parsedFixed < 0) {
      return;
    }

    updateFixed(parsedFixed);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!budget && !showCreateBudget) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-primary-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Bem-vindo ao Budget System!
            </h2>
            <p className="text-gray-600 mb-6">
              Comece criando seu orçamento para o mês atual
            </p>
            <Button onClick={() => setShowCreateBudget(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Orçamento
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (showCreateBudget) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card title="Criar Orçamento Mensal">
          <form onSubmit={handleCreateBudget} className="space-y-6">
            <Input
              label="Valor Recebido Mensal"
              type="number"
              step="0.01"
              placeholder="Ex: 3500.00"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              required
            />

            <Input
              label="Fixos do Mês"
              type="number"
              step="0.01"
              placeholder="Ex: 1300.00"
              value={monthlyFixed}
              onChange={(e) => setMonthlyFixed(e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estratégia de Orçamento
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={strategy}
                onChange={(e) => setStrategy(e.target.value as any)}
              >
                <option value="LINEAR">Linear - Distribuição uniforme</option>
                <option value="AGGRESSIVE">Agressiva - Correção rápida de excessos</option>
                <option value="SMART">Inteligente - Baseada em padrões (AI-ready)</option>
              </select>
              <p className="mt-2 text-sm text-gray-600">
                {strategy === 'LINEAR' && 'Divide o saldo restante igualmente pelos dias que faltam.'}
                {strategy === 'AGGRESSIVE' && 'Aplica correções agressivas quando detecta gastos excessivos.'}
                {strategy === 'SMART' && 'Analisa padrões de gasto e faz previsões inteligentes.'}
              </p>
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1" isLoading={isCreating}>
                Criar Orçamento
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowCreateBudget(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Visão geral do seu orçamento e gastos</p>
      </div>

      {budget && (
        <>
          <BudgetSummary budget={budget} stats={stats} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <ExpenseList
                month={budgetMonth}
                year={budgetYear}
                expenses={expenses}
                stats={stats}
                deleteExpense={deleteExpense}
                isDeleting={isDeleting}
              />
              
              <Card title="Alterar Estratégia">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estratégia Atual: <span className="font-bold text-primary-600">{budget.strategy}</span>
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={selectedStrategy}
                      onChange={(e) => {
                        const newStrategy = e.target.value as 'LINEAR' | 'AGGRESSIVE' | 'SMART';
                        setSelectedStrategy(newStrategy);
                        updateStrategy(newStrategy);
                      }}
                      disabled={isUpdatingStrategy}
                    >
                      <option value="LINEAR">Linear - Distribuição uniforme</option>
                      <option value="AGGRESSIVE">Agressiva - Correção rápida</option>
                      <option value="SMART">Inteligente - Baseada em padrões</option>
                    </select>
                  </div>
                  {isUpdatingStrategy && (
                    <p className="text-sm text-primary-600">Atualizando estratégia...</p>
                  )}
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card title="Parâmetros do Orçamento">
                <form onSubmit={handleUpdateIncome} className="space-y-3">
                  <Input
                    label="Valor recebido no mês"
                    type="number"
                    step="0.01"
                    value={incomeInput}
                    onChange={(e) => setIncomeInput(e.target.value)}
                    required
                  />
                  <Button type="submit" className="w-full" isLoading={isUpdatingIncome}>
                    Salvar renda mensal
                  </Button>
                </form>

                <form onSubmit={handleUpdateFixed} className="space-y-3 mt-5 pt-5 border-t border-gray-200">
                  <Input
                    label="Fixos planejados do mês"
                    type="number"
                    step="0.01"
                    value={fixedInput}
                    onChange={(e) => setFixedInput(e.target.value)}
                    required
                  />
                  <Button type="submit" className="w-full" isLoading={isUpdatingFixed}>
                    Salvar fixos do mês
                  </Button>
                </form>
              </Card>

              <ExpenseForm month={budgetMonth} year={budgetYear} />
              <AlertsPanel />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
