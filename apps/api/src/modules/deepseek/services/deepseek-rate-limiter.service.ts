import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class DeepSeekRateLimiterService implements OnModuleDestroy {
  private readonly redis: Redis;
  private readonly requestsPerMinute = 3;
  private readonly requestsPerDay = 200;

  constructor() {
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      this.redis = new Redis(redisUrl);
      return;
    }

    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'redis',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    });
  }

  async checkLimit(userId: string): Promise<boolean> {
    const minuteKey = `ratelimit:deepseek:${userId}:minute`;
    const dayKey = `ratelimit:deepseek:${userId}:day`;

    const [minuteCount, dayCount] = await Promise.all([
      this.redis.incr(minuteKey),
      this.redis.incr(dayKey),
    ]);

    if (minuteCount === 1) {
      await this.redis.expire(minuteKey, 60);
    }

    if (dayCount === 1) {
      await this.redis.expire(dayKey, 60 * 60 * 24);
    }

    return minuteCount <= this.requestsPerMinute && dayCount <= this.requestsPerDay;
  }

  async getCache<T>(key: string): Promise<T | null> {
    const raw = await this.redis.get(key);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as T;
  }

  async setCache(key: string, value: unknown, ttlSeconds = 60 * 60 * 24): Promise<void> {
    await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }
}
