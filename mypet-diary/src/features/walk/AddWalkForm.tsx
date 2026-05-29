import { useState, type FormEvent } from 'react';
import { Button } from '@/components/common/Button';
import { Input, Select, Textarea } from '@/components/common/Input';
import { useRecordsStore } from '@/stores/recordsStore';
import type { WalkRecord } from '@/types';

interface Props {
  petId: string;
  editing?: WalkRecord | null;
  onClose?: () => void;
}

function initialBowel(editing?: WalkRecord | null): 'yes' | 'no' | 'unknown' {
  if (editing?.hadBowelMovement === true) return 'yes';
  if (editing?.hadBowelMovement === false) return 'no';
  return 'unknown';
}

export function AddWalkForm({ petId, editing, onClose }: Props) {
  const addWalk = useRecordsStore((s) => s.addWalk);
  const updateWalk = useRecordsStore((s) => s.updateWalk);
  const [duration, setDuration] = useState(
    editing ? String(editing.durationMinutes) : '30',
  );
  const [startedAt, setStartedAt] = useState(() =>
    (editing?.startedAt ?? new Date().toISOString()).slice(0, 16),
  );
  const [bowel, setBowel] = useState<'yes' | 'no' | 'unknown'>(
    initialBowel(editing),
  );
  const [weather, setWeather] = useState(editing?.weather ?? '');
  const [note, setNote] = useState(editing?.note ?? '');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const minutes = Number(duration);
    if (!minutes || minutes <= 0) return;
    const fields = {
      startedAt: new Date(startedAt).toISOString(),
      durationMinutes: minutes,
      hadBowelMovement:
        bowel === 'yes' ? true : bowel === 'no' ? false : undefined,
      weather: weather.trim() || undefined,
      note: note.trim() || undefined,
    };
    if (editing) updateWalk(editing.id, fields);
    else addWalk({ petId, ...fields });
    onClose?.();
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <Input
        label="시작 시간"
        name="startedAt"
        type="datetime-local"
        value={startedAt}
        onChange={(e) => setStartedAt(e.target.value)}
      />
      <Input
        label="시간 (분)"
        name="duration"
        type="number"
        inputMode="numeric"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
      />
      <Select
        label="배변"
        name="bowel"
        value={bowel}
        onChange={(e) => setBowel(e.target.value as 'yes' | 'no' | 'unknown')}
        options={[
          { value: 'unknown', label: '모름' },
          { value: 'yes', label: '있음' },
          { value: 'no', label: '없음' },
        ]}
      />
      <Input
        label="날씨 (선택)"
        name="weather"
        placeholder="맑음"
        value={weather}
        onChange={(e) => setWeather(e.target.value)}
      />
      <Textarea
        label="메모 (선택)"
        name="note"
        rows={2}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <Button type="submit" block>
        {editing ? '수정 저장' : '산책 기록'}
      </Button>
    </form>
  );
}
