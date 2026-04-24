import { api } from '@/lib/api';

export interface DeepSeekKeyStatus {
  configured: boolean;
  enabled: boolean;
}

export interface AIBudgetPrediction {
  predictedTotalSpent: number;
  recommendedDailyBudget: number;
  confidence: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  insights: string[];
  reasoning: string;
}

export const deepseekService = {
  async getKeyStatus(): Promise<DeepSeekKeyStatus> {
    const { data } = await api.get<DeepSeekKeyStatus>('/user/deepseek-key/status');
    return data;
  },

  async setApiKey(apiKey: string, autoEnable = true): Promise<{ success: boolean }> {
    const { data } = await api.post<{ success: boolean }>('/user/deepseek-key', { apiKey, autoEnable });
    return data;
  },

  async predictBudget(payload: {
    totalIncome: number;
    totalFixed: number;
    totalSpent: number;
    currentDay: number;
    totalDays: number;
  }): Promise<{ prediction: AIBudgetPrediction | null; fallbackToHeuristic: boolean }> {
    const { data } = await api.post('/deepseek/predict-budget', payload);
    return data;
  },

  async chat(message: string): Promise<{ response: string }> {
    const { data } = await api.post<{ response: string }>('/deepseek/chat', { message });
    return data;
  },

  async getChatHistory(): Promise<Array<{ id: string; role: 'user' | 'assistant'; content: string; createdAt: string }>> {
    const { data } = await api.get('/deepseek/chat/history');
    return data;
  },

  async suggestCategory(description: string, amount: number): Promise<{
    category: string;
    confidence: number;
    suggestedTags: string[];
  }> {
    const { data } = await api.post('/deepseek/categorize-expense', {
      description,
      amount,
    });
    return data;
  },
};
