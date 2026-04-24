import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { deepseekService } from '@/services/deepseek.service';

type ChatItem = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
};

type ApiErrorResponse = {
  message?: string | string[];
};

export function useChatAssistant(enabled = true) {
  const queryClient = useQueryClient();

  const historyQuery = useQuery({
    queryKey: ['deepseek', 'chat-history'],
    queryFn: () => deepseekService.getChatHistory(),
    enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const askMutation = useMutation({
    mutationFn: (message: string) => deepseekService.chat(message),
    onMutate: async (message) => {
      const now = Date.now();
      const userId = `tmp-user-${now}`;
      const assistantId = `tmp-assistant-${now + 1}`;

      queryClient.setQueryData(
        ['deepseek', 'chat-history'],
        (current: ChatItem[] = []) => [
          ...current,
          {
            id: userId,
            role: 'user',
            content: message,
            createdAt: new Date().toISOString(),
          },
          {
            id: assistantId,
            role: 'assistant',
            content: 'Pensando...',
            createdAt: new Date().toISOString(),
          },
        ],
      );

      return { assistantId };
    },
    onSuccess: (data, _message, context) => {
      if (context?.assistantId) {
        queryClient.setQueryData(
          ['deepseek', 'chat-history'],
          (current: ChatItem[] = []) =>
            current.map((item) =>
              item.id === context.assistantId ? { ...item, content: data.response } : item,
            ),
        );
      }
    },
    onError: (error, _message, context) => {
      const apiError = error as AxiosError<ApiErrorResponse>;
      const messageFromApi = apiError.response?.data?.message;
      const fallbackMessage =
        'Nao consegui responder agora. Verifique se a chave da DeepSeek esta configurada e tente novamente.';

      const errorMessage = Array.isArray(messageFromApi)
        ? messageFromApi[0] || fallbackMessage
        : messageFromApi || fallbackMessage;

      if (context?.assistantId) {
        queryClient.setQueryData(
          ['deepseek', 'chat-history'],
          (current: ChatItem[] = []) =>
            current.map((item) =>
              item.id === context.assistantId
                ? {
                    ...item,
                    content: errorMessage,
                  }
                : item,
            ),
        );
      }
    },
  });

  return {
    history: historyQuery.data || [],
    isLoadingHistory: historyQuery.isLoading,
    ask: askMutation.mutate,
    isAsking: askMutation.isPending,
    askError: askMutation.error,
  };
}
