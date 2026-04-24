import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { BudgetEngine } from '../../domain/budget-engine';
import {
  CreateBudgetDto,
  UpdateBudgetFixedDto,
  UpdateBudgetIncomeDto,
  UpdateBudgetStrategyDto,
  BudgetResponseDto,
} from '../dtos';
import { BudgetStatus, StrategyType } from '../../domain/types';
import { BudgetPredictionService } from '../../modules/deepseek/services/budget-prediction.service';

@Injectable()
export class BudgetService {
  private budgetEngine: BudgetEngine;

  constructor(
    private prisma: PrismaService,
    private budgetPredictionService: BudgetPredictionService,
  ) {
    this.budgetEngine = new BudgetEngine();
  }

  async createBudget(userId: string, dto: CreateBudgetDto): Promise<BudgetResponseDto> {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const existingBudget = await this.prisma.budget.findUnique({
      where: {
        userId_month_year: { userId, month, year },
      },
    });

    if (existingBudget) {
      throw new BadRequestException('Budget for this month already exists');
    }

    const totalDays = this.budgetEngine.getDaysInMonth(month, year);
    const available = dto.totalIncome - dto.totalFixed;
    const dailyBudget = this.budgetEngine.calculateInitial(
      dto.totalIncome,
      dto.totalFixed,
      totalDays,
    );

    const budget = await this.prisma.budget.create({
      data: {
        userId,
        month,
        year,
        totalIncome: dto.totalIncome,
        totalFixed: dto.totalFixed,
        totalSpent: 0,
        availableBalance: available,
        remainingBalance: available,
        dailyBudget,
        strategy: dto.strategy || 'LINEAR',
        status: 'HEALTHY',
      },
    });

    return {
      ...budget,
      strategy: budget.strategy as StrategyType,
      status: budget.status as BudgetStatus,
    };
  }

  async getCurrentBudget(userId: string): Promise<BudgetResponseDto> {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const budget = await this.prisma.budget.findUnique({
      where: {
        userId_month_year: { userId, month, year },
      },
    });

    if (!budget) {
      throw new NotFoundException('No budget found for current month');
    }

    return {
      ...budget,
      strategy: budget.strategy as StrategyType,
      status: budget.status as BudgetStatus,
    };
  }

  async updateStrategy(userId: string, dto: UpdateBudgetStrategyDto): Promise<BudgetResponseDto> {
    const budget = await this.getCurrentBudget(userId);

    await this.prisma.budget.update({
      where: { id: budget.id },
      data: { strategy: dto.strategy },
    });

    await this.recalculateBudget(budget.id);

    const recalculatedBudget = await this.prisma.budget.findUnique({
      where: { id: budget.id },
    });

    if (!recalculatedBudget) {
      throw new NotFoundException('Budget not found');
    }

    return {
      ...recalculatedBudget,
      strategy: recalculatedBudget.strategy as StrategyType,
      status: recalculatedBudget.status as BudgetStatus,
    };
  }

  async updateIncome(userId: string, dto: UpdateBudgetIncomeDto): Promise<BudgetResponseDto> {
    const budget = await this.getCurrentBudget(userId);
    const monthlyVariableSpent = await this.getMonthlyVariableSpent(userId, budget.month, budget.year);

    const totalDays = this.budgetEngine.getDaysInMonth(budget.month, budget.year);
    const currentDay = this.budgetEngine.getCurrentDay();
    const availableBalance = dto.totalIncome - budget.totalFixed;
    const remainingBalance = availableBalance - monthlyVariableSpent;

    const result = await this.calculateBudgetResult(
      budget.userId,
      {
        totalIncome: dto.totalIncome,
        totalFixed: budget.totalFixed,
        totalSpent: monthlyVariableSpent,
        totalDays,
        currentDay,
        previousDailyBudget: budget.dailyBudget,
        targetReservePercent: this.getTargetReservePercent(budget.strategy as StrategyType),
      },
      budget.strategy as StrategyType,
    );

    const updatedBudget = await this.prisma.budget.update({
      where: { id: budget.id },
      data: {
        totalIncome: dto.totalIncome,
        totalSpent: monthlyVariableSpent,
        availableBalance,
        remainingBalance,
        dailyBudget: result.newDailyBudget,
        status: result.status,
      },
    });

    await this.prisma.budgetAdjustment.create({
      data: {
        budgetId: budget.id,
        previousDailyBudget: budget.dailyBudget,
        newDailyBudget: result.newDailyBudget,
        adjustment: result.adjustment,
        reason: `Monthly income updated to ${dto.totalIncome.toFixed(2)}`,
        strategy: budget.strategy,
        status: result.status,
      },
    });

    return {
      ...updatedBudget,
      strategy: updatedBudget.strategy as StrategyType,
      status: updatedBudget.status as BudgetStatus,
    };
  }

  async updateFixed(userId: string, dto: UpdateBudgetFixedDto): Promise<BudgetResponseDto> {
    const budget = await this.getCurrentBudget(userId);
    const monthlyVariableSpent = await this.getMonthlyVariableSpent(userId, budget.month, budget.year);

    const totalDays = this.budgetEngine.getDaysInMonth(budget.month, budget.year);
    const currentDay = this.budgetEngine.getCurrentDay();
    const availableBalance = budget.totalIncome - dto.totalFixed;
    const remainingBalance = availableBalance - monthlyVariableSpent;

    const result = await this.calculateBudgetResult(
      budget.userId,
      {
        totalIncome: budget.totalIncome,
        totalFixed: dto.totalFixed,
        totalSpent: monthlyVariableSpent,
        totalDays,
        currentDay,
        previousDailyBudget: budget.dailyBudget,
        targetReservePercent: this.getTargetReservePercent(budget.strategy as StrategyType),
      },
      budget.strategy as StrategyType,
    );

    const updatedBudget = await this.prisma.budget.update({
      where: { id: budget.id },
      data: {
        totalFixed: dto.totalFixed,
        totalSpent: monthlyVariableSpent,
        availableBalance,
        remainingBalance,
        dailyBudget: result.newDailyBudget,
        status: result.status,
      },
    });

    await this.prisma.budgetAdjustment.create({
      data: {
        budgetId: budget.id,
        previousDailyBudget: budget.dailyBudget,
        newDailyBudget: result.newDailyBudget,
        adjustment: result.adjustment,
        reason: `Monthly fixed expenses updated to ${dto.totalFixed.toFixed(2)}`,
        strategy: budget.strategy,
        status: result.status,
      },
    });

    return {
      ...updatedBudget,
      strategy: updatedBudget.strategy as StrategyType,
      status: updatedBudget.status as BudgetStatus,
    };
  }

  async recalculateBudget(budgetId: string): Promise<void> {
    const budget = await this.prisma.budget.findUnique({
      where: { id: budgetId },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    const totalDays = this.budgetEngine.getDaysInMonth(budget.month, budget.year);
    const currentDay = this.budgetEngine.getCurrentDay();
    const monthlyVariableSpent = await this.getMonthlyVariableSpent(
      budget.userId,
      budget.month,
      budget.year,
    );

    const context = {
      totalIncome: budget.totalIncome,
      totalFixed: budget.totalFixed,
      totalSpent: monthlyVariableSpent,
      totalDays,
      currentDay,
      previousDailyBudget: budget.dailyBudget,
      targetReservePercent: this.getTargetReservePercent(budget.strategy as StrategyType),
    };

    const result = await this.calculateBudgetResult(
      budget.userId,
      context,
      budget.strategy as StrategyType,
    );

    await this.prisma.budget.update({
      where: { id: budgetId },
      data: {
        totalSpent: monthlyVariableSpent,
        dailyBudget: result.newDailyBudget,
        availableBalance: budget.totalIncome - budget.totalFixed,
        remainingBalance: budget.totalIncome - budget.totalFixed - monthlyVariableSpent,
        status: result.status,
      },
    });

    await this.prisma.budgetAdjustment.create({
      data: {
        budgetId,
        previousDailyBudget: budget.dailyBudget,
        newDailyBudget: result.newDailyBudget,
        adjustment: result.adjustment,
        reason: result.reason,
        strategy: budget.strategy,
        status: result.status,
      },
    });

    await this.generateAlertsIfNeeded(budget.userId, result.status, result.reason);
  }

  private async generateAlertsIfNeeded(
    userId: string,
    status: string,
    reason?: string,
  ): Promise<void> {
    let alertType: string | null = null;
    let severity: string = 'INFO';
    let message = reason || 'Budget status updated';

    switch (status) {
      case 'WARNING':
        alertType = 'BUDGET_WARNING';
        severity = 'WARNING';
        break;
      case 'CRITICAL':
        alertType = 'BUDGET_CRITICAL';
        severity = 'CRITICAL';
        break;
      case 'NEGATIVE':
        alertType = 'BUDGET_NEGATIVE';
        severity = 'CRITICAL';
        break;
    }

    if (alertType) {
      await this.prisma.alert.create({
        data: {
          userId,
          type: alertType,
          message,
          severity,
        },
      });
    }
  }

  async getAdjustmentHistory(userId: string): Promise<unknown[]> {
    const budget = await this.getCurrentBudget(userId);

    return this.prisma.budgetAdjustment.findMany({
      where: { budgetId: budget.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  private getTargetReservePercent(strategy: StrategyType): number {
    switch (strategy) {
      case 'LINEAR':
        return 0;
      case 'AGGRESSIVE':
        return 0.1;
      case 'SMART':
        return 0.07;
      default:
        return 0;
    }
  }

  private async getMonthlyVariableSpent(
    userId: string,
    month: number,
    year: number,
  ): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const aggregate = await this.prisma.expense.aggregate({
      where: {
        userId,
        type: 'VARIABLE',
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    return aggregate._sum.amount ?? 0;
  }

  private async calculateBudgetResult(
    userId: string,
    context: {
      totalIncome: number;
      totalFixed: number;
      totalSpent: number;
      totalDays: number;
      currentDay: number;
      previousDailyBudget: number;
      targetReservePercent: number;
    },
    strategy: StrategyType,
  ) {
    const heuristic = this.budgetEngine.calculate(context, strategy);

    if (strategy !== 'SMART') {
      return heuristic;
    }

    const prediction = await this.budgetPredictionService.predictBudget(userId, {
      totalIncome: context.totalIncome,
      totalFixed: context.totalFixed,
      totalSpent: context.totalSpent,
      currentDay: context.currentDay,
      totalDays: context.totalDays,
    });

    if (!prediction) {
      return {
        ...heuristic,
        reason: `${heuristic.reason} (AI unavailable, heuristic fallback active)`,
      };
    }

    const remainingDays = Math.max(1, context.totalDays - context.currentDay);
    const available = Math.max(0, context.totalIncome - context.totalFixed);
    const remainingBalance = Math.max(0, available - context.totalSpent);
    const aiDaily = Math.max(0, Math.min(prediction.recommendedDailyBudget, remainingBalance / remainingDays));

    return {
      newDailyBudget: aiDaily,
      adjustment: aiDaily - context.previousDailyBudget,
      status:
        prediction.riskLevel === 'CRITICAL'
          ? 'CRITICAL'
          : prediction.riskLevel === 'HIGH'
            ? 'WARNING'
            : heuristic.status,
      reason: `AI Smart Strategy (${Math.round(prediction.confidence * 100)}% confidence): ${prediction.reasoning}`,
    };
  }
}
