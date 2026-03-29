import { BudgetStrategy } from './budget-strategy.interface';
import { LinearStrategy } from './strategies/linear.strategy';
import { AggressiveStrategy } from './strategies/aggressive.strategy';
import { SmartStrategy } from './strategies/smart.strategy';
import { StrategyType } from '../types';

export class StrategyFactory {
  static create(type: StrategyType): BudgetStrategy {
    switch (type) {
      case 'LINEAR':
        return new LinearStrategy();
      case 'AGGRESSIVE':
        return new AggressiveStrategy();
      case 'SMART':
        return new SmartStrategy();
      default:
        throw new Error(`Unknown strategy type: ${type}`);
    }
  }
}
