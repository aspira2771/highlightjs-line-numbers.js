import { useState, type FormEvent } from 'react';
import { Button } from '@/components/common/Button';
import { Input, Textarea } from '@/components/common/Input';
import { useRecordsStore } from '@/stores/recordsStore';
import type { TreatRecord } from '@/types';

interface Props {
  petId: string;
  editing?: TreatRecord | null;
  onClose?: () => void;
}

export function AddTreatForm({ petId, editing, onClose }: Props) {
  const addTreat = useRecordsStore((s) => s.addTreat);
  const updateTreat = useRecordsStore((s) => s.updateTreat);
  const [name, setName] = useState(editing?.name ?? '');
  const [amount, setAmount] = useState(editing?.amount ?? '');
  const [recordedAt, setRecordedAt] = useState(() =>
    (editing?.recordedAt ?? new Date().toISOString()).slice(0, 16),
  );
  const [note, setNote] = useState(editing?.note ?? '');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const fields = {
      name: name.trim() || undefined,
      amount: amount.trim() || undefined,
      recordedAt: new Date(recordedAt).toISOString(),
      note: note.trim() || undefined,
    };
    if (editing) updateTreat(editing.id, fields);
    else addTreat({ petId, ...fields });
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
        label="간식 이름"
        name="name"
        placeholder="츄르, 닭가슴살 등"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        label="양"
        name="amount"
        placeholder="1개, 5g 등"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <Textarea
        label="메모 (선택)"
        name="note"
        rows={2}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <Button type="submit" block>
        {editing ? '수정 저장' : '간식 기록'}
      </Button>
    </form>
  );
}
