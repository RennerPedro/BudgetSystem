import { AggressiveStrategy } from '../../../src/domain/budget-engine/strategies/aggressive.strategy';
import { BudgetContext } from '../../../src/domain/budget-engine/budget-strategy.interface';

describe('AggressiveStrategy', () => {
  let strategy: AggressiveStrategy;

  beforeEach(() => {
    strategy = new AggressiveStrategy();
  });

  it('should apply aggressive correction when excess is detected', () => {
    const context: BudgetContext = {
      totalIncome: 5000,
      totalFixed: 2000,
      totalSpent: 1200, // Expected: 1000 (10 days * 100/day), Excess: 200
      totalDays: 30,
      currentDay: 10,
      previousDailyBudget: 100,
    };

    const result = strategy.execute(context);

    expect(result.status).toBe('WARNING');
    expect(result.newDailyBudget).toBeCloseTo(50, 1);
    expect(result.adjustment).toBeLessThan(0);
  });

  it('should use linear distribution when no excess', () => {
    const context: BudgetContext = {
      totalIncome: 5000,
      totalFixed: 2000,
      totalSpent: 800, // Expected: 1000, No excess
      totalDays: 30,
      currentDay: 10,
      previousDailyBudget: 100,
    };

    const result = strategy.execute(context);

    expect(result.status).toBe('HEALTHY');
    expect(result.newDailyBudget).toBeCloseTo(110, 1);
  });

  it('should detect CRITICAL status with large excess', () => {
    const context: BudgetContext = {
      totalIncome: 5000,
      totalFixed: 2000,
      totalSpent: 1600, // Expected: 1000, Excess: 600 (20% of available)
      totalDays: 30,
      currentDay: 10,
      previousDailyBudget: 100,
    };

    const result = strategy.execute(context);

    expect(result.status).toBe('CRITICAL');
    expect(result.newDailyBudget).toBeLessThan(100);
  });

  it('should handle negative balance', () => {
    const context: BudgetContext = {
      totalIncome: 5000,
      totalFixed: 2000,
      totalSpent: 3500,
      totalDays: 30,
      currentDay: 10,
      previousDailyBudget: 100,
    };

    const result = strategy.execute(context);

    expect(result.status).toBe('NEGATIVE');
    expect(result.newDailyBudget).toBe(0);
  });

  it('should never exceed feasible daily budget near end of month', () => {
    const context: BudgetContext = {
      totalIncome: 3100,
      totalFixed: 1300,
      totalSpent: 1763,
      totalDays: 31,
      currentDay: 28,
      previousDailyBudget: 68,
    };

    const result = strategy.execute(context);

    expect(result.newDailyBudget).toBeLessThanOrEqual(12.34);
  });
});
