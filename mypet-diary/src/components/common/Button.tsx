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
  primary: 'bg-primary text-white hover:bg-primary-500 active:bg-primary-600',
  secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
  outline: 'bg-surface text-ink border border-line hover:bg-gray-50',
  danger: 'bg-negative/10 text-negative hover:bg-negative/15',
};

const sizeClass: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px] rounded-soft',
  md: 'h-12 px-5 text-[15px] rounded-soft',
  lg: 'h-[54px] px-6 text-[16px] rounded-card',
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
        'inline-flex items-center justify-center gap-1.5 font-bold transition focus-visible:outline-none focus-visible:shadow-focus active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40',
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
