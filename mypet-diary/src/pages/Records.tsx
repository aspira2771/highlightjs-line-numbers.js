import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card, EmptyState } from '@/components/common/Card';
import { Modal } from '@/components/common/Modal';
import { PageHeader } from '@/components/common/PageHeader';
import { PetSwitcher } from '@/features/pet/PetSwitcher';
import { AddMealForm } from '@/features/meal/AddMealForm';
import { AddWeightForm } from '@/features/weight/AddWeightForm';
import { AddWalkForm } from '@/features/walk/AddWalkForm';
import { AddMedicationForm } from '@/features/medication/AddMedicationForm';
import { AddSupplementForm } from '@/features/supplement/AddSupplementForm';
import { WeightChart, weightAdvisory } from '@/components/charts/WeightChart';
import { ListRow } from '@/components/common/ListRow';
import { usePetStore } from '@/stores/petStore';
import { useRecordsStore } from '@/stores/recordsStore';
import { formatKoreanDate, formatKoreanTime } from '@/utils/date';

function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="shrink-0 rounded-full bg-gray-100 px-3 py-1.5 text-[13px] font-semibold text-gray-500 transition active:scale-95 hover:text-negative"
      onClick={onClick}
    >
      삭제
    </button>
  );
}

type Tab = 'weight' | 'meal' | 'walk' | 'medication' | 'supplement';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'weight', label: '체중' },
  { id: 'meal', label: '식사' },
  { id: 'walk', label: '산책' },
  { id: 'medication', label: '약' },
  { id: 'supplement', label: '영양제' },
];

export function RecordsPage() {
  const activePet = usePetStore((s) =>
    s.pets.find((p) => p.id === s.activePetId),
  );
  const records = useRecordsStore();
  const [tab, setTab] = useState<Tab>('weight');
  const [open, setOpen] = useState(false);

  if (!activePet) {
    return (
      <div className="page">
        <PageHeader title="기록" />
        <EmptyState
          emoji="📓"
          title="등록된 반려동물이 없어요"
          description="마이펫 탭에서 먼저 등록해주세요."
        />
      </div>
    );
  }

  const petId = activePet.id;
  const weights = records.weights.filter((r) => r.petId === petId);
  const meals = records.meals.filter((r) => r.petId === petId);
  const walks = records.walks.filter((r) => r.petId === petId);
  const medications = records.medications.filter((r) => r.petId === petId);
  const supplements = records.supplements.filter((r) => r.petId === petId);
  const advisory = weightAdvisory(weights);

  return (
    <div className="page">
      <PageHeader title="기록" subtitle={`${activePet.name}의 건강 기록`} />
      <PetSwitcher />

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-pill px-4 py-2 text-[14px] font-bold transition ${
              tab === t.id
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'weight' && (
        <>
          <Card title="체중 변화">
            <WeightChart records={weights} />
          </Card>
          {advisory && (
            <div className="mt-3 rounded-card bg-primary-50 p-4 text-[13px] font-medium leading-relaxed text-primary-600">
              {advisory}
            </div>
          )}
          {weights.length > 0 && (
            <div className="mt-3 card divide-y divide-line py-1">
              {weights
                .slice()
                .reverse()
                .map((w) => (
                  <ListRow
                    key={w.id}
                    thumb="⚖️"
                    thumbClass="bg-[#EAF0FF]"
                    title={`${w.weight}kg`}
                    description={formatKoreanDate(w.recordedAt)}
                    trailing={<DeleteButton onClick={() => records.removeWeight(w.id)} />}
                  />
                ))}
            </div>
          )}
        </>
      )}

      {tab === 'meal' && (
        meals.length === 0 ? (
          <EmptyState emoji="🍚" title="식사 기록이 없어요" description="아래 + 버튼으로 추가하세요." />
        ) : (
          <div className="card divide-y divide-line py-1">
            {meals
              .slice()
              .reverse()
              .map((m) => (
                <ListRow
                  key={m.id}
                  thumb="🍚"
                  thumbClass="bg-[#FFF1E0]"
                  title={m.foodName ?? '식사'}
                  description={`${formatKoreanDate(m.recordedAt)} · ${formatKoreanTime(m.recordedAt)}${m.amount ? ` · ${m.amount}` : ''}`}
                  trailing={<DeleteButton onClick={() => records.removeMeal(m.id)} />}
                />
              ))}
          </div>
        )
      )}

      {tab === 'walk' && (
        walks.length === 0 ? (
          <EmptyState emoji="🐾" title="산책 기록이 없어요" description="첫 산책 기록을 남겨보세요." />
        ) : (
          <div className="card divide-y divide-line py-1">
            {walks
              .slice()
              .reverse()
              .map((w) => (
                <ListRow
                  key={w.id}
                  thumb="🐾"
                  thumbClass="bg-[#E7F6EC]"
                  title={`${w.durationMinutes}분 산책`}
                  description={`${formatKoreanDate(w.startedAt)} · ${formatKoreanTime(w.startedAt)}${w.weather ? ` · ${w.weather}` : ''}${w.hadBowelMovement ? ' · 배변' : ''}`}
                  trailing={<DeleteButton onClick={() => records.removeWalk(w.id)} />}
                />
              ))}
          </div>
        )
      )}

      {tab === 'medication' && (
        medications.length === 0 ? (
          <EmptyState emoji="💊" title="등록된 약이 없어요" description="복용 중인 약을 등록하세요." />
        ) : (
          <div className="card divide-y divide-line py-1">
            {medications.map((m) => (
              <ListRow
                key={m.id}
                thumb="💊"
                thumbClass="bg-[#FFE6E9]"
                title={m.name}
                description={`${
                  m.recurrence.pattern === 'daily'
                    ? `매일 ${m.recurrence.interval ?? 1}회`
                    : `매${m.recurrence.pattern === 'weekly' ? '주' : '월'} ${m.recurrence.interval ?? 1}회`
                }${m.dosage ? ` · ${m.dosage}` : ''}${m.purpose ? ` · ${m.purpose}` : ''}`}
                trailing={<DeleteButton onClick={() => records.removeMedication(m.id)} />}
              />
            ))}
          </div>
        )
      )}

      {tab === 'supplement' && (
        supplements.length === 0 ? (
          <EmptyState emoji="🧪" title="등록된 영양제가 없어요" description="꾸준히 챙기는 영양제를 등록해보세요." />
        ) : (
          <div className="card divide-y divide-line py-1">
            {supplements.map((s) => {
              const low =
                typeof s.remainingCount === 'number' &&
                typeof s.alertThreshold === 'number' &&
                s.remainingCount <= s.alertThreshold;
              return (
                <ListRow
                  key={s.id}
                  thumb="🧪"
                  thumbClass="bg-[#E9F0FF]"
                  title={s.name}
                  description={`${s.recurrence.pattern === 'daily' ? '매일' : '주기적'} · 잔량 ${s.remainingCount ?? '-'}${low ? ' · 곧 떨어져요' : ''}`}
                  trailing={<DeleteButton onClick={() => records.removeSupplement(s.id)} />}
                />
              );
            })}
          </div>
        )
      )}

      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-5 z-20 flex items-center justify-center rounded-full bg-primary text-white shadow-float transition hover:bg-primary-500 active:scale-95"
        style={{ height: '56px', width: '56px' }}
        aria-label="기록 추가"
      >
        <Plus size={24} strokeWidth={2.4} />
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`${TABS.find((t) => t.id === tab)?.label} 기록 추가`}
      >
        {tab === 'weight' && (
          <AddWeightForm petId={petId} onClose={() => setOpen(false)} />
        )}
        {tab === 'meal' && (
          <AddMealForm petId={petId} onClose={() => setOpen(false)} />
        )}
        {tab === 'walk' && (
          <AddWalkForm petId={petId} onClose={() => setOpen(false)} />
        )}
        {tab === 'medication' && (
          <AddMedicationForm petId={petId} onClose={() => setOpen(false)} />
        )}
        {tab === 'supplement' && (
          <AddSupplementForm petId={petId} onClose={() => setOpen(false)} />
        )}
      </Modal>
    </div>
  );
}
