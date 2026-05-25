import { useState, type FormEvent } from 'react';
import { Button } from '@/components/common/Button';
import { Select, Textarea } from '@/components/common/Input';
import { useRecordsStore } from '@/stores/recordsStore';
import type { SymptomKind, SymptomNote } from '@/types';

interface Props {
  petId: string;
  editing?: SymptomNote | null;
  onClose?: () => void;
}

export const SYMPTOM_LABELS: Record<SymptomKind, string> = {
  appetite: '식욕 변화',
  vomiting: '구토',
  diarrhea: '설사',
  lethargy: '무기력',
  scratching: '긁음',
  coughing: '기침',
  shedding: '탈피 이상',
  stool: '배변 이상',
};

const KINDS = Object.keys(SYMPTOM_LABELS) as SymptomKind[];

export function AddSymptomForm({ petId, editing, onClose }: Props) {
  const addSymptom = useRecordsStore((s) => s.addSymptom);
  const updateSymptom = useRecordsStore((s) => s.updateSymptom);
  const [kinds, setKinds] = useState<SymptomKind[]>(editing?.kinds ?? []);
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>(
    editing?.severity ?? 'mild',
  );
  const [recordedAt, setRecordedAt] = useState(() =>
    (editing?.recordedAt ?? new Date().toISOString()).slice(0, 16),
  );
  const [note, setNote] = useState(editing?.note ?? '');

  const toggleKind = (k: SymptomKind) =>
    setKinds((prev) =>
      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k],
    );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (kinds.length === 0) return;
    const fields = {
      kinds,
      severity,
      recordedAt: new Date(recordedAt).toISOString(),
      note: note.trim() || undefined,
    };
    if (editing) updateSymptom(editing.id, fields);
    else addSymptom({ petId, ...fields });
    onClose?.();
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <span className="mb-2 block text-sm font-medium text-ink">증상 (복수 선택)</span>
        <div className="flex flex-wrap gap-2">
          {KINDS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => toggleKind(k)}
              className={`rounded-pill border px-3 py-1.5 text-xs font-semibold transition ${
                kinds.includes(k)
                  ? 'border-primary bg-primary text-white'
                  : 'border-line bg-surface text-gray-700'
              }`}
            >
              {SYMPTOM_LABELS[k]}
            </button>
          ))}
        </div>
      </div>
      <Select
        label="정도"
        name="severity"
        value={severity}
        onChange={(e) =>
          setSeverity(e.target.value as 'mild' | 'moderate' | 'severe')
        }
        options={[
          { value: 'mild', label: '약함' },
          { value: 'moderate', label: '보통' },
          { value: 'severe', label: '심함' },
        ]}
      />
      <Textarea
        label="메모"
        name="note"
        rows={2}
        placeholder="언제부터, 어떤 상황에서 등"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <p className="rounded-soft bg-gray-100 p-2 text-[11px] text-muted">
        이 기록은 관찰 메모예요. 진단이 아니며, 증상이 지속되면 동물병원에 문의하는 것이 좋아요.
      </p>
      <Button type="submit" block>
        {editing ? '수정 저장' : '증상 기록'}
      </Button>
    </form>
  );
}
