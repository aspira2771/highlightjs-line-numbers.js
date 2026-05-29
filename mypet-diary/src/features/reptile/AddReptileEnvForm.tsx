import { useState, type FormEvent } from 'react';
import { Button } from '@/components/common/Button';
import { Input, Select, Textarea } from '@/components/common/Input';
import { useRecordsStore } from '@/stores/recordsStore';
import type { ReptileEnvironment } from '@/types';

interface Props {
  petId: string;
  editing?: ReptileEnvironment | null;
  onClose?: () => void;
}

type Shedding = 'normal' | 'abnormal' | 'in_progress';

export function AddReptileEnvForm({ petId, editing, onClose }: Props) {
  const addReptileEnv = useRecordsStore((s) => s.addReptileEnv);
  const updateReptileEnv = useRecordsStore((s) => s.updateReptileEnv);
  const [humidity, setHumidity] = useState(
    editing?.humidity != null ? String(editing.humidity) : '',
  );
  const [temperature, setTemperature] = useState(
    editing?.temperature != null ? String(editing.temperature) : '',
  );
  const [sheddingStatus, setSheddingStatus] = useState<Shedding | ''>(
    editing?.sheddingStatus ?? '',
  );
  const [recordedAt, setRecordedAt] = useState(() =>
    (editing?.recordedAt ?? new Date().toISOString()).slice(0, 16),
  );
  const [note, setNote] = useState(editing?.note ?? '');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const fields = {
      humidity: humidity ? Number(humidity) : undefined,
      temperature: temperature ? Number(temperature) : undefined,
      sheddingStatus: sheddingStatus || undefined,
      recordedAt: new Date(recordedAt).toISOString(),
      note: note.trim() || undefined,
    };
    if (editing) updateReptileEnv(editing.id, fields);
    else addReptileEnv({ petId, ...fields });
    onClose?.();
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <Input
        label="기록 시간"
        name="recordedAt"
        type="datetime-local"
        value={recordedAt}
        onChange={(e) => setRecordedAt(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="습도 (%)"
          name="humidity"
          type="number"
          inputMode="decimal"
          value={humidity}
          onChange={(e) => setHumidity(e.target.value)}
          placeholder="60"
        />
        <Input
          label="온도 (℃)"
          name="temperature"
          type="number"
          inputMode="decimal"
          value={temperature}
          onChange={(e) => setTemperature(e.target.value)}
          placeholder="28"
        />
      </div>
      <Select
        label="탈피 상태"
        name="sheddingStatus"
        value={sheddingStatus}
        onChange={(e) => setSheddingStatus(e.target.value as Shedding | '')}
        options={[
          { value: '', label: '선택 안 함' },
          { value: 'normal', label: '정상' },
          { value: 'in_progress', label: '진행 중' },
          { value: 'abnormal', label: '이상 있음' },
        ]}
      />
      <Textarea
        label="메모 (선택)"
        name="note"
        rows={2}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <Button type="submit" block>
        {editing ? '수정 저장' : '환경 기록'}
      </Button>
    </form>
  );
}
