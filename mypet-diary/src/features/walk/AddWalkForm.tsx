import { useState, type FormEvent } from 'react';
import { Button } from '@/components/common/Button';
import { Input, Select, Textarea } from '@/components/common/Input';
import { useRecordsStore } from '@/stores/recordsStore';

interface Props {
  petId: string;
  onClose?: () => void;
}

export function AddWalkForm({ petId, onClose }: Props) {
  const addWalk = useRecordsStore((s) => s.addWalk);
  const [duration, setDuration] = useState('30');
  const [startedAt, setStartedAt] = useState(
    () => new Date().toISOString().slice(0, 16),
  );
  const [bowel, setBowel] = useState<'yes' | 'no' | 'unknown'>('unknown');
  const [weather, setWeather] = useState('');
  const [note, setNote] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const minutes = Number(duration);
    if (!minutes || minutes <= 0) return;
    addWalk({
      petId,
      startedAt: new Date(startedAt).toISOString(),
      durationMinutes: minutes,
      hadBowelMovement:
        bowel === 'yes' ? true : bowel === 'no' ? false : undefined,
      weather: weather.trim() || undefined,
      note: note.trim() || undefined,
    });
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
        산책 기록
      </Button>
    </form>
  );
}
