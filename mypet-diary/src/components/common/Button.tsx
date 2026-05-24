import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
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
    'bg-primary text-white hover:bg-primary-400 active:bg-primary-500 shadow-soft',
  secondary:
    'bg-secondary-100 text-secondary-300 hover:bg-secondary-200 active:bg-secondary-300 active:text-white',
  ghost: 'bg-transparent text-ink hover:bg-primary-50',
  danger: 'bg-red-100 text-red-600 hover:bg-red-200',
};

const sizeClass: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-14 px-6 text-base',
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
        'inline-flex items-center justify-center gap-2 rounded-pill font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
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
