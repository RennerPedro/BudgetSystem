import { IsNumber, IsString, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StrategyType, BudgetStatus } from '../../domain/types';

export class CreateBudgetDto {
  @ApiProperty({ example: 5000, description: 'Total monthly income' })
  @IsNumber()
  @Min(0)
  totalIncome!: number;

  @ApiProperty({ example: 2000, description: 'Total fixed expenses' })
  @IsNumber()
  @Min(0)
  totalFixed!: number;

  @ApiPropertyOptional({ enum: ['LINEAR', 'AGGRESSIVE', 'SMART'], default: 'LINEAR' })
  @IsOptional()
  @IsEnum(['LINEAR', 'AGGRESSIVE', 'SMART'])
  strategy?: StrategyType;
}

export class UpdateBudgetStrategyDto {
  @ApiProperty({ enum: ['LINEAR', 'AGGRESSIVE', 'SMART'] })
  @IsEnum(['LINEAR', 'AGGRESSIVE', 'SMART'])
  strategy!: StrategyType;
}

export class UpdateBudgetIncomeDto {
  @ApiProperty({ example: 5200, description: 'Monthly income amount' })
  @IsNumber()
  @Min(0)
  totalIncome!: number;
}

export class UpdateBudgetFixedDto {
  @ApiProperty({ example: 2000, description: 'Monthly fixed expenses amount' })
  @IsNumber()
  @Min(0)
  totalFixed!: number;
}

export class BudgetResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  month!: number;

  @ApiProperty()
  year!: number;

  @ApiProperty()
  totalIncome!: number;

  @ApiProperty()
  totalFixed!: number;

  @ApiProperty()
  totalSpent!: number;

  @ApiProperty()
  availableBalance!: number;

  @ApiProperty()
  remainingBalance!: number;

  @ApiProperty()
  dailyBudget!: number;

  @ApiProperty({ enum: ['LINEAR', 'AGGRESSIVE', 'SMART'] })
  strategy!: StrategyType;

  @ApiProperty({ enum: ['HEALTHY', 'WARNING', 'CRITICAL', 'NEGATIVE'] })
  status!: BudgetStatus;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
