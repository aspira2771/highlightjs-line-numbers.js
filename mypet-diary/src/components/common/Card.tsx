import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}

export function Card({
  title,
  subtitle,
  action,
  children,
  className,
  ...rest
}: CardProps) {
  return (
    <div {...rest} className={cn('card', className)}>
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            {title && (
              <h3 className="font-serif text-[17px] font-medium tracking-tightest text-ink">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-[12px] text-muted">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function EmptyState({
  emoji = '🐾',
  title,
  description,
  action,
}: {
  emoji?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-card border border-line bg-surface px-6 py-12 text-center">
      <div className="text-3xl">{emoji}</div>
      <p className="font-serif text-[17px] tracking-tightest text-ink">{title}</p>
      {description && (
        <p className="max-w-xs text-[13px] leading-relaxed text-muted">
          {description}
        </p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
