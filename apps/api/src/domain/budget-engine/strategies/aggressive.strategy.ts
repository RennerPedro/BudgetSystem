import { BudgetStrategy, BudgetContext, BudgetResult } from '../budget-strategy.interface';
import { BudgetStatus } from '../../types';

export class AggressiveStrategy implements BudgetStrategy {
  private readonly MIN_DAILY_RATIO = 0.1;
  private readonly MAX_DAILY_RATIO = 1.6;
  private readonly NEUTRAL_ZONE_RATIO = 0.02;

  execute(context: BudgetContext): BudgetResult {
    const {
      totalIncome,
      totalFixed,
      totalSpent,
      totalDays,
      currentDay,
      previousDailyBudget,
      targetReservePercent,
    } = context;

    const reservePercent = this.normalizeReservePercent(targetReservePercent ?? 0);
    const reserveAmount = totalIncome * reservePercent;

    const available = Math.max(0, totalIncome - totalFixed - reserveAmount);
    const remainingBalance = available - totalSpent;
    const remainingDays = totalDays - currentDay;
    const idealDaily = totalDays > 0 ? available / totalDays : 0;
    const minDaily = Math.max(0, idealDaily * this.MIN_DAILY_RATIO);
    const maxDaily = Math.max(minDaily, idealDaily * this.MAX_DAILY_RATIO);

    if (remainingBalance < 0) {
      return {
        newDailyBudget: 0,
        adjustment: -previousDailyBudget,
        status: 'NEGATIVE',
        reason: 'Budget exhausted - negative balance',
      };
    }

    const expectedSpent = currentDay * (available / totalDays);
    const excess = Math.max(0, totalSpent - expectedSpent);
    const excessRatio = available > 0 ? excess / available : 0;
    const correctionDays = this.getCorrectionDays(excessRatio);

    let newDailyBudget: number;
    let reason: string;
    const baseDaily = remainingDays > 0 ? remainingBalance / remainingDays : 0;

    if (excessRatio > this.NEUTRAL_ZONE_RATIO && remainingDays > 0) {
      const correctionAmount = excess / Math.min(correctionDays, remainingDays);
      newDailyBudget = baseDaily - correctionAmount;
      reason = `Aggressive correction in ${correctionDays} days - excess of ${excess.toFixed(2)} detected`;
    } else {
      newDailyBudget = baseDaily;
      reason = 'No excess detected - linear distribution applied';
    }

    const feasibleDailyCap = remainingDays > 0 ? remainingBalance / remainingDays : 0;
    const dynamicMaxDaily = Math.max(maxDaily, Math.max(0, feasibleDailyCap));
    const boundedDaily = this.clamp(newDailyBudget, minDaily, dynamicMaxDaily);
    newDailyBudget = this.clamp(boundedDaily, 0, Math.max(0, feasibleDailyCap));

    const adjustment = newDailyBudget - previousDailyBudget;

    let status: BudgetStatus = 'HEALTHY';

    if (excessRatio > 0.15) {
      status = 'CRITICAL';
      reason = `Critical excess: ${excess.toFixed(2)} (${((excess / available) * 100).toFixed(1)}% over expected)`;
    } else if (excessRatio > 0.05) {
      status = 'WARNING';
      reason = `Warning: ${excess.toFixed(2)} over expected spending`;
    }

    return {
      newDailyBudget: Math.max(0, newDailyBudget),
      adjustment,
      status,
      reason,
    };
  }

  private getCorrectionDays(excessRatio: number): number {
    if (excessRatio > 0.15) {
      return 2;
    }

    if (excessRatio > 0.08) {
      return 3;
    }

    return 5;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  private normalizeReservePercent(value: number): number {
    return this.clamp(value, 0, 0.5);
  }
}
