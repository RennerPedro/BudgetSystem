import { DeepSeekService } from '../../../src/modules/deepseek/services/deepseek.service';

describe('DeepSeekService (pure helpers)', () => {
  const service = new DeepSeekService({} as any, {} as any, {} as any);

  it('validates key format', () => {
    expect(service.isValidApiKeyFormat('sk-test12345678901234567890')).toBe(true);
    expect(service.isValidApiKeyFormat('invalid-key')).toBe(false);
  });

  it('sanitizes prompt safely', () => {
    const prompt = 'Hello\u0000 world';
    expect(service.sanitizePrompt(prompt)).toBe('Hello  world');
  });
});
