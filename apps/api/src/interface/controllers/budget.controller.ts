import { Controller, Get, Post, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BudgetService } from '../../application/services/budget.service';
import {
  CreateBudgetDto,
  UpdateBudgetFixedDto,
  UpdateBudgetIncomeDto,
  UpdateBudgetStrategyDto,
  BudgetResponseDto,
} from '../../application/dtos';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { CurrentUser } from '../../infrastructure/auth/current-user.decorator';
import { AuthenticatedUser } from '../../infrastructure/auth/authenticated-user.interface';

@ApiTags('budget')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('budget')
export class BudgetController {
  constructor(private budgetService: BudgetService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new budget for current month' })
  @ApiResponse({ status: 201, description: 'Budget created', type: BudgetResponseDto })
  @ApiResponse({ status: 400, description: 'Budget already exists' })
  async createBudget(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateBudgetDto,
  ): Promise<BudgetResponseDto> {
    return this.budgetService.createBudget(user.userId, dto);
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current month budget' })
  @ApiResponse({ status: 200, description: 'Current budget', type: BudgetResponseDto })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  async getCurrentBudget(@CurrentUser() user: AuthenticatedUser): Promise<BudgetResponseDto> {
    return this.budgetService.getCurrentBudget(user.userId);
  }

  @Put('strategy')
  @ApiOperation({ summary: 'Update budget strategy' })
  @ApiResponse({ status: 200, description: 'Strategy updated', type: BudgetResponseDto })
  async updateStrategy(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateBudgetStrategyDto,
  ): Promise<BudgetResponseDto> {
    return this.budgetService.updateStrategy(user.userId, dto);
  }

  @Put('income')
  @ApiOperation({ summary: 'Update current month income' })
  @ApiResponse({ status: 200, description: 'Income updated', type: BudgetResponseDto })
  async updateIncome(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateBudgetIncomeDto,
  ): Promise<BudgetResponseDto> {
    return this.budgetService.updateIncome(user.userId, dto);
  }

  @Put('fixed')
  @ApiOperation({ summary: 'Update current month fixed expenses' })
  @ApiResponse({ status: 200, description: 'Fixed expenses updated', type: BudgetResponseDto })
  async updateFixed(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateBudgetFixedDto,
  ): Promise<BudgetResponseDto> {
    return this.budgetService.updateFixed(user.userId, dto);
  }

  @Get('adjustments')
  @ApiOperation({ summary: 'Get budget adjustment history' })
  @ApiResponse({ status: 200, description: 'Adjustment history' })
  async getAdjustmentHistory(@CurrentUser() user: AuthenticatedUser) {
    return this.budgetService.getAdjustmentHistory(user.userId);
  }
}
