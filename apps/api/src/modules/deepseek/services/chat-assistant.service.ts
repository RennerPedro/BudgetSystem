import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { DeepSeekService } from './deepseek.service';

const RECENT_EXPENSE_LIMIT = 10;
const RECENT_CHAT_CONTEXT_LIMIT = 4;
const FORMATTED_EXPENSE_LIMIT = 8;
const USER_MESSAGE_MAX_LENGTH = 500;
const ASSISTANT_MESSAGE_MAX_LENGTH = 1000;

interface BudgetSnapshot {
  totalIncome: number;
  totalFixed: number;
  availableBalance: number;
  totalSpent: number;
  remainingBalance: number;
  dailyBudget: number;
  status: string;
  strategy: string;
}

interface RecentExpense {
  id: string;
  amount: number;
  category: string;
  date: Date;
}

interface ChatContextMessage {
  id: string;
  role: string;
  content: string;
}

interface BudgetInsight {
  spendingRate: number;
  daysRemaining: number;
  remainingPerDay: number;
  projectedEndBalance: number;
  topCategories: Array<{ category: string; amount: number }>;
}

@Injectable()
export class ChatAssistantService {
  constructor(
    private prisma: PrismaService,
    private deepseekService: DeepSeekService,
  ) {}

  async ask(userId: string, message: string): Promise<string> {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const [budget, recentExpenses, recentMessages] = await Promise.all([
      this.prisma.budget.findUnique({
        where: { userId_month_year: { userId, month, year } },
      }),
      this.prisma.expense.findMany({
        where: {
          userId,
          date: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: { date: 'desc' },
        take: RECENT_EXPENSE_LIMIT,
      }),
      this.prisma.aIChatMessage.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: RECENT_CHAT_CONTEXT_LIMIT,
      }),
    ]);

    const budgetSnapshot = budget as BudgetSnapshot | null;
    const expenseSnapshot = recentExpenses as RecentExpense[];
    const contextSnapshot = recentMessages as ChatContextMessage[];

    const insights = this.calculateBudgetInsights(budgetSnapshot, expenseSnapshot, now);

    const prompt = this.buildLeanPrompt(
      message,
      budgetSnapshot,
      expenseSnapshot,
      contextSnapshot,
      insights,
    );

    const cacheKey = this.deepseekService.makeCacheKey('assistant-chat', userId, {
      message: message.trim().toLowerCase(),
      budget: budgetSnapshot
        ? {
            totalIncome: budgetSnapshot.totalIncome,
            totalFixed: budgetSnapshot.totalFixed,
            totalSpent: budgetSnapshot.totalSpent,
            remainingBalance: budgetSnapshot.remainingBalance,
            dailyBudget: budgetSnapshot.dailyBudget,
            status: budgetSnapshot.status,
            strategy: budgetSnapshot.strategy,
          }
        : null,
      recentExpenses: expenseSnapshot.map((expense) => ({
        id: expense.id,
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
      })),
      recentMessages: contextSnapshot.map((chat) => ({
        id: chat.id,
        role: chat.role,
        content: chat.content,
      })),
      insights,
    });

    const completion = await this.deepseekService.completeJson(
      userId,
      'assistant_chat',
      prompt,
      cacheKey,
      300,
    );

    const response = this.extractResponse(completion.content);

    await this.prisma.aIChatMessage.createMany({
      data: [
        {
          userId,
          role: 'user',
          content: message.slice(0, USER_MESSAGE_MAX_LENGTH),
        },
        {
          userId,
          role: 'assistant',
          content: response.slice(0, ASSISTANT_MESSAGE_MAX_LENGTH),
        },
      ],
    });

    return response;
  }

  private buildLeanPrompt(
    userMessage: string,
    budget: BudgetSnapshot | null,
    expenses: RecentExpense[],
    context: ChatContextMessage[],
    insights: BudgetInsight,
  ): string {
    return `Voce e Sofia, assistente de educacao financeira em portugues do Brasil.

Use apenas os dados abaixo. Nao invente valores.

Orcamento atual:
- renda: R$ ${budget?.totalIncome?.toFixed(2) ?? '0.00'}
- gastos fixos: R$ ${budget?.totalFixed?.toFixed(2) ?? '0.00'}
- total gasto: R$ ${budget?.totalSpent?.toFixed(2) ?? '0.00'}
- saldo restante: R$ ${budget?.remainingBalance?.toFixed(2) ?? '0.00'}
- orcamento diario: R$ ${budget?.dailyBudget?.toFixed(2) ?? '0.00'}
- status: ${budget?.status ?? 'N/A'}
- estrategia: ${budget?.strategy ?? 'N/A'}

Insights:
- taxa de gasto: ${insights.spendingRate.toFixed(1)}%
- dias restantes: ${insights.daysRemaining}
- saldo por dia: R$ ${insights.remainingPerDay.toFixed(2)}
- projecao de saldo final: R$ ${insights.projectedEndBalance.toFixed(2)}

Top categorias recentes:
${insights.topCategories.length > 0 ? insights.topCategories.map((item, i) => `${i + 1}. ${item.category}: R$ ${item.amount.toFixed(2)}`).join('\n') : '- sem dados'}

Despesas recentes (ultimos 7 dias):
${this.formatExpenses(expenses)}

Contexto curto do chat:
${this.formatContext(context)}

Pergunta do usuario:
"${userMessage}"

Regras da resposta:
- responda em ate 140 palavras
- seja pratica, didatica e empatica
- inclua no maximo 3 acoes concretas
- cite numeros reais quando possivel

Responda SOMENTE em JSON valido:
{"response":"..."}`;
  }

  private calculateBudgetInsights(
    budget: BudgetSnapshot | null,
    expenses: RecentExpense[],
    now: Date,
  ): BudgetInsight {
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDay = now.getDate();
    const daysRemaining = Math.max(daysInMonth - currentDay, 0);

    if (!budget) {
      return {
        spendingRate: 0,
        daysRemaining,
        remainingPerDay: 0,
        projectedEndBalance: 0,
        topCategories: [],
      };
    }

    const availableBase = Number(budget.availableBalance ?? 0);
    const totalSpent = Number(budget.totalSpent ?? 0);
    const remainingBalance = Number(budget.remainingBalance ?? 0);

    const spendingRate = availableBase > 0 ? (totalSpent / availableBase) * 100 : 0;
    const dailyAverage = currentDay > 0 ? totalSpent / currentDay : 0;
    const projectedMonthSpent = dailyAverage * daysInMonth;
    const projectedEndBalance = availableBase - projectedMonthSpent;
    const remainingPerDay = daysRemaining > 0 ? remainingBalance / daysRemaining : remainingBalance;

    const categoryMap = new Map<string, number>();
    for (const expense of expenses) {
      const currentValue = categoryMap.get(expense.category) || 0;
      categoryMap.set(expense.category, currentValue + Number(expense.amount));
    }

    const topCategories = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    return {
      spendingRate,
      daysRemaining,
      remainingPerDay,
      projectedEndBalance,
      topCategories,
    };
  }

  private formatExpenses(expenses: RecentExpense[]): string {
    if (!expenses.length) {
      return '- nenhuma despesa recente';
    }

    return expenses
      .slice(0, FORMATTED_EXPENSE_LIMIT)
      .map((expense) => {
        const date = new Date(expense.date);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `- ${day}/${month} | ${expense.category} | R$ ${Number(expense.amount).toFixed(2)}`;
      })
      .join('\n');
  }

  private formatContext(context: ChatContextMessage[]): string {
    if (!context.length) {
      return '- primeira interacao';
    }

    return context
      .slice()
      .reverse()
      .map((item) => {
        const label = item.role === 'user' ? 'Usuario' : 'Sofia';
        return `- ${label}: ${String(item.content).slice(0, 180)}`;
      })
      .join('\n');
  }

  private extractResponse(content: string): string {
    try {
      const parsed = JSON.parse(content);
      if (typeof parsed?.response === 'string' && parsed.response.trim().length > 0) {
        return parsed.response;
      }
    } catch {}

    return 'Nao consegui gerar uma resposta agora. Pode tentar novamente?';
  }

  async getHistory(userId: string) {
    return this.prisma.aIChatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });
  }
}
