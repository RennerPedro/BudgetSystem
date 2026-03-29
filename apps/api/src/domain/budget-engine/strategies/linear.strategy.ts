import { BudgetStrategy, BudgetContext, BudgetResult } from '../budget-strategy.interface';
import { BudgetStatus } from '../../types';

export class LinearStrategy implements BudgetStrategy {
  private readonly MIN_DAILY_RATIO = 0.2;
  private readonly MAX_DAILY_RATIO = 1.8;
  private readonly MAX_DAILY_DELTA_RATIO = 0.15;
  private readonly NEUTRAL_ZONE_RATIO = 0.03;

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

    // Cálculo base
    const available = Math.max(0, totalIncome - totalFixed - reserveAmount);
    const remainingBalance = available - totalSpent;
    const remainingDays = totalDays - currentDay;
    const idealDaily = totalDays > 0 ? available / totalDays : 0;
    const minDaily = Math.max(0, idealDaily * this.MIN_DAILY_RATIO);
    const maxDaily = Math.max(minDaily, idealDaily * this.MAX_DAILY_RATIO);

    if (remainingDays <= 0) {
      return {
        newDailyBudget: 0,
        adjustment: -previousDailyBudget,
        status: remainingBalance >= 0 ? 'HEALTHY' : 'NEGATIVE',
        reason: 'End of month reached',
      };
    }

    // Prevenir divisão por zero
    const baseDaily = remainingDays > 0
      ? remainingBalance / remainingDays
      : 0;

    const variationRatio = previousDailyBudget > 0
      ? Math.abs(baseDaily - previousDailyBudget) / previousDailyBudget
      : 1;

    // Se a variação é muito pequena, mantém orçamento anterior para evitar oscilações
    const targetDaily = variationRatio < this.NEUTRAL_ZONE_RATIO
      ? previousDailyBudget
      : baseDaily;

    const feasibleDailyCap = remainingDays > 0 ? remainingBalance / remainingDays : 0;
    const dynamicMaxDaily = Math.max(maxDaily, Math.max(0, feasibleDailyCap));
    const boundedDaily = this.clamp(targetDaily, minDaily, dynamicMaxDaily);
    const newDailyBudget = remainingBalance < 0
      ? 0
      : this.clamp(boundedDaily, 0, Math.max(0, feasibleDailyCap));

    const adjustment = newDailyBudget - previousDailyBudget;

    // Determinar status
    let status: BudgetStatus = 'HEALTHY';
    let reason = 'Budget within expected range';

    if (remainingBalance < 0) {
      status = 'NEGATIVE';
      reason = 'Budget exhausted - negative balance';
    } else if (remainingBalance < available * 0.2) {
      status = 'CRITICAL';
      reason = 'Less than 20% of budget remaining';
    } else if (baseDaily < previousDailyBudget * 0.8) {
      status = 'WARNING';
      reason = 'Daily budget reduced by more than 20%';
    }

    return {
      newDailyBudget: Math.max(0, newDailyBudget),
      adjustment,
      status,
      reason,
    };
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  private normalizeReservePercent(value: number): number {
    return this.clamp(value, 0, 0.5);
  }
}
