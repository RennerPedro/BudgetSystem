export type BudgetStatus = 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'NEGATIVE';

export type ExpenseType = 'VARIABLE';

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

export type AIRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AIBudgetPrediction {
  predictedTotalSpent: number;
  recommendedDailyBudget: number;
  confidence: number;
  riskLevel: AIRiskLevel;
  insights: string[];
  reasoning: string;
}
