import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ExpenseService } from '../../application/services/expense.service';
import { CreateExpenseDto, ExpenseResponseDto, ExpenseStatsDto } from '../../application/dtos';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { CurrentUser } from '../../infrastructure/auth/current-user.decorator';
import { AuthenticatedUser } from '../../infrastructure/auth/authenticated-user.interface';

@ApiTags('expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpenseController {
  constructor(private expenseService: ExpenseService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new expense' })
  @ApiResponse({ status: 201, description: 'Expense created', type: ExpenseResponseDto })
  async createExpense(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateExpenseDto,
  ): Promise<ExpenseResponseDto> {
    return this.expenseService.createExpense(user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user expenses' })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of expenses', type: [ExpenseResponseDto] })
  async getExpenses(
    @CurrentUser() user: AuthenticatedUser,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ): Promise<ExpenseResponseDto[]> {
    return this.expenseService.getExpenses(
      user.userId,
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get expense statistics' })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Expense statistics', type: ExpenseStatsDto })
  async getStats(
    @CurrentUser() user: AuthenticatedUser,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ): Promise<ExpenseStatsDto> {
    return this.expenseService.getExpenseStats(
      user.userId,
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get expense by ID' })
  @ApiResponse({ status: 200, description: 'Expense details', type: ExpenseResponseDto })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  async getExpenseById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ExpenseResponseDto> {
    return this.expenseService.getExpenseById(user.userId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an expense' })
  @ApiResponse({ status: 200, description: 'Expense deleted' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  async deleteExpense(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.expenseService.deleteExpense(user.userId, id);
    return { message: 'Expense deleted successfully' };
  }
}
