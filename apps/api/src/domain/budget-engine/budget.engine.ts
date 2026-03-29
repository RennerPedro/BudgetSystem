import { BudgetContext, BudgetResult } from './budget-strategy.interface';
import { StrategyFactory } from './strategy.factory';
import { StrategyType } from '../types';

export class BudgetEngine {
  /**
   * Calcula o orçamento diário adaptativo
   */
  calculate(context: BudgetContext, strategyType: StrategyType = 'LINEAR'): BudgetResult {
    const strategy = StrategyFactory.create(strategyType);
    return strategy.execute(context);
  }

  /**
   * Calcula o orçamento inicial para um novo período
   */
  calculateInitial(
    totalIncome: number,
    totalFixed: number,
    totalDays: number,
  ): number {
    const available = totalIncome - totalFixed;
    return totalDays > 0 ? available / totalDays : 0;
  }

  /**
   * Obtém o número de dias no mês
   */
  getDaysInMonth(month: number, year: number): number {
    return new Date(year, month, 0).getDate();
  }

  /**
   * Obtém o dia atual do mês
   */
  getCurrentDay(): number {
    return new Date().getDate();
  }
}
