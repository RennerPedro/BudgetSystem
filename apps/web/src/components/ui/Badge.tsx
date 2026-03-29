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
    HEALTHY: 'bg-[rgba(0,196,140,0.16)] text-[var(--accent-success)] border border-[rgba(0,196,140,0.35)]',
    WARNING: 'bg-[rgba(245,166,35,0.16)] text-[var(--accent-warning)] border border-[rgba(245,166,35,0.35)]',
    CRITICAL: 'bg-[rgba(255,77,77,0.16)] text-[var(--accent-danger)] border border-[rgba(255,77,77,0.35)]',
    NEGATIVE: 'bg-[rgba(255,77,77,0.16)] text-[var(--accent-danger)] border border-[rgba(255,77,77,0.35)]',
    INFO: 'bg-[var(--accent-primary-muted)] text-[var(--accent-primary)] border border-[rgba(45,127,249,0.35)]',
    default: 'bg-[var(--surface-overlay)] text-[var(--text-secondary)] border border-[var(--border-subtle)]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium leading-4',
        variants[variant] || variants.default,
        className
      )}
    >
      {children}
    </span>
  );
}
