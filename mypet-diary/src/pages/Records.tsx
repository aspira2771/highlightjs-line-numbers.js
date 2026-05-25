import { useState } from 'react';
import { MapPin, Plus, Route } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card, EmptyState } from '@/components/common/Card';
import { Modal } from '@/components/common/Modal';
import { PageHeader } from '@/components/common/PageHeader';
import { PetSwitcher } from '@/features/pet/PetSwitcher';
import { AddMealForm } from '@/features/meal/AddMealForm';
import { AddWeightForm } from '@/features/weight/AddWeightForm';
import { AddWalkForm } from '@/features/walk/AddWalkForm';
import { WalkTracker } from '@/features/walk/WalkTracker';
import { AddMedicationForm } from '@/features/medication/AddMedicationForm';
import { AddSupplementForm } from '@/features/supplement/AddSupplementForm';
import { WeightChart, weightAdvisory } from '@/components/charts/WeightChart';
import { WalkMap } from '@/components/walk/WalkMap';
import { usePetStore } from '@/stores/petStore';
import { useRecordsStore } from '@/stores/recordsStore';
import { formatKoreanDate, formatKoreanTime } from '@/utils/date';
import { formatDistance } from '@/utils/geo';
import type {
  GeoPoint,
  MealRecord,
  Medication,
  Supplement,
  WalkRecord,
  WeightRecord,
} from '@/types';

type Tab = 'weight' | 'meal' | 'walk' | 'medication' | 'supplement';

/** Which record (if any) the modal is currently editing, tagged by its tab. */
type EditTarget =
  | { tab: 'weight'; record: WeightRecord }
  | { tab: 'meal'; record: MealRecord }
  | { tab: 'walk'; record: WalkRecord }
  | { tab: 'medication'; record: Medication }
  | { tab: 'supplement'; record: Supplement };

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
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [tracking, setTracking] = useState(false);
  const [viewingPath, setViewingPath] = useState<GeoPoint[] | null>(null);

  const openEdit = (target: EditTarget) => {
    setEditTarget(target);
    setOpen(true);
  };
  const closeModal = () => {
    setOpen(false);
    setEditTarget(null);
  };

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

      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-pill px-4 py-1.5 text-sm font-semibold transition ${
              tab === t.id
                ? 'bg-primary text-white'
                : 'bg-white text-muted'
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
            <div className="mt-3 rounded-soft border border-primary-100 bg-primary-50 p-3 text-xs text-primary-500">
              {advisory}
            </div>
          )}
          <ul className="mt-4 space-y-2">
            {weights
              .slice()
              .reverse()
              .map((w) => (
                <li key={w.id} className="card flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{w.weight}kg</p>
                    <p className="text-xs text-muted">
                      {formatKoreanDate(w.recordedAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-3 text-xs">
                    <button
                      className="text-muted"
                      onClick={() => openEdit({ tab: 'weight', record: w })}
                    >
                      수정
                    </button>
                    <button
                      className="text-red-500"
                      onClick={() => records.removeWeight(w.id)}
                    >
                      삭제
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        </>
      )}

      {tab === 'meal' && (
        <ul className="space-y-2">
          {meals.length === 0 && (
            <EmptyState
              emoji="🍚"
              title="식사 기록이 없어요"
              description="아래 + 버튼으로 추가하세요."
            />
          )}
          {meals
            .slice()
            .reverse()
            .map((m) => (
              <li key={m.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">
                      {m.foodName ?? '식사'}
                      {m.amount && (
                        <span className="ml-2 text-xs text-muted">{m.amount}</span>
                      )}
                    </p>
                    <p className="text-xs text-muted">
                      {formatKoreanDate(m.recordedAt)} ·{' '}
                      {formatKoreanTime(m.recordedAt)}
                    </p>
                    {m.note && <p className="mt-1 text-sm">{m.note}</p>}
                  </div>
                  <div className="flex shrink-0 gap-3 text-xs">
                    <button
                      className="text-muted"
                      onClick={() => openEdit({ tab: 'meal', record: m })}
                    >
                      수정
                    </button>
                    <button
                      className="text-red-500"
                      onClick={() => records.removeMeal(m.id)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </li>
            ))}
        </ul>
      )}

      {tab === 'walk' && (
        <>
          <Button
            block
            className="mb-4"
            leftIcon={<MapPin size={18} />}
            onClick={() => setTracking(true)}
          >
            GPS 산책 시작
          </Button>
          <ul className="space-y-2">
            {walks.length === 0 && (
              <EmptyState
                emoji="🐾"
                title="산책 기록이 없어요"
                description="위 버튼으로 산책을 시작하거나 + 로 직접 기록하세요."
              />
            )}
            {walks
              .slice()
              .reverse()
              .map((w) => (
                <li key={w.id} className="card">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">
                        {w.durationMinutes}분
                        {typeof w.distanceMeters === 'number' &&
                          ` · ${formatDistance(w.distanceMeters)}`}
                      </p>
                      <p className="text-xs text-muted">
                        {formatKoreanDate(w.startedAt)} ·{' '}
                        {formatKoreanTime(w.startedAt)}
                        {w.weather && ` · ${w.weather}`}
                        {w.hadBowelMovement && ' · 배변 있음'}
                      </p>
                      {w.note && <p className="mt-1 text-sm">{w.note}</p>}
                      {w.path && w.path.length > 1 && (
                        <button
                          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary-500"
                          onClick={() => setViewingPath(w.path ?? null)}
                        >
                          <Route size={14} />
                          지도 보기
                        </button>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-3 text-xs">
                      <button
                        className="text-muted"
                        onClick={() => openEdit({ tab: 'walk', record: w })}
                      >
                        수정
                      </button>
                      <button
                        className="text-red-500"
                        onClick={() => records.removeWalk(w.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </>
      )}

      {tab === 'medication' && (
        <ul className="space-y-2">
          {medications.length === 0 && (
            <EmptyState
              emoji="💊"
              title="등록된 약이 없어요"
              description="복용 중인 약을 등록하세요."
            />
          )}
          {medications.map((m) => (
            <li key={m.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-xs text-muted">
                    {m.recurrence.pattern === 'daily'
                      ? `매일 ${m.recurrence.interval ?? 1}회`
                      : `매${m.recurrence.pattern === 'weekly' ? '주' : '월'} ${m.recurrence.interval ?? 1}회`}
                    {m.dosage && ` · ${m.dosage}`}
                  </p>
                  {m.purpose && (
                    <p className="mt-1 text-sm text-muted">{m.purpose}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-3 text-xs">
                  <button
                    className="text-muted"
                    onClick={() => openEdit({ tab: 'medication', record: m })}
                  >
                    수정
                  </button>
                  <button
                    className="text-red-500"
                    onClick={() => records.removeMedication(m.id)}
                  >
                    삭제
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {tab === 'supplement' && (
        <ul className="space-y-2">
          {supplements.length === 0 && (
            <EmptyState
              emoji="🧪"
              title="등록된 영양제가 없어요"
              description="꾸준히 챙기는 영양제를 등록해보세요."
            />
          )}
          {supplements.map((s) => (
            <li key={s.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-xs text-muted">
                    {s.recurrence.pattern === 'daily' ? '매일' : '주기'} · 잔량{' '}
                    {s.remainingCount ?? '-'}
                  </p>
                  {typeof s.remainingCount === 'number' &&
                    typeof s.alertThreshold === 'number' &&
                    s.remainingCount <= s.alertThreshold && (
                      <p className="mt-1 text-xs text-primary-500">
                        곧 떨어져요. 재구매를 확인해보세요.
                      </p>
                    )}
                </div>
                <div className="flex shrink-0 gap-3 text-xs">
                  <button
                    className="text-muted"
                    onClick={() => openEdit({ tab: 'supplement', record: s })}
                  >
                    수정
                  </button>
                  <button
                    className="text-red-500"
                    onClick={() => records.removeSupplement(s.id)}
                  >
                    삭제
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => {
          setEditTarget(null);
          setOpen(true);
        }}
        className="fixed bottom-24 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-card transition hover:scale-105"
        aria-label="기록 추가"
      >
        <Plus size={26} />
      </button>

      <Modal
        open={open}
        onClose={closeModal}
        title={`${TABS.find((t) => t.id === tab)?.label} 기록 ${
          editTarget ? '수정' : '추가'
        }`}
      >
        {tab === 'weight' && (
          <AddWeightForm
            key={editTarget?.record.id ?? 'new'}
            petId={petId}
            editing={editTarget?.tab === 'weight' ? editTarget.record : null}
            onClose={closeModal}
          />
        )}
        {tab === 'meal' && (
          <AddMealForm
            key={editTarget?.record.id ?? 'new'}
            petId={petId}
            editing={editTarget?.tab === 'meal' ? editTarget.record : null}
            onClose={closeModal}
          />
        )}
        {tab === 'walk' && (
          <AddWalkForm
            key={editTarget?.record.id ?? 'new'}
            petId={petId}
            editing={editTarget?.tab === 'walk' ? editTarget.record : null}
            onClose={closeModal}
          />
        )}
        {tab === 'medication' && (
          <AddMedicationForm
            key={editTarget?.record.id ?? 'new'}
            petId={petId}
            editing={
              editTarget?.tab === 'medication' ? editTarget.record : null
            }
            onClose={closeModal}
          />
        )}
        {tab === 'supplement' && (
          <AddSupplementForm
            key={editTarget?.record.id ?? 'new'}
            petId={petId}
            editing={
              editTarget?.tab === 'supplement' ? editTarget.record : null
            }
            onClose={closeModal}
          />
        )}
      </Modal>

      <Modal
        open={tracking}
        onClose={() => setTracking(false)}
        title="GPS 산책"
      >
        <WalkTracker petId={petId} onClose={() => setTracking(false)} />
      </Modal>

      <Modal
        open={viewingPath !== null}
        onClose={() => setViewingPath(null)}
        title="산책 경로"
      >
        {viewingPath && <WalkMap path={viewingPath} />}
      </Modal>
    </div>
  );
}
