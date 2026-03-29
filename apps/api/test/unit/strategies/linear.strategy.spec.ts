import { LinearStrategy } from '../../../src/domain/budget-engine/strategies/linear.strategy';
import { BudgetContext } from '../../../src/domain/budget-engine/budget-strategy.interface';

describe('LinearStrategy', () => {
  let strategy: LinearStrategy;

  beforeEach(() => {
    strategy = new LinearStrategy();
  });

  it('should calculate daily budget correctly for healthy scenario', () => {
    const context: BudgetContext = {
      totalIncome: 5000,
      totalFixed: 2000,
      totalSpent: 600,
      totalDays: 30,
      currentDay: 10,
      previousDailyBudget: 100,
    };

    const result = strategy.execute(context);

    expect(result.status).toBe('HEALTHY');
    expect(result.newDailyBudget).toBeCloseTo(120, 1);
    expect(result.adjustment).toBeCloseTo(20, 1);
  });

  it('should detect WARNING status when daily budget drops significantly', () => {
    const context: BudgetContext = {
      totalIncome: 5000,
      totalFixed: 2000,
      totalSpent: 2000,
      totalDays: 30,
      currentDay: 10,
      previousDailyBudget: 100,
    };

    const result = strategy.execute(context);

    expect(result.status).toBe('WARNING');
    expect(result.newDailyBudget).toBeCloseTo(50, 1); // teto de viabilidade para fechar o mês em zero
  });

  it('should detect CRITICAL status when balance is low', () => {
    const context: BudgetContext = {
      totalIncome: 5000,
      totalFixed: 2000,
      totalSpent: 2500,
      totalDays: 30,
      currentDay: 10,
      previousDailyBudget: 100,
    };

    const result = strategy.execute(context);

    expect(result.status).toBe('CRITICAL');
    expect(result.newDailyBudget).toBeCloseTo(25, 1); // limitado pelo saldo e dias restantes
  });

  it('should detect NEGATIVE status when budget is exhausted', () => {
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
    expect(result.newDailyBudget).toBe(0); // Max(0, negative value)
  });

  it('should handle end of month scenario', () => {
    const context: BudgetContext = {
      totalIncome: 5000,
      totalFixed: 2000,
      totalSpent: 2900,
      totalDays: 30,
      currentDay: 30,
      previousDailyBudget: 100,
    };

    const result = strategy.execute(context);

    expect(result.newDailyBudget).toBe(0); // No days remaining
  });
});
