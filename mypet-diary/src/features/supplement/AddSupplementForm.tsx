import { useState, type FormEvent } from 'react';
import { Button } from '@/components/common/Button';
import { Input, Select } from '@/components/common/Input';
import { useRecordsStore } from '@/stores/recordsStore';
import type { Recurrence } from '@/types';

interface Props {
  petId: string;
  onClose?: () => void;
}

export function AddSupplementForm({ petId, onClose }: Props) {
  const addSupplement = useRecordsStore((s) => s.addSupplement);
  const [name, setName] = useState('');
  const [pattern, setPattern] = useState<Recurrence['pattern']>('daily');
  const [interval, setInterval] = useState('1');
  const [remaining, setRemaining] = useState('');
  const [threshold, setThreshold] = useState('5');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addSupplement({
      petId,
      name: name.trim(),
      recurrence: { pattern, interval: Math.max(1, Number(interval) || 1) },
      remainingCount: remaining ? Number(remaining) : undefined,
      alertThreshold: threshold ? Number(threshold) : undefined,
    });
    onClose?.();
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <Input
        label="영양제 이름"
        name="name"
        placeholder="오메가-3"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="반복"
          name="pattern"
          value={pattern}
          onChange={(e) => setPattern(e.target.value as Recurrence['pattern'])}
          options={[
            { value: 'daily', label: '매일' },
            { value: 'weekly', label: '매주' },
            { value: 'monthly', label: '매월' },
          ]}
        />
        <Input
          label="간격"
          name="interval"
          type="number"
          inputMode="numeric"
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="잔량"
          name="remaining"
          type="number"
          inputMode="numeric"
          value={remaining}
          onChange={(e) => setRemaining(e.target.value)}
          placeholder="30"
        />
        <Input
          label="재구매 알림"
          name="threshold"
          type="number"
          inputMode="numeric"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          hint="잔량 이하 시"
        />
      </div>
      <Button type="submit" block>
        영양제 등록
      </Button>
    </form>
  );
}
