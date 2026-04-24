import { BudgetContext, BudgetResult } from './budget-strategy.interface';
import { StrategyFactory } from './strategy.factory';
import { StrategyType } from '../types';

export class BudgetEngine {
  calculate(context: BudgetContext, strategyType: StrategyType = 'LINEAR'): BudgetResult {
    const strategy = StrategyFactory.create(strategyType);
    return strategy.execute(context);
  }

  calculateInitial(
    totalIncome: number,
    totalFixed: number,
    totalDays: number,
  ): number {
    const available = totalIncome - totalFixed;
    return totalDays > 0 ? available / totalDays : 0;
  }

  getDaysInMonth(month: number, year: number): number {
    return new Date(year, month, 0).getDate();
  }

  getCurrentDay(): number {
    return new Date().getDate();
  }
}
