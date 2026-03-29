export type BudgetStatus = 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'NEGATIVE';

export type ExpenseType = 'FIXED' | 'VARIABLE';

export type AlertType = 
  | 'BUDGET_WARNING' 
  | 'BUDGET_CRITICAL' 
  | 'BUDGET_NEGATIVE' 
  | 'DAILY_LIMIT_EXCEEDED';

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export type StrategyType = 'LINEAR' | 'AGGRESSIVE' | 'SMART';

export interface User {
  id: string;
  email: string;
}

export interface Budget {
  id: string;
  userId: string;
  month: number;
  year: number;
  totalIncome: number;
  totalFixed: number;
  totalSpent: number;
  availableBalance: number;
  remainingBalance: number;
  dailyBudget: number;
  strategy: StrategyType;
  status: BudgetStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  userId: string;
  budgetId: string | null;
  amount: number;
  type: ExpenseType;
  category: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  id: string;
  userId: string;
  type: AlertType;
  message: string;
  severity: AlertSeverity;
  read: boolean;
  createdAt: string;
}

export interface ExpenseStats {
  total: number;
  count: number;
  byCategory: Record<string, number>;
  byType: Record<string, number>;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}
