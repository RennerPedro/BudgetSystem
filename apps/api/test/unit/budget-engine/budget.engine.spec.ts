import { BudgetEngine } from '../../../src/domain/budget-engine/budget.engine';

describe('BudgetEngine', () => {
  let engine: BudgetEngine;

  beforeEach(() => {
    engine = new BudgetEngine();
  });

  describe('calculateInitial', () => {
    it('should calculate initial daily budget correctly', () => {
      const result = engine.calculateInitial(5000, 2000, 30);
      expect(result).toBeCloseTo(100, 1); // (5000 - 2000) / 30
    });

    it('should handle zero days', () => {
      const result = engine.calculateInitial(5000, 2000, 0);
      expect(result).toBe(0);
    });

    it('should handle negative available balance', () => {
      const result = engine.calculateInitial(1000, 2000, 30);
      expect(result).toBeCloseTo(-33.33, 1);
    });
  });

  describe('getDaysInMonth', () => {
    it('should return correct days for January', () => {
      expect(engine.getDaysInMonth(1, 2026)).toBe(31);
    });

    it('should return correct days for February (non-leap year)', () => {
      expect(engine.getDaysInMonth(2, 2026)).toBe(28);
    });

    it('should return correct days for February (leap year)', () => {
      expect(engine.getDaysInMonth(2, 2024)).toBe(29);
    });

    it('should return correct days for April', () => {
      expect(engine.getDaysInMonth(4, 2026)).toBe(30);
    });
  });

  describe('calculate', () => {
    it('should use LINEAR strategy by default', () => {
      const context = {
        totalIncome: 5000,
        totalFixed: 2000,
        totalSpent: 600,
        totalDays: 30,
        currentDay: 10,
        previousDailyBudget: 100,
      };

      const result = engine.calculate(context);

      expect(result.status).toBe('HEALTHY');
      expect(result.newDailyBudget).toBeGreaterThan(0);
    });

    it('should use AGGRESSIVE strategy when specified', () => {
      const context = {
        totalIncome: 5000,
        totalFixed: 2000,
        totalSpent: 1200,
        totalDays: 30,
        currentDay: 10,
        previousDailyBudget: 100,
      };

      const result = engine.calculate(context, 'AGGRESSIVE');

      expect(result).toHaveProperty('newDailyBudget');
      expect(result).toHaveProperty('adjustment');
      expect(result).toHaveProperty('status');
    });

    it('should use SMART strategy when specified', () => {
      const context = {
        totalIncome: 5000,
        totalFixed: 2000,
        totalSpent: 600,
        totalDays: 30,
        currentDay: 10,
        previousDailyBudget: 100,
      };

      const result = engine.calculate(context, 'SMART');

      expect(result).toHaveProperty('newDailyBudget');
      expect(result).toHaveProperty('status');
    });
  });
});
