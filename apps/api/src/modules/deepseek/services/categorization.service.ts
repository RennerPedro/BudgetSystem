import { Injectable } from '@nestjs/common';
import { DeepSeekService } from './deepseek.service';

@Injectable()
export class CategorizationService {
  private readonly allowedCategories = [
    'food',
    'transport',
    'entertainment',
    'shopping',
    'health',
    'education',
    'housing',
    'utilities',
    'other',
  ];

  constructor(private deepseekService: DeepSeekService) {}

  async suggestCategory(userId: string, description: string, amount: number) {
    const prompt = `Despesa: \"${description}\"\nValor: ${amount}\n\nCom base na descricao, categorize esta despesa.\n\nCategorias permitidas: ${this.allowedCategories.join(', ')}\n\nUse portugues do Brasil nos suggestedTags.\n\nResponda com JSON:\n{\n  \"category\": string,\n  \"confidence\": number,\n  \"suggestedTags\": string[]\n}`;

    const cacheKey = this.deepseekService.makeCacheKey('expense-categorization', userId, {
      description,
      amount,
    });

    const completion = await this.deepseekService.completeJson(
      userId,
      'expense_categorization',
      prompt,
      cacheKey,
      220,
    );

    const parsed = JSON.parse(completion.content);

    const category = this.allowedCategories.includes(parsed.category)
      ? parsed.category
      : 'other';

    return {
      category,
      confidence:
        typeof parsed.confidence === 'number'
          ? Math.max(0, Math.min(1, parsed.confidence))
          : 0.5,
      suggestedTags: Array.isArray(parsed.suggestedTags)
        ? parsed.suggestedTags.slice(0, 4).map((tag: unknown) => String(tag))
        : [],
    };
  }
}
