import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertService } from '@/services/alert.service';

export function useAlerts(unreadOnly = false) {
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts', unreadOnly],
    queryFn: () => alertService.getAlerts(unreadOnly),
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['alerts', 'unread-count'],
    queryFn: () => alertService.getUnreadCount(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const markReadMutation = useMutation({
    mutationFn: (alertIds: string[]) => alertService.markAsRead(alertIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => alertService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  return {
    alerts,
    unreadCount,
    isLoading,
    markAsRead: markReadMutation.mutate,
    markAllAsRead: markAllReadMutation.mutate,
  };
}
