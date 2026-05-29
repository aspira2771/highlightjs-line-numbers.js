import { useState } from 'react';
import { Notebook } from 'lucide-react';
import { EmptyState } from '@/components/common/Card';
import { PageHeader } from '@/components/common/PageHeader';
import { PetSwitcher } from '@/features/pet/PetSwitcher';
import { usePetStore } from '@/stores/petStore';
import { RecordsPage } from './Records';
import { CalendarPage } from './Calendar';

type View = 'records' | 'calendar';

/** Merged 기록 + 캘린더 tab with a segmented toggle. */
export function DiaryPage() {
  const activePet = usePetStore((s) =>
    s.pets.find((p) => p.id === s.activePetId),
  );
  const [view, setView] = useState<View>('records');

  if (!activePet) {
    return (
      <div className="page">
        <PageHeader title="기록" />
        <EmptyState
          icon={<Notebook size={26} />}
          title="등록된 반려동물이 없어요"
          description="마이펫 탭에서 먼저 등록해주세요."
        />
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader title="기록" subtitle={`${activePet.name}의 다이어리`} />
      <PetSwitcher />

      <div className="mb-4 grid grid-cols-2 gap-1 rounded-pill bg-gray-100 p-1">
        {(['records', 'calendar'] as View[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`rounded-pill py-2 text-sm font-bold transition ${
              view === v ? 'bg-surface text-ink shadow-soft' : 'text-muted'
            }`}
          >
            {v === 'records' ? '기록' : '캘린더'}
          </button>
        ))}
      </div>

      {view === 'records' ? (
        <RecordsPage embedded />
      ) : (
        <CalendarPage embedded />
      )}
    </div>
  );
}
