export type BudgetStatus = 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'NEGATIVE';

export type ExpenseType = 'VARIABLE';

export type AlertType = 
  | 'BUDGET_WARNING' 
  | 'BUDGET_CRITICAL' 
  | 'BUDGET_NEGATIVE' 
  | 'DAILY_LIMIT_EXCEEDED';

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export type StrategyType = 'LINEAR' | 'AGGRESSIVE' | 'SMART';
