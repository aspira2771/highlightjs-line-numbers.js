import type { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: Props) {
  return (
    <header className="mb-7 flex items-start justify-between gap-3">
      <div>
        <h1 className="hero-title">{title}</h1>
        {subtitle && (
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </header>
  );
}
