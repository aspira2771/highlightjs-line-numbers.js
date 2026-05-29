import { useState } from 'react';
import {
  Cookie,
  FlaskConical,
  Notebook,
  Pill,
  Plus,
  Stethoscope,
  Turtle,
  UtensilsCrossed,
} from 'lucide-react';
import { Card, EmptyState } from '@/components/common/Card';
import { Modal } from '@/components/common/Modal';
import { PageHeader } from '@/components/common/PageHeader';
import { PetSwitcher } from '@/features/pet/PetSwitcher';
import { AddMealForm } from '@/features/meal/AddMealForm';
import { AddWeightForm } from '@/features/weight/AddWeightForm';
import { AddMedicationForm } from '@/features/medication/AddMedicationForm';
import { AddSupplementForm } from '@/features/supplement/AddSupplementForm';
import { AddTreatForm } from '@/features/treat/AddTreatForm';
import {
  AddSymptomForm,
  SYMPTOM_LABELS,
} from '@/features/symptom/AddSymptomForm';
import { AddReptileEnvForm } from '@/features/reptile/AddReptileEnvForm';
import { WeightChart, weightAdvisory } from '@/components/charts/WeightChart';
import { usePetStore } from '@/stores/petStore';
import { useRecordsStore } from '@/stores/recordsStore';
import { formatKoreanDate, formatKoreanTime, isToday } from '@/utils/date';
import type {
  MealRecord,
  Medication,
  ReptileEnvironment,
  Supplement,
  SymptomNote,
  TreatRecord,
  WeightRecord,
} from '@/types';

type Tab =
  | 'weight'
  | 'meal'
  | 'treat'
  | 'medication'
  | 'supplement'
  | 'symptom'
  | 'reptileEnv';

/** Which record (if any) the modal is currently editing, tagged by its tab. */
type EditTarget =
  | { tab: 'weight'; record: WeightRecord }
  | { tab: 'meal'; record: MealRecord }
  | { tab: 'treat'; record: TreatRecord }
  | { tab: 'medication'; record: Medication }
  | { tab: 'supplement'; record: Supplement }
  | { tab: 'symptom'; record: SymptomNote }
  | { tab: 'reptileEnv'; record: ReptileEnvironment };

const SHEDDING_LABELS: Record<string, string> = {
  normal: '정상',
  in_progress: '진행 중',
  abnormal: '이상 있음',
};

interface Props {
  /** When embedded inside the Diary page, skip the page chrome/header. */
  embedded?: boolean;
}

export function RecordsPage({ embedded }: Props) {
  const activePet = usePetStore((s) =>
    s.pets.find((p) => p.id === s.activePetId),
  );
  const records = useRecordsStore();
  const [tab, setTab] = useState<Tab>('weight');
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);

  const openEdit = (target: EditTarget) => {
    setEditTarget(target);
    setOpen(true);
  };
  const closeModal = () => {
    setOpen(false);
    setEditTarget(null);
  };

  if (!activePet) {
    if (embedded) return null;
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

  const petId = activePet.id;
  const weights = records.weights.filter((r) => r.petId === petId);
  const meals = records.meals.filter((r) => r.petId === petId);
  const medications = records.medications.filter((r) => r.petId === petId);
  const supplements = records.supplements.filter((r) => r.petId === petId);
  const symptoms = records.symptoms.filter((r) => r.petId === petId);
  const treats = records.treats.filter((r) => r.petId === petId);
  const reptileEnvs = records.reptileEnvs.filter((r) => r.petId === petId);
  const advisory = weightAdvisory(weights);
  const treatsToday = treats.filter((t) => isToday(t.recordedAt)).length;

  const TABS: Array<{ id: Tab; label: string }> = [
    { id: 'weight', label: '체중' },
    { id: 'meal', label: '식사' },
    { id: 'treat', label: '간식' },
    { id: 'medication', label: '약' },
    { id: 'supplement', label: '영양제' },
    { id: 'symptom', label: '증상' },
    ...(activePet.species === 'reptile'
      ? [{ id: 'reptileEnv' as const, label: '환경' }]
      : []),
  ];

  const body = (
    <>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-pill px-4 py-1.5 text-sm font-semibold transition ${
              tab === t.id ? 'bg-primary text-white' : 'bg-white text-muted'
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
              icon={<UtensilsCrossed size={26} />}
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

      {tab === 'medication' && (
        <ul className="space-y-2">
          {medications.length === 0 && (
            <EmptyState
              icon={<Pill size={26} />}
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
              icon={<FlaskConical size={26} />}
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

      {tab === 'treat' && (
        <ul className="space-y-2">
          {treatsToday >= 3 && (
            <li className="rounded-soft border border-primary-100 bg-primary-50 p-3 text-xs text-primary-500">
              오늘 간식을 {treatsToday}번 줬어요. 과다 급여는 아닌지 확인해보세요.
            </li>
          )}
          {treats.length === 0 && (
            <EmptyState
              icon={<Cookie size={26} />}
              title="간식 기록이 없어요"
              description="간식도 기록하면 과다 급여를 막을 수 있어요."
            />
          )}
          {treats
            .slice()
            .reverse()
            .map((t) => (
              <li key={t.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">
                      {t.name ?? '간식'}
                      {t.amount && (
                        <span className="ml-2 text-xs text-muted">{t.amount}</span>
                      )}
                    </p>
                    <p className="text-xs text-muted">
                      {formatKoreanDate(t.recordedAt)} ·{' '}
                      {formatKoreanTime(t.recordedAt)}
                    </p>
                    {t.note && <p className="mt-1 text-sm">{t.note}</p>}
                  </div>
                  <div className="flex shrink-0 gap-3 text-xs">
                    <button
                      className="text-muted"
                      onClick={() => openEdit({ tab: 'treat', record: t })}
                    >
                      수정
                    </button>
                    <button
                      className="text-red-500"
                      onClick={() => records.removeTreat(t.id)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </li>
            ))}
        </ul>
      )}

      {tab === 'symptom' && (
        <ul className="space-y-2">
          {symptoms.length === 0 && (
            <EmptyState
              icon={<Stethoscope size={26} />}
              title="증상 기록이 없어요"
              description="이상이 보이면 기록해두면 병원 방문 때 도움이 돼요."
            />
          )}
          {symptoms
            .slice()
            .reverse()
            .map((s) => (
              <li key={s.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">
                      {s.kinds.map((k) => SYMPTOM_LABELS[k]).join(', ')}
                      <span className="ml-2 text-xs text-muted">
                        {s.severity === 'severe'
                          ? '심함'
                          : s.severity === 'moderate'
                          ? '보통'
                          : '약함'}
                      </span>
                    </p>
                    <p className="text-xs text-muted">
                      {formatKoreanDate(s.recordedAt)} ·{' '}
                      {formatKoreanTime(s.recordedAt)}
                    </p>
                    {s.note && <p className="mt-1 text-sm">{s.note}</p>}
                  </div>
                  <div className="flex shrink-0 gap-3 text-xs">
                    <button
                      className="text-muted"
                      onClick={() => openEdit({ tab: 'symptom', record: s })}
                    >
                      수정
                    </button>
                    <button
                      className="text-red-500"
                      onClick={() => records.removeSymptom(s.id)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </li>
            ))}
        </ul>
      )}

      {tab === 'reptileEnv' && (
        <ul className="space-y-2">
          {reptileEnvs.length === 0 && (
            <EmptyState
              icon={<Turtle size={26} />}
              title="환경 기록이 없어요"
              description="습도·온도·탈피 상태를 기록해 관리해요."
            />
          )}
          {reptileEnvs
            .slice()
            .reverse()
            .map((r) => (
              <li key={r.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">
                      {typeof r.humidity === 'number' && `습도 ${r.humidity}%`}
                      {typeof r.humidity === 'number' &&
                        typeof r.temperature === 'number' &&
                        ' · '}
                      {typeof r.temperature === 'number' &&
                        `온도 ${r.temperature}℃`}
                    </p>
                    <p className="text-xs text-muted">
                      {formatKoreanDate(r.recordedAt)} ·{' '}
                      {formatKoreanTime(r.recordedAt)}
                      {r.sheddingStatus &&
                        ` · 탈피 ${SHEDDING_LABELS[r.sheddingStatus]}`}
                    </p>
                    {r.note && <p className="mt-1 text-sm">{r.note}</p>}
                  </div>
                  <div className="flex shrink-0 gap-3 text-xs">
                    <button
                      className="text-muted"
                      onClick={() => openEdit({ tab: 'reptileEnv', record: r })}
                    >
                      수정
                    </button>
                    <button
                      className="text-red-500"
                      onClick={() => records.removeReptileEnv(r.id)}
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
        {tab === 'treat' && (
          <AddTreatForm
            key={editTarget?.record.id ?? 'new'}
            petId={petId}
            editing={editTarget?.tab === 'treat' ? editTarget.record : null}
            onClose={closeModal}
          />
        )}
        {tab === 'symptom' && (
          <AddSymptomForm
            key={editTarget?.record.id ?? 'new'}
            petId={petId}
            editing={editTarget?.tab === 'symptom' ? editTarget.record : null}
            onClose={closeModal}
          />
        )}
        {tab === 'reptileEnv' && (
          <AddReptileEnvForm
            key={editTarget?.record.id ?? 'new'}
            petId={petId}
            editing={
              editTarget?.tab === 'reptileEnv' ? editTarget.record : null
            }
            onClose={closeModal}
          />
        )}
      </Modal>
    </>
  );

  if (embedded) return body;

  return (
    <div className="page">
      <PageHeader title="기록" subtitle={`${activePet.name}의 건강 기록`} />
      <PetSwitcher />
      {body}
    </div>
  );
}
