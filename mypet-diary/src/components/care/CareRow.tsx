import { Check, Trash2 } from 'lucide-react';
import type { CareItem } from '@/types';
import { CARE_ICONS, CARE_LABELS } from '@/utils/careLabels';
import { formatKoreanTime } from '@/utils/date';
import { cn } from '@/utils/cn';

interface Props {
  item: CareItem;
  onToggle: (id: string) => void;
  onRemove?: (id: string) => void;
}

export function CareRow({ item, onToggle, onRemove }: Props) {
  return (
    <li
      className={cn(
        'group flex items-center gap-3 rounded-soft border border-line bg-surface px-4 py-3 transition hover:border-primary-200',
        item.completed && 'opacity-60',
      )}
    >
      <button
        onClick={() => onToggle(item.id)}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full border transition active:scale-95',
          item.completed
            ? 'border-primary bg-primary text-white animate-pop'
            : 'border-line bg-surface text-transparent hover:border-primary-300',
        )}
        aria-label={item.completed ? '완료 취소' : '완료'}
      >
        <Check size={16} strokeWidth={3} />
      </button>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-base opacity-80" aria-hidden>
            {CARE_ICONS[item.type]}
          </span>
          <p
            className={cn(
              'text-[14px] font-medium text-ink',
              item.completed && 'line-through',
            )}
          >
            {item.title || CARE_LABELS[item.type]}
          </p>
        </div>
        <p className="ml-7 text-[11px] text-muted">
          {formatKoreanTime(item.scheduledAt)}
          {item.recurrence && ' · 반복'}
        </p>
      </div>
      {onRemove && (
        <button
          aria-label="삭제"
          onClick={() => onRemove(item.id)}
          className="rounded-full p-2 text-muted opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 size={14} />
        </button>
      )}
    </li>
  );
}
