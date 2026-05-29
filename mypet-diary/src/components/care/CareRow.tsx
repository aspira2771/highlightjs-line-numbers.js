import { Check, Trash2 } from 'lucide-react';
import type { CareItem } from '@/types';
import { CARE_LABELS } from '@/utils/careLabels';
import { CARE_ICON_COMPONENTS } from '@/utils/careIcons';
import { formatKoreanTime } from '@/utils/date';
import { cn } from '@/utils/cn';

interface Props {
  item: CareItem;
  onToggle: (id: string) => void;
  onRemove?: (id: string) => void;
}

export function CareRow({ item, onToggle, onRemove }: Props) {
  const Icon = CARE_ICON_COMPONENTS[item.type];
  return (
    <li
      className={cn(
        'flex items-center gap-3 rounded-soft border border-transparent bg-white px-4 py-3 shadow-soft transition',
        item.completed && 'opacity-60',
      )}
    >
      <button
        onClick={() => onToggle(item.id)}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full border-2 transition active:scale-95',
          item.completed
            ? 'border-secondary-300 bg-secondary-300 text-white animate-pop'
            : 'border-primary-200 bg-white text-transparent',
        )}
        aria-label={item.completed ? '완료 취소' : '완료'}
      >
        <Check size={18} strokeWidth={3} />
      </button>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-soft bg-gray-100 text-gray-600">
            <Icon size={15} />
          </span>
          <p
            className={cn(
              'text-sm font-semibold text-ink',
              item.completed && 'line-through',
            )}
          >
            {item.title || CARE_LABELS[item.type]}
          </p>
        </div>
        <p className="ml-9 text-xs text-muted">
          {formatKoreanTime(item.scheduledAt)}
          {item.recurrence && ' · 반복'}
        </p>
      </div>
      {onRemove && (
        <button
          aria-label="삭제"
          onClick={() => onRemove(item.id)}
          className="rounded-full p-2 text-muted hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 size={16} />
        </button>
      )}
    </li>
  );
}
