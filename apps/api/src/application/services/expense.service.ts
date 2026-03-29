import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CreateExpenseDto, ExpenseResponseDto, ExpenseStatsDto } from '../dtos';
import { ExpenseType } from '../../domain/types';
import { BudgetService } from './budget.service';

@Injectable()
export class ExpenseService {
  constructor(
    private prisma: PrismaService,
    private budgetService: BudgetService,
  ) {}

  async createExpense(userId: string, dto: CreateExpenseDto): Promise<ExpenseResponseDto> {
    const expenseDate = new Date(dto.date);
    const month = expenseDate.getMonth() + 1;
    const year = expenseDate.getFullYear();

    // Find or create budget for this month
    let budget = await this.prisma.budget.findUnique({
      where: {
        userId_month_year: { userId, month, year },
      },
    });

    // Create expense
    const expense = await this.prisma.expense.create({
      data: {
        userId,
        budgetId: budget?.id,
        amount: dto.amount,
        type: dto.type,
        category: dto.category,
        date: expenseDate,
      },
    });

    // Recalculate budget for this month after any expense mutation.
    if (budget) {
      await this.syncBudgetTotalSpent(budget.id, userId, month, year);
      await this.budgetService.recalculateBudget(budget.id);
    }

    return {
      ...expense,
      type: expense.type as ExpenseType,
    };
  }

  async getExpenses(
    userId: string,
    month?: number,
    year?: number,
  ): Promise<ExpenseResponseDto[]> {
    const where: any = { userId };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const expenses = await this.prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    return expenses.map((expense) => ({
      ...expense,
      type: expense.type as ExpenseType,
    }));
  }

  async getExpenseById(userId: string, expenseId: string): Promise<ExpenseResponseDto> {
    const expense = await this.prisma.expense.findFirst({
      where: {
        id: expenseId,
        userId,
      },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return {
      ...expense,
      type: expense.type as ExpenseType,
    };
  }

  async deleteExpense(userId: string, expenseId: string): Promise<void> {
    const expense = await this.getExpenseById(userId, expenseId);
    const expenseDate = new Date(expense.date);
    const month = expenseDate.getMonth() + 1;
    const year = expenseDate.getFullYear();

    await this.prisma.expense.delete({
      where: { id: expenseId },
    });

    const budget = expense.budgetId
      ? await this.prisma.budget.findUnique({ where: { id: expense.budgetId } })
      : await this.prisma.budget.findUnique({
          where: {
            userId_month_year: { userId, month, year },
          },
        });

    if (budget) {
      await this.syncBudgetTotalSpent(budget.id, userId, month, year);
      await this.budgetService.recalculateBudget(budget.id);
    }
  }

  private async syncBudgetTotalSpent(
    budgetId: string,
    userId: string,
    month: number,
    year: number,
  ): Promise<void> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const aggregate = await this.prisma.expense.aggregate({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        type: 'VARIABLE',
      },
      _sum: {
        amount: true,
      },
    });

    const totalSpent = aggregate._sum.amount ?? 0;

    await this.prisma.budget.update({
      where: { id: budgetId },
      data: {
        totalSpent,
      },
    });
  }

  async getExpenseStats(userId: string, month?: number, year?: number): Promise<ExpenseStatsDto> {
    const expenses = await this.getExpenses(userId, month, year);

    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const count = expenses.length;

    const byCategory = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);

    const byType = expenses.reduce((acc, exp) => {
      acc[exp.type] = (acc[exp.type] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      count,
      byCategory,
      byType,
    };
  }
}
