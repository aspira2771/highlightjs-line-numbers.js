import { useState, type FormEvent } from 'react';
import { Button } from '@/components/common/Button';
import { Input, Select, Textarea } from '@/components/common/Input';
import { useRecordsStore } from '@/stores/recordsStore';
import type { Recurrence } from '@/types';

interface Props {
  petId: string;
  onClose?: () => void;
}

export function AddMedicationForm({ petId, onClose }: Props) {
  const addMedication = useRecordsStore((s) => s.addMedication);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [startDate, setStartDate] = useState(
    () => new Date().toISOString().slice(0, 10),
  );
  const [endDate, setEndDate] = useState('');
  const [pattern, setPattern] = useState<Recurrence['pattern']>('daily');
  const [interval, setInterval] = useState('1');
  const [purpose, setPurpose] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addMedication({
      petId,
      name: name.trim(),
      dosage: dosage.trim() || undefined,
      startDate: new Date(`${startDate}T08:00:00`).toISOString(),
      endDate: endDate
        ? new Date(`${endDate}T08:00:00`).toISOString()
        : undefined,
      recurrence: {
        pattern,
        interval: Math.max(1, Number(interval) || 1),
      },
      purpose: purpose.trim() || undefined,
    });
    onClose?.();
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <Input
        label="약 이름"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="심장사상충 예방약"
      />
      <Input
        label="용량"
        name="dosage"
        placeholder="1정, 1ml 등"
        value={dosage}
        onChange={(e) => setDosage(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="시작일"
          name="startDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <Input
          label="종료일 (선택)"
          name="endDate"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
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
            { value: 'custom', label: '커스텀' },
          ]}
        />
        <Input
          label="간격"
          name="interval"
          type="number"
          inputMode="numeric"
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
          hint={`${interval}${pattern === 'daily' ? '일' : pattern === 'weekly' ? '주' : '회'}마다`}
        />
      </div>
      <Textarea
        label="치료 목적"
        name="purpose"
        rows={2}
        value={purpose}
        onChange={(e) => setPurpose(e.target.value)}
      />
      <Button type="submit" block>
        약 등록
      </Button>
    </form>
  );
}
