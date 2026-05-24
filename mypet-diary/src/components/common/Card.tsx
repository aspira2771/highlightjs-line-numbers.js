import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  action?: ReactNode;
}

export function Card({
  title,
  action,
  children,
  className,
  ...rest
}: CardProps) {
  return (
    <div {...rest} className={cn('card', className)}>
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between">
          {title && <h3 className="text-base font-bold text-ink">{title}</h3>}
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
    <div className="flex flex-col items-center justify-center gap-2 rounded-soft bg-white/60 px-6 py-10 text-center">
      <div className="text-4xl">{emoji}</div>
      <p className="text-base font-bold text-ink">{title}</p>
      {description && (
        <p className="max-w-xs text-sm text-muted">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
