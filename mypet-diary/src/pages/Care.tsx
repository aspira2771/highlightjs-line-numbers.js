import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/Card';
import { PetSwitcher } from '@/features/pet/PetSwitcher';
import { CalendarView } from '@/pages/Calendar';
import { RecordsView } from '@/pages/Records';
import { usePetStore } from '@/stores/petStore';
import { cn } from '@/utils/cn';

type View = 'calendar' | 'records';

const SEGMENTS: Array<{ id: View; label: string }> = [
  { id: 'calendar', label: '캘린더' },
  { id: 'records', label: '기록' },
];

export function CarePage() {
  const activePet = usePetStore((s) =>
    s.pets.find((p) => p.id === s.activePetId),
  );
  const [view, setView] = useState<View>('calendar');

  if (!activePet) {
    return (
      <div className="page">
        <PageHeader title="케어" />
        <EmptyState
          emoji="🗓️"
          title="등록된 반려동물이 없어요"
          description="마이페이지에서 먼저 등록해주세요."
        />
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader title="케어" subtitle={`${activePet.name}의 일정과 기록`} />
      <PetSwitcher />

      <div className="mb-5 grid grid-cols-2 gap-1 rounded-pill bg-gray-100 p-1">
        {SEGMENTS.map((s) => (
          <button
            key={s.id}
            onClick={() => setView(s.id)}
            className={cn(
              'rounded-pill py-2 text-[14px] font-bold transition',
              view === s.id ? 'bg-surface text-ink shadow-soft' : 'text-gray-500',
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {view === 'calendar' ? (
        <CalendarView activePet={activePet} />
      ) : (
        <RecordsView activePet={activePet} />
      )}
    </div>
  );
}
