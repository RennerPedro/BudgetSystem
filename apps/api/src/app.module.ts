import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { BullModule } from '@nestjs/bullmq';
import { AuthModule } from './modules/auth.module';
import { BudgetModule } from './modules/budget.module';
import { ExpenseModule } from './modules/expense.module';
import { AlertModule } from './modules/alert.module';
import { JwtAuthGuard } from './infrastructure/auth/jwt-auth.guard';

function getRedisConnection() {
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    const parsedUrl = new URL(redisUrl);
    return {
      host: parsedUrl.hostname,
      port: parseInt(parsedUrl.port || '6379', 10),
    };
  }

  return {
    host: process.env.REDIS_HOST || 'redis',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  };
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRoot({
      connection: getRedisConnection(),
    }),
    AuthModule,
    BudgetModule,
    ExpenseModule,
    AlertModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
