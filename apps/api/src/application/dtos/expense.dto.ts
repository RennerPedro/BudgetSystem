import { IsNumber, IsString, IsEnum, IsDateString, Min, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ExpenseType } from '../../domain/types';

export class CreateExpenseDto {
  @ApiProperty({ example: 150.50, description: 'Expense amount' })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty({ enum: ['VARIABLE'], example: 'VARIABLE' })
  @IsEnum(['VARIABLE'])
  type!: ExpenseType;

  @ApiProperty({ example: 'food', description: 'Expense category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  autoCategorize?: boolean;

  @ApiProperty({ example: '2026-03-25', description: 'Expense date' })
  @IsDateString()
  date!: string;
}

export class ExpenseResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  budgetId!: string | null;

  @ApiProperty()
  amount!: number;

  @ApiProperty({ enum: ['FIXED', 'VARIABLE'] })
  type!: ExpenseType;

  @ApiProperty()
  category!: string;

  @ApiProperty()
  date!: Date;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class ExpenseStatsDto {
  @ApiProperty()
  total!: number;

  @ApiProperty()
  count!: number;

  @ApiProperty()
  byCategory!: Record<string, number>;

  @ApiProperty()
  byType!: Record<string, number>;
}
