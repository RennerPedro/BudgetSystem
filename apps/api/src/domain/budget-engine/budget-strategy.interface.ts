import { BudgetStatus } from '../types';

export interface BudgetContext {
  totalIncome: number;
  totalFixed: number;
  totalSpent: number;
  totalDays: number;
  currentDay: number;
  previousDailyBudget: number;
  targetReservePercent?: number;
}

export interface BudgetResult {
  newDailyBudget: number;
  adjustment: number;
  status: BudgetStatus;
  reason?: string;
}

export interface BudgetStrategy {
  execute(context: BudgetContext): BudgetResult;
}
