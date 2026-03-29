import { api } from '@/lib/api';
import { Budget, StrategyType } from '@/types';

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

  async getAdjustmentHistory(): Promise<any[]> {
    const { data } = await api.get<any[]>('/budget/adjustments');
    return data;
  },
};
