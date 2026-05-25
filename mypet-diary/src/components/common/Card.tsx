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
            {title && <h3 className="section-title">{title}</h3>}
            {subtitle && (
              <p className="mt-1 text-[13px] text-muted">{subtitle}</p>
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
    <div className="flex flex-col items-center justify-center gap-2 rounded-card bg-surface px-6 py-14 text-center shadow-soft">
      <div className="mb-1 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-3xl">
        {emoji}
      </div>
      <p className="text-[17px] font-bold tracking-tight text-ink">{title}</p>
      {description && (
        <p className="max-w-xs text-[14px] leading-relaxed text-muted">
          {description}
        </p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
