import {
  BadRequestException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { EncryptionService } from './encryption.service';
import { DeepSeekRateLimiterService } from './deepseek-rate-limiter.service';

interface CompletionResult {
  content: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cached: boolean;
}

@Injectable()
export class DeepSeekService {
  private readonly logger = new Logger(DeepSeekService.name);
  private readonly model = process.env.DEEPSEEK_MODEL?.trim() || 'deepseek-chat';
  private readonly baseUrl =
    process.env.DEEPSEEK_BASE_URL?.trim() ||
    'https://api.deepseek.com';
  private readonly maxOutputTokens = 600;

  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
    private limiter: DeepSeekRateLimiterService,
  ) {}

  async getKeyStatus(userId: string): Promise<{ configured: boolean; enabled: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        encryptedDeepseekKey: true,
        deepseekEnabled: true,
      },
    });

    return {
      configured: !!user?.encryptedDeepseekKey,
      enabled: !!user?.deepseekEnabled,
    };
  }

  async setApiKey(userId: string, apiKey: string, autoEnable = true): Promise<void> {
    const cleaned = apiKey.trim();

    if (!this.isValidApiKeyFormat(cleaned)) {
      throw new BadRequestException('Invalid DeepSeek API key format');
    }

    await this.validateApiKey(cleaned);

    const payload = this.encryptionService.encrypt(
      cleaned,
      userId,
      this.getMasterSecret(),
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        encryptedDeepseekKey: payload.encrypted,
        deepseekKeyIv: payload.iv,
        deepseekKeyTag: payload.tag,
        deepseekKeySalt: payload.salt,
        deepseekEnabled: autoEnable,
      },
    });
  }

  async completeJson(
    userId: string,
    feature: string,
    prompt: string,
    cacheKey: string,
    maxOutputTokens = this.maxOutputTokens,
  ): Promise<CompletionResult> {
    const sanitizedPrompt = this.sanitizePrompt(prompt);
    const isAllowed = await this.limiter.checkLimit(userId);

    if (!isAllowed) {
      throw new HttpException(
        'DeepSeek rate limit exceeded. Try again shortly.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const cached = await this.limiter.getCache<CompletionResult>(cacheKey);
    if (cached?.content) {
      await this.logUsage(userId, feature, {
        promptTokens: cached.promptTokens,
        completionTokens: cached.completionTokens,
        totalTokens: cached.totalTokens,
        success: true,
        cached: true,
        durationMs: 0,
      });

      return {
        ...cached,
        cached: true,
      };
    }

    const apiKey = await this.getDecryptedApiKey(userId);
    const started = Date.now();

    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.model,
            temperature: 0.2,
            max_tokens: Math.min(maxOutputTokens, 800),
            response_format: { type: 'json_object' },
            messages: [{ role: 'user', content: sanitizedPrompt }],
          }),
        });

        const data = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
          usage?: {
            prompt_tokens?: number;
            completion_tokens?: number;
            total_tokens?: number;
          };
        };

        if (!response.ok) {
          const error = new Error(`DeepSeek request failed with status ${response.status}`) as Error & {
            status?: number;
          };
          error.status = response.status;
          throw error;
        }

        const content = data.choices?.[0]?.message?.content?.trim();

        if (!content) {
          throw new Error('DeepSeek returned empty content');
        }

        const usage = {
          promptTokens: data.usage?.prompt_tokens ?? this.estimateTokens(sanitizedPrompt),
          completionTokens: data.usage?.completion_tokens ?? this.estimateTokens(content),
          totalTokens:
            data.usage?.total_tokens ??
            this.estimateTokens(sanitizedPrompt) + this.estimateTokens(content),
          success: true,
          cached: false,
          durationMs: Date.now() - started,
        };

        await this.logUsage(userId, feature, usage);

        const result: CompletionResult = {
          content,
          promptTokens: usage.promptTokens,
          completionTokens: usage.completionTokens,
          totalTokens: usage.totalTokens,
          cached: false,
        };

        await this.limiter.setCache(cacheKey, result);

        return result;
      } catch (error) {
        lastError = error as Error;
        const delay = 300 * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    await this.logUsage(userId, feature, {
      promptTokens: this.estimateTokens(sanitizedPrompt),
      completionTokens: 0,
      totalTokens: this.estimateTokens(sanitizedPrompt),
      success: false,
      cached: false,
      errorMessage: lastError?.message || 'DeepSeek request failed',
      durationMs: Date.now() - started,
    });

    this.logger.error(`DeepSeek request failed for feature ${feature}: ${lastError?.message}`);

    const providerStatus = this.getProviderStatus(lastError);
    if (providerStatus === 429) {
      throw new HttpException(
        'Sua cota da DeepSeek foi excedida. Verifique billing e limites da sua conta.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (providerStatus === 401) {
      throw new BadRequestException('Chave da DeepSeek invalida ou sem permissao para uso.');
    }

    if (providerStatus === 404) {
      throw new ServiceUnavailableException('Modelo de IA indisponivel para esta chave DeepSeek.');
    }

    throw new ServiceUnavailableException('AI service temporarily unavailable');
  }

  makeCacheKey(feature: string, userId: string, payload: unknown): string {
    const hash = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
    return `deepseek:${feature}:${userId}:${hash}`;
  }

  sanitizePrompt(prompt: string): string {
    const trimmed = prompt.replace(/[\u0000-\u001F\u007F]/g, ' ').trim();
    return trimmed.slice(0, 5000);
  }

  isValidApiKeyFormat(key: string): boolean {
    return key.startsWith('sk-') && key.length >= 20;
  }

  private getProviderStatus(error?: Error): number | undefined {
    const providerError = error as Error & {
      status?: number;
      response?: {
        status?: number;
      };
    };

    return providerError?.status ?? providerError?.response?.status;
  }

  private async validateApiKey(apiKey: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`DeepSeek key validation failed with status ${response.status}`);
      }
    } catch (error) {
      throw new BadRequestException('Failed to validate DeepSeek API key');
    }
  }

  private async getDecryptedApiKey(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        encryptedDeepseekKey: true,
        deepseekKeyIv: true,
        deepseekKeyTag: true,
        deepseekKeySalt: true,
        deepseekEnabled: true,
      },
    });

    if (
      !user?.deepseekEnabled ||
      !user.encryptedDeepseekKey ||
      !user.deepseekKeyIv ||
      !user.deepseekKeyTag ||
      !user.deepseekKeySalt
    ) {
      throw new BadRequestException('DeepSeek key not configured for this user');
    }

    return this.encryptionService.decrypt(
      {
        encrypted: user.encryptedDeepseekKey,
        iv: user.deepseekKeyIv,
        tag: user.deepseekKeyTag,
        salt: user.deepseekKeySalt,
      },
      userId,
      this.getMasterSecret(),
    );
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  private getMasterSecret(): string {
    const secret =
      process.env.DEEPSEEK_KEY_ENCRYPTION_SECRET ||
      process.env.JWT_SECRET;

    if (!secret) {
      throw new InternalServerErrorException(
        'Encryption secret is not configured. Set DEEPSEEK_KEY_ENCRYPTION_SECRET (preferred) or JWT_SECRET.',
      );
    }

    return secret;
  }

  private async logUsage(
    userId: string,
    feature: string,
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
      success: boolean;
      cached: boolean;
      durationMs: number;
      errorMessage?: string;
    },
  ): Promise<void> {
    await this.prisma.deepSeekUsageLog.create({
      data: {
        userId,
        feature,
        model: this.model,
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        totalTokens: usage.totalTokens,
        success: usage.success,
        cached: usage.cached,
        durationMs: usage.durationMs,
        errorMessage: usage.errorMessage,
      },
    });
  }

}
