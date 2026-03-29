import { BudgetStrategy, BudgetContext, BudgetResult } from '../budget-strategy.interface';
import { BudgetStatus } from '../../types';

/**
 * Smart Strategy - AI-ready
 * 
 * Fase atual: Heurística baseada em padrões
 * Fase futura: Integração com modelo de ML para prever gastos
 */
export class SmartStrategy implements BudgetStrategy {
  private readonly MIN_DAILY_RATIO = 0.15;
  private readonly MAX_DAILY_RATIO = 1.7;

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

    if (remainingBalance < 0) {
      return {
        newDailyBudget: 0,
        adjustment: -previousDailyBudget,
        status: 'NEGATIVE',
        reason: 'Budget exhausted',
      };
    }

    if (remainingDays <= 0) {
      return {
        newDailyBudget: 0,
        adjustment: -previousDailyBudget,
        status: remainingBalance > 0 ? 'HEALTHY' : 'NEGATIVE',
        reason: 'End of month reached',
      };
    }

    // Análise de padrão de gasto
    const averageDailySpent = currentDay > 0 ? totalSpent / currentDay : 0;
    const expectedDailySpent = totalDays > 0 ? available / totalDays : 0;

    // Peso adaptativo baseado no progresso do mês
    const progressRatio = currentDay / totalDays;
    const adaptiveWeight = this.calculateAdaptiveWeight(progressRatio);

    // Previsão de gasto futuro
    const projectedTotalSpent = averageDailySpent * totalDays;
    const projectedOver = Math.max(0, projectedTotalSpent - available);
    const riskRatio = available > 0 ? projectedOver / available : 0;
    const spendVelocity = expectedDailySpent > 0 ? averageDailySpent / expectedDailySpent : 1;
    const baseDaily = remainingBalance / remainingDays;

    // Calcular orçamento diário ajustado
    let targetDaily: number;
    let reason: string;

    if (riskRatio > 0.12 || spendVelocity > 1.15) {
      // Regime agressivo: reduz rapidamente quando o risco está alto
      const correction = (projectedOver / remainingDays) * adaptiveWeight;
      targetDaily = baseDaily - correction;
      reason = `Smart aggressive mode: projected overspending of ${projectedOver.toFixed(2)}`;
    } else if (riskRatio > 0.04 || spendVelocity > 1.05) {
      // Regime balanceado: ajusta de forma parcial para reduzir volatilidade
      const correction = (projectedOver / remainingDays) * 0.5 * adaptiveWeight;
      targetDaily = baseDaily - correction;
      reason = `Smart balanced mode: risk ratio ${(riskRatio * 100).toFixed(1)}%`;
    } else {
      // Regime linear: mantém distribuição estável e levemente otimista
      const bonusFactor = spendVelocity < 0.9
        ? 1 + Math.min(0.1, (1 - spendVelocity) * 0.2)
        : 1;
      targetDaily = baseDaily * bonusFactor;
      reason = 'On track - linear mode with stability bonus';
    }

    const feasibleDailyCap = remainingDays > 0 ? remainingBalance / remainingDays : 0;
    const dynamicMaxDaily = Math.max(maxDaily, Math.max(0, feasibleDailyCap));
    const boundedDaily = this.clamp(targetDaily, minDaily, dynamicMaxDaily);
    const newDailyBudget = this.clamp(boundedDaily, 0, Math.max(0, feasibleDailyCap));

    const adjustment = newDailyBudget - previousDailyBudget;

    // Determinar status baseado em projeções
    let status: BudgetStatus = 'HEALTHY';

    if (projectedTotalSpent > available * 1.12 || spendVelocity > 1.15) {
      status = 'CRITICAL';
      reason = `Projected to overspend by ${((projectedTotalSpent / available - 1) * 100).toFixed(1)}%`;
    } else if (projectedTotalSpent > available * 1.04 || spendVelocity > 1.05) {
      status = 'WARNING';
      reason = `Projected to exceed budget by ${(projectedTotalSpent - available).toFixed(2)}`;
    }

    return {
      newDailyBudget: Math.max(0, newDailyBudget),
      adjustment,
      status,
      reason,
    };
  }

  /**
   * Calcula peso adaptativo baseado no progresso do mês
   * Início do mês: correções suaves
   * Final do mês: correções mais agressivas
   */
  private calculateAdaptiveWeight(progressRatio: number): number {
    // Início: 0.6, meio: 1.0, final: 1.4
    return 0.6 + progressRatio * 0.8;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  private normalizeReservePercent(value: number): number {
    return this.clamp(value, 0, 0.5);
  }

  /**
   * TODO: Integração futura com ML
   * 
   * async predictSpending(historicalData: HistoricalSpending[]): Promise<number> {
   *   // Chamar modelo de ML para prever gasto futuro
   *   // Baseado em padrões históricos, dia da semana, categoria, etc.
   * }
   */
}
