import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function Card({ children, className, title, subtitle }: CardProps) {
  return (
    <div className={cn('card-shell p-6', className)}>
      {(title || subtitle) && (
        <div className="mb-4 border-b border-[var(--border-subtle)] pb-3">
          {title && <h3 className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)]">{title}</h3>}
          {subtitle && <p className="mt-1 text-[var(--text-sm)] text-[var(--text-secondary)]">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
