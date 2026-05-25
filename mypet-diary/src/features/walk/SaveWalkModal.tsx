import { useState, type FormEvent } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Select, Textarea } from '@/components/common/Input';
import { useRecordsStore } from '@/stores/recordsStore';
import { formatDuration, type WalkSummary } from '@/hooks/useWalkTracker';

interface Props {
  petId: string;
  summary: WalkSummary | null;
  onClose: () => void;
  onSaved: () => void;
}

export function SaveWalkModal({ petId, summary, onClose, onSaved }: Props) {
  const addWalk = useRecordsStore((s) => s.addWalk);
  const [bowel, setBowel] = useState<'yes' | 'no' | 'unknown'>('unknown');
  const [note, setNote] = useState('');

  if (!summary) return null;

  const minutes = Math.max(1, Math.round(summary.durationSec / 60));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    addWalk({
      petId,
      startedAt: summary.startedAt,
      durationMinutes: minutes,
      distanceKm: Number(summary.distanceKm.toFixed(2)),
      route: summary.route,
      hadBowelMovement:
        bowel === 'yes' ? true : bowel === 'no' ? false : undefined,
      note: note.trim() || undefined,
    });
    onSaved();
  };

  return (
    <Modal open onClose={onClose} title="산책 기록 저장">
      <div className="flex items-stretch rounded-card bg-gray-100 py-4">
        <div className="flex flex-1 flex-col items-center gap-0.5">
          <span className="text-[22px] font-bold tracking-tight text-ink">
            {formatDuration(summary.durationSec)}
          </span>
          <span className="text-[12px] font-medium text-muted">시간</span>
        </div>
        <div className="flex flex-1 flex-col items-center gap-0.5 border-l border-line">
          <span className="text-[22px] font-bold tracking-tight text-ink">
            {summary.distanceKm.toFixed(2)}km
          </span>
          <span className="text-[12px] font-medium text-muted">거리</span>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4">
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
        <Textarea
          label="메모 (선택)"
          name="note"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="오늘 산책은 어땠나요?"
        />
        <Button type="submit" block size="lg">
          저장하기
        </Button>
      </form>
    </Modal>
  );
}
