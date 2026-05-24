import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantClass: Record<Variant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-500 active:bg-primary-600',
  secondary:
    'bg-panel text-ink hover:bg-line',
  ghost:
    'bg-transparent text-ink-soft hover:bg-panel',
  outline:
    'bg-surface text-ink border border-line hover:border-primary-200 hover:text-primary',
  danger:
    'bg-surface border border-line text-red-700 hover:bg-red-50',
};

const sizeClass: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px]',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-[15px]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  block,
  leftIcon,
  rightIcon,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-soft font-medium transition focus-visible:outline-none focus-visible:shadow-focus active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50',
        variantClass[variant],
        sizeClass[size],
        block && 'w-full',
        className,
      )}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}
