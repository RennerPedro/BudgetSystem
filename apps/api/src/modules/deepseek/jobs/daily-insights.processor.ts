import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { DeepSeekService } from '../services/deepseek.service';

@Injectable()
@Processor('deepseek')
export class DailyInsightsProcessor extends WorkerHost {
  private readonly logger = new Logger(DailyInsightsProcessor.name);

  constructor(
    private prisma: PrismaService,
    private deepseekService: DeepSeekService,
    @InjectQueue('deepseek') private readonly deepseekQueue: Queue,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    if (job.name === 'daily-insights-dispatch') {
      await this.dispatchDailyInsightsJobs();
      return;
    }

    if (job.name !== 'daily-insights') {
      return;
    }

    const { userId } = job.data as { userId: string };
    if (!userId || typeof userId !== 'string') {
      this.logger.warn('Skipping daily-insights job without a valid userId');
      return;
    }

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 1);

    const end = new Date(start);
    end.setHours(23, 59, 59, 999);

    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { date: 'asc' },
      take: 100,
    });

    const prompt = `Analise os gastos de ontem e forneca um insight principal, uma recomendacao e uma pontuacao de saude financeira de 0 a 100.\n\nDespesas:\n${JSON.stringify(
      expenses,
      null,
      2,
    )}\n\nResponda SOMENTE com JSON em portugues do Brasil: {\"insight\": string, \"recommendation\": string, \"healthScore\": number}`;

    try {
      const completion = await this.deepseekService.completeJson(
        userId,
        'daily_insights',
        prompt,
        this.deepseekService.makeCacheKey('daily-insights', userId, {
          start: start.toISOString(),
        }),
        260,
      );

      const parsed = JSON.parse(completion.content);
      const message = `${parsed.insight || 'Insight unavailable'} Recommendation: ${parsed.recommendation || 'No recommendation.'} Health score: ${Math.max(0, Math.min(100, Number(parsed.healthScore) || 50))}`;

      this.logger.log(`Daily insight generated for ${userId}: ${message.slice(0, 300)}`);
    } catch (error) {
      this.logger.warn(`Daily insight generation skipped for ${userId}: ${(error as Error).message}`);
    }
  }

  private async dispatchDailyInsightsJobs(): Promise<void> {
    const users = await this.prisma.user.findMany({
      where: {
        deepseekEnabled: true,
        encryptedDeepseekKey: {
          not: null,
        },
      },
      select: {
        id: true,
      },
      take: 1000,
    });

    const dayKey = new Date().toISOString().slice(0, 10);

    await Promise.all(
      users.map((user) =>
        this.deepseekQueue.add(
          'daily-insights',
          { userId: user.id },
          {
            jobId: `daily-insights:${user.id}:${dayKey}`,
            removeOnComplete: 100,
            removeOnFail: 100,
          },
        ),
      ),
    );

    this.logger.log(`Dispatched daily-insights jobs for ${users.length} users`);
  }
}
