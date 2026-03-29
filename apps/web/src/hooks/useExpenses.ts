import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseService, CreateExpenseDto } from '@/services/expense.service';

export function useExpenses(month?: number, year?: number) {
  const queryClient = useQueryClient();
  const expensesKey = ['expenses', month, year] as const;
  const statsKey = ['expenses', 'stats', month, year] as const;

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: expensesKey,
    queryFn: () => expenseService.getExpenses(month, year),
    staleTime: 0,
  });

  const { data: stats } = useQuery({
    queryKey: statsKey,
    queryFn: () => expenseService.getStats(month, year),
    staleTime: 0,
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateExpenseDto) => expenseService.createExpense(dto),
    onSuccess: async (createdExpense) => {
      queryClient.setQueryData(expensesKey, (oldExpenses: any) => {
        const current = Array.isArray(oldExpenses) ? oldExpenses : [];
        return [createdExpense, ...current];
      });

      await Promise.all([
        queryClient.refetchQueries({ queryKey: expensesKey, exact: true }),
        queryClient.refetchQueries({ queryKey: statsKey, exact: true }),
        queryClient.refetchQueries({ queryKey: ['budget', 'current'], exact: true }),
      ]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => expenseService.deleteExpense(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: expensesKey });
      const previousExpenses = queryClient.getQueryData(expensesKey);

      queryClient.setQueryData(expensesKey, (oldExpenses: any) => {
        const current = Array.isArray(oldExpenses) ? oldExpenses : [];
        return current.filter((expense: any) => expense.id !== id);
      });

      return { previousExpenses };
    },
    onError: (_error, _id, context) => {
      if (context?.previousExpenses) {
        queryClient.setQueryData(expensesKey, context.previousExpenses);
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: expensesKey, exact: true }),
        queryClient.refetchQueries({ queryKey: statsKey, exact: true }),
        queryClient.refetchQueries({ queryKey: ['budget', 'current'], exact: true }),
      ]);
    },
  });

  return {
    expenses,
    stats,
    isLoading,
    createExpense: createMutation.mutate,
    isCreating: createMutation.isPending,
    deleteExpense: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
