import { useState, type FormEvent } from 'react';
import { Button } from '@/components/common/Button';
import { Input, Select } from '@/components/common/Input';
import { CARE_LABELS } from '@/utils/careLabels';
import type {
  CareItem,
  CareItemType,
  Recurrence,
} from '@/types';
import { toISODateTime } from '@/utils/date';

interface Props {
  petId: string;
  defaultTypes?: CareItemType[];
  onAdd: (input: Omit<CareItem, 'id' | 'completed'>) => void;
  onClose?: () => void;
}

const ALL_TYPES = Object.entries(CARE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export function AddCareForm({ petId, defaultTypes, onAdd, onClose }: Props) {
  const options = defaultTypes
    ? ALL_TYPES.filter((opt) =>
        defaultTypes.includes(opt.value as CareItemType),
      )
    : ALL_TYPES;
  const [type, setType] = useState<CareItemType>(
    (options[0]?.value as CareItemType) ?? 'meal',
  );
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('09:00');
  const [recurring, setRecurring] = useState<Recurrence['pattern'] | 'none'>(
    'none',
  );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const scheduledAt = new Date(`${date}T${time}:00`);
    const recurrence: Recurrence | undefined =
      recurring === 'none'
        ? undefined
        : { pattern: recurring, interval: 1 };
    onAdd({
      petId,
      type,
      title: title.trim() || CARE_LABELS[type],
      scheduledAt: isNaN(scheduledAt.getTime())
        ? toISODateTime()
        : scheduledAt.toISOString(),
      recurrence,
    });
    onClose?.();
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <Select
        label="종류"
        name="type"
        value={type}
        onChange={(e) => setType(e.target.value as CareItemType)}
        options={options}
      />
      <Input
        label="제목 (선택)"
        name="title"
        placeholder={`기본값: ${CARE_LABELS[type]}`}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="날짜"
          name="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Input
          label="시간"
          name="time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </div>
      <Select
        label="반복"
        name="recurring"
        value={recurring}
        onChange={(e) =>
          setRecurring(e.target.value as Recurrence['pattern'] | 'none')
        }
        options={[
          { value: 'none', label: '반복 안 함' },
          { value: 'daily', label: '매일' },
          { value: 'weekly', label: '매주' },
          { value: 'monthly', label: '매월' },
        ]}
      />
      <Button type="submit" block>
        추가하기
      </Button>
    </form>
  );
}
