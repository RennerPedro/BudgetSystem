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
        <div className="py-10 text-center">
          <Bell className="mx-auto mb-3 h-8 w-8 text-[var(--text-tertiary)]" />
          <p className="text-[var(--text-base)] text-[var(--text-secondary)]">Nenhum alerta no momento</p>
          <p className="mt-1 text-[var(--text-sm)] text-[var(--text-tertiary)]">Seu orçamento está sob controle.</p>
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
                ? 'bg-[var(--surface-overlay)] border-[var(--border-subtle)]'
                : 'bg-[var(--surface-raised)] border-[var(--border-default)]'
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
            <p className={`mb-1 text-[var(--text-sm)] ${alert.read ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)] font-medium'}`}>
              {alert.message}
            </p>
            <p className="financial-figure text-[var(--text-xs)] text-[var(--text-tertiary)]">
              {formatDateTime(alert.createdAt)}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
