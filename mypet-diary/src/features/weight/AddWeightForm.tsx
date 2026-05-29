import { useState, type FormEvent } from 'react';
import { Button } from '@/components/common/Button';
import { Input, Textarea } from '@/components/common/Input';
import { useRecordsStore } from '@/stores/recordsStore';
import { toISODateTime } from '@/utils/date';
import type { WeightRecord } from '@/types';

interface Props {
  petId: string;
  editing?: WeightRecord | null;
  onClose?: () => void;
}

export function AddWeightForm({ petId, editing, onClose }: Props) {
  const addWeight = useRecordsStore((s) => s.addWeight);
  const updateWeight = useRecordsStore((s) => s.updateWeight);
  const [weight, setWeight] = useState(
    editing ? String(editing.weight) : '',
  );
  const [date, setDate] = useState(() =>
    (editing?.recordedAt ?? new Date().toISOString()).slice(0, 10),
  );
  const [note, setNote] = useState(editing?.note ?? '');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const value = Number(weight);
    if (!value || value <= 0) return;
    const fields = {
      weight: value,
      recordedAt: new Date(`${date}T12:00:00`).toISOString() || toISODateTime(),
      note: note.trim() || undefined,
    };
    if (editing) updateWeight(editing.id, fields);
    else addWeight({ petId, ...fields });
    onClose?.();
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <Input
        label="체중 (kg)"
        name="weight"
        type="number"
        step="0.01"
        inputMode="decimal"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        placeholder="4.2"
      />
      <Input
        label="측정일"
        name="date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <Textarea
        label="메모 (선택)"
        name="note"
        rows={2}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <Button type="submit" block>
        {editing ? '수정 저장' : '기록하기'}
      </Button>
    </form>
  );
}
