import { api } from '@/lib/api';
import { Budget, StrategyType } from '@/types';

export interface BudgetAdjustment {
  id: string;
  budgetId: string;
  previousDailyBudget: number;
  newDailyBudget: number;
  adjustment: number;
  reason: string;
  strategy: StrategyType;
  status: string;
  createdAt: string;
}

export interface CreateBudgetDto {
  totalIncome: number;
  totalFixed: number;
  strategy?: StrategyType;
}

export const budgetService = {
  async createBudget(dto: CreateBudgetDto): Promise<Budget> {
    const { data } = await api.post<Budget>('/budget', dto);
    return data;
  },

  async getCurrentBudget(): Promise<Budget> {
    const { data } = await api.get<Budget>('/budget/current');
    return data;
  },

  async updateStrategy(strategy: StrategyType): Promise<Budget> {
    const { data } = await api.put<Budget>('/budget/strategy', { strategy });
    return data;
  },

  async updateIncome(totalIncome: number): Promise<Budget> {
    const { data } = await api.put<Budget>('/budget/income', { totalIncome });
    return data;
  },

  async updateFixed(totalFixed: number): Promise<Budget> {
    const { data } = await api.put<Budget>('/budget/fixed', { totalFixed });
    return data;
  },

  async getAdjustmentHistory(): Promise<BudgetAdjustment[]> {
    const { data } = await api.get<BudgetAdjustment[]>('/budget/adjustments');
    return data;
  },
};
