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

@Injectable()
export class BudgetService {
  private budgetEngine: BudgetEngine;

  constructor(private prisma: PrismaService) {
    this.budgetEngine = new BudgetEngine();
  }

  async createBudget(userId: string, dto: CreateBudgetDto): Promise<BudgetResponseDto> {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Check if budget already exists for this month
    const existingBudget = await this.prisma.budget.findUnique({
      where: {
        userId_month_year: { userId, month, year },
      },
    });

    if (existingBudget) {
      throw new BadRequestException('Budget for this month already exists');
    }

    // Calculate initial values
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

    // Recalculate immediately so client receives updated daily budget without requiring another action.
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
    const launchedFixed = await this.getLaunchedFixedAmount(
      userId,
      budget.month,
      budget.year,
    );

    const totalDays = this.budgetEngine.getDaysInMonth(budget.month, budget.year);
    const currentDay = this.budgetEngine.getCurrentDay();
    const availableBalance = dto.totalIncome - launchedFixed;
    const remainingBalance = availableBalance - monthlyVariableSpent;

    const result = this.budgetEngine.calculate(
      {
        totalIncome: dto.totalIncome,
        totalFixed: launchedFixed,
        totalSpent: monthlyVariableSpent,
        totalDays,
        currentDay,
        previousDailyBudget: budget.dailyBudget,
        targetReservePercent: this.getTargetReservePercent(budget.strategy as StrategyType),
      },
      budget.strategy,
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
    const launchedFixed = await this.getLaunchedFixedAmount(
      userId,
      budget.month,
      budget.year,
    );

    const totalDays = this.budgetEngine.getDaysInMonth(budget.month, budget.year);
    const currentDay = this.budgetEngine.getCurrentDay();
    const availableBalance = budget.totalIncome - launchedFixed;
    const remainingBalance = availableBalance - monthlyVariableSpent;

    const result = this.budgetEngine.calculate(
      {
        totalIncome: budget.totalIncome,
        totalFixed: launchedFixed,
        totalSpent: monthlyVariableSpent,
        totalDays,
        currentDay,
        previousDailyBudget: budget.dailyBudget,
        targetReservePercent: this.getTargetReservePercent(budget.strategy as StrategyType),
      },
      budget.strategy,
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
    const launchedFixed = await this.getLaunchedFixedAmount(
      budget.userId,
      budget.month,
      budget.year,
    );

    const context = {
      totalIncome: budget.totalIncome,
      totalFixed: launchedFixed,
      totalSpent: monthlyVariableSpent,
      totalDays,
      currentDay,
      previousDailyBudget: budget.dailyBudget,
      targetReservePercent: this.getTargetReservePercent(budget.strategy as StrategyType),
    };

    const result = this.budgetEngine.calculate(context, budget.strategy as StrategyType);

    // Update budget
    await this.prisma.budget.update({
      where: { id: budgetId },
      data: {
        totalSpent: monthlyVariableSpent,
        dailyBudget: result.newDailyBudget,
        availableBalance: budget.totalIncome - launchedFixed,
        remainingBalance: budget.totalIncome - launchedFixed - monthlyVariableSpent,
        status: result.status,
      },
    });

    // Create adjustment record
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

    // Generate alerts if needed
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

  async getAdjustmentHistory(userId: string): Promise<any[]> {
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
        return 0.03;
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

  private async getLaunchedFixedAmount(
    userId: string,
    month: number,
    year: number,
  ): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const aggregate = await this.prisma.expense.aggregate({
      where: {
        userId,
        type: 'FIXED',
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
}
