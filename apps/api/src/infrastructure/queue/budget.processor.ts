import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { BudgetService } from '../../application/services/budget.service';

@Injectable()
@Processor('budget')
export class BudgetProcessor extends WorkerHost {
  private readonly logger = new Logger(BudgetProcessor.name);

  constructor(private budgetService: BudgetService) {
    super();
  }

  async process(job: Job): Promise<unknown> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    switch (job.name) {
      case 'recalculate':
        return this.handleRecalculate(job);
      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
    }
  }

  private async handleRecalculate(job: Job) {
    const { budgetId } = job.data;

    try {
      await this.budgetService.recalculateBudget(budgetId);
      this.logger.log(`Budget ${budgetId} recalculated successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.stack || error.message : String(error);
      this.logger.error(`Failed to recalculate budget ${budgetId}`, errorMessage);
      throw error;
    }
  }
}
