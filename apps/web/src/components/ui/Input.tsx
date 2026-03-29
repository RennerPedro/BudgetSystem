import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-[var(--text-sm)] font-medium text-[var(--text-secondary)]">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            'input-shell',
            error ? 'border-[var(--accent-danger)]' : '',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-2 text-[var(--text-xs)] text-[var(--accent-danger)]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
