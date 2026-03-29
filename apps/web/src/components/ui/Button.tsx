import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 focus-visible:outline-none disabled:opacity-60 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      danger: 'h-9 rounded-lg border border-transparent bg-[var(--accent-danger)] text-white hover:brightness-110',
      ghost: 'btn-ghost',
    };

    const sizes = {
      sm: 'h-8 px-3 text-[var(--text-sm)]',
      md: 'h-9 px-4 text-[var(--text-sm)]',
      lg: 'h-10 px-5 text-[var(--text-base)]',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="h-2 w-2 rounded-full bg-current opacity-75 animate-pulse" />
            Processando
          </>
        ) : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
