import { api } from '@/lib/api';
import { Alert } from '@/types';

export const alertService = {
  async getAlerts(unreadOnly = false): Promise<Alert[]> {
    const params = new URLSearchParams();
    if (unreadOnly) params.append('unreadOnly', 'true');
    
    const { data } = await api.get<Alert[]>(`/alerts?${params.toString()}`);
    return data;
  },

  async getUnreadCount(): Promise<number> {
    const { data } = await api.get<{ count: number }>('/alerts/unread-count');
    return data.count;
  },

  async markAsRead(alertIds: string[]): Promise<void> {
    await api.post('/alerts/mark-read', { alertIds });
  },

  async markAllAsRead(): Promise<void> {
    await api.post('/alerts/mark-all-read');
  },
};
