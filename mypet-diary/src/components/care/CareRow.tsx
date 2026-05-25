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
        'group flex items-center gap-3 rounded-soft bg-surface px-4 py-3 transition',
        item.completed && 'opacity-55',
      )}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-lg">
        {CARE_ICONS[item.type]}
      </span>
      <div className="flex-1">
        <p
          className={cn(
            'text-[15px] font-semibold text-ink',
            item.completed && 'line-through',
          )}
        >
          {item.title || CARE_LABELS[item.type]}
        </p>
        <p className="text-[13px] text-muted">
          {formatKoreanTime(item.scheduledAt)}
          {item.recurrence && ' · 반복'}
        </p>
      </div>
      {onRemove && (
        <button
          aria-label="삭제"
          onClick={() => onRemove(item.id)}
          className="mr-1 rounded-full p-2 text-gray-300 opacity-0 transition group-hover:opacity-100 hover:bg-negative/10 hover:text-negative"
        >
          <Trash2 size={16} />
        </button>
      )}
      <button
        onClick={() => onToggle(item.id)}
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-full transition active:scale-90',
          item.completed
            ? 'bg-primary text-white animate-pop'
            : 'bg-gray-100 text-gray-300 hover:bg-gray-200',
        )}
        aria-label={item.completed ? '완료 취소' : '완료'}
      >
        <Check size={16} strokeWidth={3} />
      </button>
    </li>
  );
}
