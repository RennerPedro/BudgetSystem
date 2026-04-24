import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deepseekService } from '@/services/deepseek.service';

export function useDeepSeek() {
  const queryClient = useQueryClient();

  const keyStatusQuery = useQuery({
    queryKey: ['deepseek', 'key-status'],
    queryFn: () => deepseekService.getKeyStatus(),
  });

  const setKeyMutation = useMutation({
    mutationFn: ({ apiKey, autoEnable }: { apiKey: string; autoEnable?: boolean }) =>
      deepseekService.setApiKey(apiKey, autoEnable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deepseek', 'key-status'] });
      queryClient.invalidateQueries({ queryKey: ['budget', 'current'] });
    },
  });

  return {
    keyStatus: keyStatusQuery.data,
    isLoadingStatus: keyStatusQuery.isLoading,
    setApiKey: setKeyMutation.mutate,
    isSettingKey: setKeyMutation.isPending,
  };
}
