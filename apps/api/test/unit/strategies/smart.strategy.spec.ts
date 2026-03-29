import { SmartStrategy } from '../../../src/domain/budget-engine/strategies/smart.strategy';
import { BudgetContext } from '../../../src/domain/budget-engine/budget-strategy.interface';

describe('SmartStrategy', () => {
  let strategy: SmartStrategy;

  beforeEach(() => {
    strategy = new SmartStrategy();
  });

  it('should keep healthy status when spending pace is on track', () => {
    const context: BudgetContext = {
      totalIncome: 5000,
      totalFixed: 2000,
      totalSpent: 900,
      totalDays: 30,
      currentDay: 10,
      previousDailyBudget: 100,
    };

    const result = strategy.execute(context);

    expect(result.status).toBe('HEALTHY');
    expect(result.newDailyBudget).toBeGreaterThan(0);
  });

  it('should enter warning mode when projected spending is above budget', () => {
    const context: BudgetContext = {
      totalIncome: 5000,
      totalFixed: 2000,
      totalSpent: 1100,
      totalDays: 30,
      currentDay: 10,
      previousDailyBudget: 100,
    };

    const result = strategy.execute(context);

    expect(result.status).toBe('WARNING');
    expect(result.adjustment).toBeLessThan(0);
  });

  it('should enter critical mode on strong overspending projection', () => {
    const context: BudgetContext = {
      totalIncome: 5000,
      totalFixed: 2000,
      totalSpent: 1500,
      totalDays: 30,
      currentDay: 10,
      previousDailyBudget: 100,
    };

    const result = strategy.execute(context);

    expect(result.status).toBe('CRITICAL');
    expect(result.newDailyBudget).toBeLessThan(100);
  });

  it('should return zero and negative status when remaining balance is below zero', () => {
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
});
