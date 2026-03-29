import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { BudgetStatus, AlertSeverity } from '@/types';

interface BadgeProps {
  children: ReactNode;
  variant?: BudgetStatus | AlertSeverity | 'default';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    HEALTHY: 'bg-success-100 text-success-700',
    WARNING: 'bg-warning-100 text-warning-700',
    CRITICAL: 'bg-danger-100 text-danger-700',
    NEGATIVE: 'bg-danger-100 text-danger-700',
    INFO: 'bg-primary-100 text-primary-700',
    default: 'bg-gray-100 text-gray-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant] || variants.default,
        className
      )}
    >
      {children}
    </span>
  );
}
