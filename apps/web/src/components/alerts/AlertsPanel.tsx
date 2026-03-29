'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAlerts } from '@/hooks/useAlerts';
import { formatDateTime } from '@/lib/utils';
import { Bell, CheckCircle } from 'lucide-react';

export function AlertsPanel() {
  const { alerts, markAsRead, markAllAsRead } = useAlerts();

  if (alerts.length === 0) {
    return (
      <Card title="Alertas">
        <div className="text-center py-8">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">Nenhum alerta no momento</p>
        </div>
      </Card>
    );
  }

  const unreadAlerts = alerts.filter((a) => !a.read);

  return (
    <Card
      title="Alertas"
      subtitle={
        unreadAlerts.length > 0
          ? `${unreadAlerts.length} não lido${unreadAlerts.length > 1 ? 's' : ''}`
          : 'Todos os alertas lidos'
      }
    >
      {unreadAlerts.length > 0 && (
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllAsRead()}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Marcar todos como lidos
          </Button>
        </div>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg border transition-colors ${
              alert.read
                ? 'bg-gray-50 border-gray-200'
                : 'bg-white border-gray-300 shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <Badge variant={alert.severity}>{alert.severity}</Badge>
              {!alert.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAsRead([alert.id])}
                >
                  <CheckCircle className="w-4 h-4" />
                </Button>
              )}
            </div>
            <p className={`text-sm mb-1 ${alert.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
              {alert.message}
            </p>
            <p className="text-xs text-gray-500">
              {formatDateTime(alert.createdAt)}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
