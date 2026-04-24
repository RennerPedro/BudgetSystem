import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, MaxLength } from 'class-validator';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AIBudgetPrediction {
  predictedTotalSpent: number;
  recommendedDailyBudget: number;
  confidence: number;
  riskLevel: RiskLevel;
  insights: string[];
  reasoning: string;
}

export class PredictBudgetDto {
  @ApiProperty({ example: 5000 })
  @IsNumber()
  totalIncome!: number;

  @ApiProperty({ example: 1600 })
  @IsNumber()
  totalFixed!: number;

  @ApiProperty({ example: 1200 })
  @IsNumber()
  totalSpent!: number;

  @ApiProperty({ example: 8 })
  @IsNumber()
  currentDay!: number;

  @ApiProperty({ example: 30 })
  @IsNumber()
  totalDays!: number;
}

export class CategorizeExpenseDto {
  @ApiProperty({ example: 'uber airport' })
  @IsString()
  @MaxLength(150)
  description!: string;

  @ApiProperty({ example: 42.5 })
  @IsNumber()
  amount!: number;
}
