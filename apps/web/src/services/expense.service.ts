import { api } from '@/lib/api';
import { Expense, ExpenseStats, ExpenseType } from '@/types';

export interface CreateExpenseDto {
  amount: number;
  type: ExpenseType;
  category: string;
  date: string;
  autoCategorize?: boolean;
}

export const expenseService = {
  async createExpense(dto: CreateExpenseDto): Promise<Expense> {
    const { data } = await api.post<Expense>('/expenses', dto);
    return data;
  },

  async getExpenses(month?: number, year?: number): Promise<Expense[]> {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    
    const { data } = await api.get<Expense[]>(`/expenses?${params.toString()}`);
    return data;
  },

  async getExpenseById(id: string): Promise<Expense> {
    const { data } = await api.get<Expense>(`/expenses/${id}`);
    return data;
  },

  async deleteExpense(id: string): Promise<void> {
    await api.delete(`/expenses/${id}`);
  },

  async getStats(month?: number, year?: number): Promise<ExpenseStats> {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    
    const { data } = await api.get<ExpenseStats>(`/expenses/stats?${params.toString()}`);
    return data;
  },
};
