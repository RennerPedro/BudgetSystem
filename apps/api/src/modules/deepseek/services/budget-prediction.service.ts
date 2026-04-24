import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { DeepSeekService } from './deepseek.service';
import { AIBudgetPrediction, RiskLevel } from '../dto/budget-prediction.dto';

interface PredictionContext {
  totalIncome: number;
  totalFixed: number;
  totalSpent: number;
  currentDay: number;
  totalDays: number;
}

@Injectable()
export class BudgetPredictionService {
  private readonly logger = new Logger(BudgetPredictionService.name);

  constructor(
    private prisma: PrismaService,
    private deepseekService: DeepSeekService,
  ) {}

  async predictBudget(userId: string, context: PredictionContext): Promise<AIBudgetPrediction | null> {
    try {
      const { historicalSpending, categoryBreakdown, weekdayPattern } =
        await this.buildHistory(userId, context);

      const available = Math.max(0, context.totalIncome - context.totalFixed);
      const avgDaily = context.currentDay > 0 ? context.totalSpent / context.currentDay : 0;

      const prompt = `Voce e uma IA consultora financeira que analisa padroes de gastos.\n\nContexto:\n- Renda Mensal Total: ${context.totalIncome}\n- Despesas Fixas: ${context.totalFixed}\n- Orcamento Disponivel: ${available}\n- Dias Decorridos: ${context.currentDay}/${context.totalDays}\n- Total Gasto: ${context.totalSpent}\n- Gasto Medio Diario: ${avgDaily}\n\nHistorico (ultimos 30 dias):\n${JSON.stringify(historicalSpending, null, 2)}\n\nGastos por Categoria:\n${JSON.stringify(categoryBreakdown, null, 2)}\n\nGastos por Dia da Semana:\n${JSON.stringify(weekdayPattern, null, 2)}\n\nTarefas:\n1. Prever o gasto total do mes com base nos padroes\n2. Calcular o orcamento diario recomendado para os dias restantes\n3. Identificar anomalias ou tendencias de gasto\n4. Definir nivel de risco: LOW | MEDIUM | HIGH | CRITICAL\n\nUse portugues do Brasil em insights e reasoning.\n\nResponda SOMENTE com JSON valido:\n{\n  \"predictedTotalSpent\": number,\n  \"recommendedDailyBudget\": number,\n  \"confidence\": number,\n  \"riskLevel\": \"LOW\" | \"MEDIUM\" | \"HIGH\" | \"CRITICAL\",\n  \"insights\": string[],\n  \"reasoning\": string\n}`;

      const cacheKey = this.deepseekService.makeCacheKey('budget-prediction', userId, {
        context,
        categoryBreakdown,
        weekdayPattern,
      });

      const completion = await this.deepseekService.completeJson(
        userId,
        'budget_prediction',
        prompt,
        cacheKey,
      );

      return this.parsePrediction(completion.content, context);
    } catch (error) {
      this.logger.warn(`Falling back to heuristic prediction: ${(error as Error).message}`);
      return null;
    }
  }

  private async buildHistory(userId: string, context: PredictionContext) {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 30);

    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        type: 'VARIABLE',
        date: {
          gte: start,
          lte: now,
        },
      },
      orderBy: {
        date: 'asc',
      },
      select: {
        amount: true,
        category: true,
        date: true,
      },
    });

    const categoryBreakdown = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

    const weekdayPattern = expenses.reduce((acc, curr) => {
      const weekday = curr.date.getDay();
      const key = `${weekday}`;
      acc[key] = (acc[key] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

    const historicalSpending = expenses.map((expense) => ({
      amount: expense.amount,
      category: expense.category,
      date: expense.date.toISOString().slice(0, 10),
    }));

    return { historicalSpending, categoryBreakdown, weekdayPattern };
  }

  private parsePrediction(response: string, context: PredictionContext): AIBudgetPrediction {
    const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    const riskLevel = this.normalizeRiskLevel(parsed.riskLevel);
    const confidence = this.clampNumber(parsed.confidence, 0, 1, 0.5);

    return {
      predictedTotalSpent: this.clampNumber(
        parsed.predictedTotalSpent,
        0,
        context.totalIncome * 10,
        context.totalSpent,
      ),
      recommendedDailyBudget: this.clampNumber(
        parsed.recommendedDailyBudget,
        0,
        context.totalIncome,
        Math.max(0, (context.totalIncome - context.totalFixed - context.totalSpent) / Math.max(1, context.totalDays - context.currentDay)),
      ),
      confidence,
      riskLevel,
      insights: Array.isArray(parsed.insights)
        ? parsed.insights.slice(0, 4).map((item: unknown) => String(item))
        : [],
      reasoning: typeof parsed.reasoning === 'string' ? parsed.reasoning.slice(0, 260) : 'Projecao de IA gerada',
    };
  }

  private normalizeRiskLevel(value: unknown): RiskLevel {
    const allowed: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    if (typeof value === 'string' && allowed.includes(value as RiskLevel)) {
      return value as RiskLevel;
    }
    return 'MEDIUM';
  }

  private clampNumber(value: unknown, min: number, max: number, fallback: number): number {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return fallback;
    }

    return Math.max(min, Math.min(max, value));
  }
}
