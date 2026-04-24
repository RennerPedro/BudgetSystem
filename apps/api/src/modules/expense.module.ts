import { Module } from '@nestjs/common';
import { ExpenseController } from '../interface/controllers/expense.controller';
import { ExpenseService } from '../application/services/expense.service';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { BudgetModule } from './budget.module';
import { DeepSeekModule } from './deepseek/deepseek.module';

@Module({
  imports: [BudgetModule, DeepSeekModule],
  controllers: [ExpenseController],
  providers: [ExpenseService, PrismaService],
  exports: [ExpenseService],
})
export class ExpenseModule {}
