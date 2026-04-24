import { Module, OnModuleInit } from '@nestjs/common';
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { DeepSeekController } from './deepseek.controller';
import { UserDeepSeekController } from './user-deepseek.controller';
import { EncryptionService } from './services/encryption.service';
import { DeepSeekRateLimiterService } from './services/deepseek-rate-limiter.service';
import { DeepSeekService } from './services/deepseek.service';
import { BudgetPredictionService } from './services/budget-prediction.service';
import { ChatAssistantService } from './services/chat-assistant.service';
import { CategorizationService } from './services/categorization.service';
import { DailyInsightsProcessor } from './jobs/daily-insights.processor';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'deepseek',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');

        if (redisUrl) {
          const parsedUrl = new URL(redisUrl);
          return {
            connection: {
              host: parsedUrl.hostname,
              port: parseInt(parsedUrl.port || '6379', 10),
            },
          };
        }

        return {
          connection: {
            host: configService.get('REDIS_HOST') || 'redis',
            port: configService.get('REDIS_PORT') || 6379,
          },
        };
      },
    }),
  ],
  controllers: [DeepSeekController, UserDeepSeekController],
  providers: [
    PrismaService,
    EncryptionService,
    DeepSeekRateLimiterService,
    DeepSeekService,
    BudgetPredictionService,
    ChatAssistantService,
    CategorizationService,
    DailyInsightsProcessor,
  ],
  exports: [DeepSeekService, BudgetPredictionService, CategorizationService, ChatAssistantService],
})
export class DeepSeekModule implements OnModuleInit {
  constructor(@InjectQueue('deepseek') private readonly deepseekQueue: Queue) {}

  async onModuleInit(): Promise<void> {
    await this.deepseekQueue.add(
      'daily-insights-dispatch',
      {},
      {
        repeat: {
          pattern: '0 6 * * *',
        },
        removeOnComplete: 100,
        removeOnFail: 100,
      },
    );
  }
}
