'use client';

import { useEffect, useState } from 'react';
import { useBudget } from '@/hooks/useBudget';
import { BudgetSummary } from '@/components/budget/BudgetSummary';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { ExpenseList } from '@/components/expenses/ExpenseList';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useExpenses } from '@/hooks/useExpenses';
import { Plus, TrendingUp } from 'lucide-react';
import { useDeepSeek } from '@/hooks/useDeepSeek';
import { useBudgetPrediction } from '@/hooks/useBudgetPrediction';
import { AISetupModal } from '@/components/ai/AISetupModal';
import { ChatBubble } from '@/components/ai/ChatBubble';
import { ChatPanel } from '@/components/ai/ChatPanel';
import { StrategyType } from '@/types';

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
  const { keyStatus, isLoadingStatus } = useDeepSeek();
  const budgetMonth = budget?.month ?? currentMonth;
  const budgetYear = budget?.year ?? currentYear;

  const shouldLoadPrediction = !!budget && budget.strategy === 'SMART' && !!keyStatus?.enabled;
  const { data: predictionResult } = useBudgetPrediction(budget, shouldLoadPrediction);

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
  const [showAIModal, setShowAIModal] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (budget) {
      setIncomeInput(budget.totalIncome.toFixed(2));
      setFixedInput(budget.totalFixed.toFixed(2));
      setSelectedStrategy(budget.strategy);
    }
  }, [budget]);

  useEffect(() => {
    if (!isLoadingStatus && keyStatus && !keyStatus.configured && budget) {
      setShowAIModal(true);
    }
  }, [budget, isLoadingStatus, keyStatus]);

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
      <div className="space-y-6">
        <div className="skeleton h-12 w-56" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className="skeleton h-36" />
          <div className="skeleton h-36" />
          <div className="skeleton h-36" />
          <div className="skeleton h-36" />
        </div>
        <div className="skeleton h-64" />
      </div>
    );
  }

  if (!budget && !showCreateBudget) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <div className="text-center py-12">
            <TrendingUp className="mx-auto mb-4 h-12 w-12 text-[var(--text-tertiary)]" />
            <h2 className="mb-2 text-[var(--text-2xl)] font-semibold text-[var(--text-primary)]">
              Bem-vindo ao Budget System!
            </h2>
            <p className="mb-6 text-[var(--text-base)] text-[var(--text-secondary)]">
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
              <label className="mb-2 block text-[var(--text-sm)] font-medium text-[var(--text-secondary)]">
                Estratégia de Orçamento
              </label>
              <select
                className="input-shell"
                value={strategy}
                onChange={(e) => setStrategy(e.target.value as StrategyType)}
              >
                <option value="LINEAR">Linear - Distribuição uniforme</option>
                <option value="AGGRESSIVE">Agressiva - Correção rápida de excessos</option>
                <option value="SMART">Inteligente - Baseada em padrões (AI-ready)</option>
              </select>
              <p className="mt-2 text-[var(--text-sm)] text-[var(--text-secondary)]">
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
      <div className="section-header">
        <div>
          <h1 className="text-[var(--text-2xl)] font-semibold text-[var(--text-primary)]">Dashboard</h1>
          <p className="mt-1 text-[var(--text-base)] text-[var(--text-secondary)]">Visão consolidada de orçamento e despesas</p>
        </div>
      </div>

      {budget && (
        <>
          <BudgetSummary budget={budget} stats={stats} aiPrediction={predictionResult?.prediction || null} />

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
                    <label className="mb-2 block text-[var(--text-sm)] font-medium text-[var(--text-secondary)]">
                      Estratégia Atual: <span className="font-semibold text-[var(--accent-primary)]">{budget.strategy}</span>
                    </label>
                    <select
                      className="input-shell"
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
                    <p className="text-[var(--text-sm)] text-[var(--accent-primary)]">Atualizando estratégia...</p>
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

                <form onSubmit={handleUpdateFixed} className="mt-5 space-y-3 border-t border-[var(--border-subtle)] pt-5">
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
            </div>
          </div>
        </>
      )}

      <AISetupModal open={showAIModal} onClose={() => setShowAIModal(false)} />
      {keyStatus?.enabled && (
        <>
          <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
          <ChatBubble onClick={() => setChatOpen((prev) => !prev)} />
        </>
      )}
    </div>
  );
}
