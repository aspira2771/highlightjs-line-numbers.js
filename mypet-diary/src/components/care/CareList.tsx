import { Sprout } from 'lucide-react';
import type { CareItem, CareItemType } from '@/types';
import { CareRow } from './CareRow';
import { EmptyState } from '@/components/common/Card';

const URGENT_TYPES: CareItemType[] = ['medication', 'vaccine', 'hospital'];
const ENV_TYPES: CareItemType[] = [
  'humidity',
  'temperature',
  'uvb_lamp',
  'cage_cleaning',
];
const ROUTINE_TYPES: CareItemType[] = ['meal', 'walk', 'supplement', 'treat'];

function bucket(items: CareItem[]) {
  return {
    urgent: items.filter((item) => URGENT_TYPES.includes(item.type)),
    routine: items.filter((item) => ROUTINE_TYPES.includes(item.type)),
    record: items.filter(
      (item) => item.type === 'weight' || item.type === 'shedding',
    ),
    env: items.filter((item) => ENV_TYPES.includes(item.type)),
  };
}

interface Props {
  items: CareItem[];
  onToggle: (id: string) => void;
  onRemove?: (id: string) => void;
}

export function CareList({ items, onToggle, onRemove }: Props) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Sprout size={26} />}
        title="오늘 등록된 케어가 없어요"
        description="마이펫 탭에서 일정을 추가해보세요."
      />
    );
  }

  const groups = bucket(items);
  const sections: Array<{ key: keyof typeof groups; label: string }> = [
    { key: 'urgent', label: '긴급' },
    { key: 'routine', label: '일상' },
    { key: 'record', label: '기록' },
    { key: 'env', label: '환경' },
  ];

  return (
    <div className="space-y-5">
      {sections.map(({ key, label }) =>
        groups[key].length > 0 ? (
          <section key={key}>
            <h4 className="mb-2 text-xs font-bold text-muted">{label}</h4>
            <ul className="space-y-2">
              {groups[key].map((item) => (
                <CareRow
                  key={item.id}
                  item={item}
                  onToggle={onToggle}
                  onRemove={onRemove}
                />
              ))}
            </ul>
          </section>
        ) : null,
      )}
    </div>
  );
}
