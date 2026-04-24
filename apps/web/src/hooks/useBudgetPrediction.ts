import { useQuery } from '@tanstack/react-query';
import { deepseekService } from '@/services/deepseek.service';
import { Budget } from '@/types';

export function useBudgetPrediction(budget?: Budget, enabled = true) {
  const now = new Date();
  const totalDays = budget ? new Date(budget.year, budget.month, 0).getDate() : 30;

  return useQuery({
    queryKey: ['deepseek', 'prediction', budget?.id, budget?.updatedAt],
    queryFn: () =>
      deepseekService.predictBudget({
        totalIncome: budget?.totalIncome || 0,
        totalFixed: budget?.totalFixed || 0,
        totalSpent: budget?.totalSpent || 0,
        currentDay: now.getDate(),
        totalDays,
      }),
    enabled: !!budget && enabled,
    staleTime: 1000 * 60 * 5,
  });
}
