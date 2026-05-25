import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface MetaItem {
  icon?: ReactNode;
  text: string;
}

interface ListRowProps {
  /** Emoji or node shown inside the rounded-square thumbnail */
  thumb: ReactNode;
  thumbClass?: string;
  title: ReactNode;
  badge?: ReactNode;
  description?: ReactNode;
  meta?: MetaItem[];
  trailing?: ReactNode;
  onClick?: () => void;
}

/** Somoim-style rich list row: rounded-square thumbnail + title + desc + meta. */
export function ListRow({
  thumb,
  thumbClass,
  title,
  badge,
  description,
  meta,
  trailing,
  onClick,
}: ListRowProps) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3.5 py-3 text-left',
        onClick && 'transition active:opacity-60',
      )}
    >
      <div
        className={cn(
          'flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gray-100 text-[28px]',
          thumbClass,
        )}
      >
        {thumb}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-[16px] font-bold text-ink">{title}</p>
          {badge}
        </div>
        {description && (
          <p className="mt-0.5 truncate text-[14px] text-gray-600">
            {description}
          </p>
        )}
        {meta && meta.length > 0 && (
          <div className="mt-1 flex items-center gap-1 text-[13px] text-muted">
            {meta.map((m, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span className="text-gray-300">·</span>}
                {m.icon}
                <span>{m.text}</span>
              </span>
            ))}
          </div>
        )}
      </div>
      {trailing}
    </Tag>
  );
}

export function NewBadge() {
  return (
    <span className="rounded-md bg-negative px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
      NEW
    </span>
  );
}

interface SectionHeaderProps {
  emoji?: string;
  title: string;
  onMore?: () => void;
}

export function SectionHeader({ emoji, title, onMore }: SectionHeaderProps) {
  return (
    <div className="mb-1 flex items-center justify-between px-1">
      <h2 className="flex items-center gap-1.5 text-[19px] font-bold tracking-tight text-ink">
        {emoji && <span>{emoji}</span>}
        {title}
      </h2>
      {onMore && (
        <button
          onClick={onMore}
          className="text-[14px] font-semibold text-muted transition active:opacity-60"
        >
          더보기
        </button>
      )}
    </div>
  );
}

export function MoreButton({ onClick, label = '더보기' }: { onClick?: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-soft bg-gray-100 py-3.5 text-[15px] font-bold text-gray-700 transition active:scale-[0.99]"
    >
      {label}
    </button>
  );
}

interface StatColumn {
  value: ReactNode;
  label: string;
}

export function StatRow({ stats }: { stats: StatColumn[] }) {
  return (
    <div className="flex items-stretch rounded-card bg-gray-100 py-4">
      {stats.map((s, i) => (
        <div
          key={i}
          className={cn(
            'flex flex-1 flex-col items-center justify-center gap-0.5',
            i > 0 && 'border-l border-line',
          )}
        >
          <span className="text-[20px] font-bold tracking-tight text-ink">
            {s.value}
          </span>
          <span className="text-[12px] font-medium text-muted">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

interface MenuRowProps {
  icon: ReactNode;
  label: string;
  trailing?: ReactNode;
  onClick?: () => void;
}

export function MenuRow({ icon, label, trailing, onClick }: MenuRowProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 py-3.5 text-left transition active:opacity-60"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700">
        {icon}
      </span>
      <span className="flex-1 text-[16px] font-semibold text-ink">{label}</span>
      {trailing ?? <ChevronRight size={20} className="text-gray-300" />}
    </button>
  );
}
