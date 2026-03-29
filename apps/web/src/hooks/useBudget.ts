import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetService, CreateBudgetDto } from '@/services/budget.service';
import { StrategyType } from '@/types';

export function useBudget() {
  const queryClient = useQueryClient();

  const { data: budget, isLoading, error } = useQuery({
    queryKey: ['budget', 'current'],
    queryFn: () => budgetService.getCurrentBudget(),
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateBudgetDto) => budgetService.createBudget(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget', 'current'] });
    },
  });

  const updateStrategyMutation = useMutation({
    mutationFn: (strategy: StrategyType) => budgetService.updateStrategy(strategy),
    onSuccess: (updatedBudget) => {
      queryClient.setQueryData(['budget', 'current'], updatedBudget);
      queryClient.invalidateQueries({ queryKey: ['budget', 'current'] });
    },
  });

  const updateIncomeMutation = useMutation({
    mutationFn: (totalIncome: number) => budgetService.updateIncome(totalIncome),
    onSuccess: (updatedBudget) => {
      queryClient.setQueryData(['budget', 'current'], updatedBudget);
      queryClient.invalidateQueries({ queryKey: ['budget', 'current'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });

  const updateFixedMutation = useMutation({
    mutationFn: (totalFixed: number) => budgetService.updateFixed(totalFixed),
    onSuccess: (updatedBudget) => {
      queryClient.setQueryData(['budget', 'current'], updatedBudget);
      queryClient.invalidateQueries({ queryKey: ['budget', 'current'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });

  const { data: adjustments = [] } = useQuery({
    queryKey: ['budget', 'adjustments'],
    queryFn: () => budgetService.getAdjustmentHistory(),
    enabled: !!budget,
  });

  return {
    budget,
    isLoading,
    error,
    createBudget: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateStrategy: updateStrategyMutation.mutate,
    isUpdatingStrategy: updateStrategyMutation.isPending,
    updateIncome: updateIncomeMutation.mutate,
    isUpdatingIncome: updateIncomeMutation.isPending,
    updateFixed: updateFixedMutation.mutate,
    isUpdatingFixed: updateFixedMutation.isPending,
    adjustments,
  };
}
