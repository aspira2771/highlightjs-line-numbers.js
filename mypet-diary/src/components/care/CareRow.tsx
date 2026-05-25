import { Check, Trash2 } from 'lucide-react';
import type { CareItem } from '@/types';
import { CARE_ICONS, CARE_LABELS, CARE_TINT } from '@/utils/careLabels';
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
        'group flex items-center gap-3.5 py-2.5 transition',
        item.completed && 'opacity-45',
      )}
    >
      <span
        className={cn(
          'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-[26px]',
          CARE_TINT[item.type],
        )}
      >
        {CARE_ICONS[item.type]}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate text-[16px] font-bold text-ink',
            item.completed && 'line-through',
          )}
        >
          {item.title || CARE_LABELS[item.type]}
        </p>
        <p className="mt-0.5 text-[14px] text-muted">
          {formatKoreanTime(item.scheduledAt)}
          {item.recurrence && ' · 반복'}
        </p>
      </div>
      {onRemove && (
        <button
          aria-label="삭제"
          onClick={() => onRemove(item.id)}
          className="rounded-full p-2 text-gray-300 opacity-0 transition group-hover:opacity-100 hover:bg-negative/10 hover:text-negative"
        >
          <Trash2 size={16} />
        </button>
      )}
      <button
        onClick={() => onToggle(item.id)}
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition active:scale-90',
          item.completed
            ? 'bg-primary text-white animate-pop'
            : 'border-2 border-gray-200 bg-surface text-transparent hover:border-primary-300',
        )}
        aria-label={item.completed ? '완료 취소' : '완료'}
      >
        <Check size={17} strokeWidth={3} />
      </button>
    </li>
  );
}
