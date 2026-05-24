import { useState, type FormEvent } from 'react';
import { Button } from '@/components/common/Button';
import { Input, Textarea } from '@/components/common/Input';
import { useRecordsStore } from '@/stores/recordsStore';
import { toISODateTime } from '@/utils/date';

interface Props {
  petId: string;
  onClose?: () => void;
}

export function AddWeightForm({ petId, onClose }: Props) {
  const addWeight = useRecordsStore((s) => s.addWeight);
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const value = Number(weight);
    if (!value || value <= 0) return;
    addWeight({
      petId,
      weight: value,
      recordedAt: new Date(`${date}T12:00:00`).toISOString() || toISODateTime(),
      note: note.trim() || undefined,
    });
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
        기록하기
      </Button>
    </form>
  );
}
