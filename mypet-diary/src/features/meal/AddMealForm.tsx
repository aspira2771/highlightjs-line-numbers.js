import { useState, type FormEvent } from 'react';
import { Button } from '@/components/common/Button';
import { Input, Textarea } from '@/components/common/Input';
import { useRecordsStore } from '@/stores/recordsStore';
import type { MealRecord } from '@/types';

interface Props {
  petId: string;
  editing?: MealRecord | null;
  onClose?: () => void;
}

export function AddMealForm({ petId, editing, onClose }: Props) {
  const addMeal = useRecordsStore((s) => s.addMeal);
  const updateMeal = useRecordsStore((s) => s.updateMeal);
  const [foodName, setFoodName] = useState(editing?.foodName ?? '');
  const [amount, setAmount] = useState(editing?.amount ?? '');
  const [recordedAt, setRecordedAt] = useState(() =>
    (editing?.recordedAt ?? new Date().toISOString()).slice(0, 16),
  );
  const [note, setNote] = useState(editing?.note ?? '');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const fields = {
      foodName: foodName.trim() || undefined,
      amount: amount.trim() || undefined,
      recordedAt: new Date(recordedAt).toISOString(),
      note: note.trim() || undefined,
    };
    if (editing) updateMeal(editing.id, fields);
    else addMeal({ petId, ...fields });
    onClose?.();
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <Input
        label="시간"
        name="recordedAt"
        type="datetime-local"
        value={recordedAt}
        onChange={(e) => setRecordedAt(e.target.value)}
      />
      <Input
        label="사료/음식"
        name="foodName"
        placeholder="로얄캐닌"
        value={foodName}
        onChange={(e) => setFoodName(e.target.value)}
      />
      <Input
        label="급여량"
        name="amount"
        placeholder="40g, 한 컵 등"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <Textarea
        label="메모"
        name="note"
        rows={2}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <Button type="submit" block>
        {editing ? '수정 저장' : '식사 기록'}
      </Button>
    </form>
  );
}
