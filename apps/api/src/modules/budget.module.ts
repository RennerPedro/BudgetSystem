import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BudgetController } from '../interface/controllers/budget.controller';
import { BudgetService } from '../application/services/budget.service';
import { BudgetProcessor } from '../infrastructure/queue/budget.processor';
import { PrismaService } from '../infrastructure/database/prisma.service';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'budget',
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
  controllers: [BudgetController],
  providers: [BudgetService, BudgetProcessor, PrismaService],
  exports: [BudgetService],
})
export class BudgetModule {}
