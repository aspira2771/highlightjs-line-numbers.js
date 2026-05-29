import { useMemo, useState } from 'react';
import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  endOfMonth,
  format,
  isSameDay,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Stethoscope,
  Sun,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card, EmptyState } from '@/components/common/Card';
import { Modal } from '@/components/common/Modal';
import { PageHeader } from '@/components/common/PageHeader';
import { PetSwitcher } from '@/features/pet/PetSwitcher';
import { AddHospitalForm } from '@/features/hospital/AddHospitalForm';
import { usePetStore } from '@/stores/petStore';
import { useCareStore } from '@/stores/careStore';
import { useRecordsStore } from '@/stores/recordsStore';
import { SYMPTOM_LABELS } from '@/features/symptom/AddSymptomForm';
import { PhotoAlbum } from '@/features/memory/PhotoAlbum';
import { CARE_LABELS } from '@/utils/careLabels';
import { CARE_ICON_COMPONENTS } from '@/utils/careIcons';
import { cn } from '@/utils/cn';

function buildMonthGrid(anchor: Date): Date[] {
  const start = startOfWeek(startOfMonth(anchor), { weekStartsOn: 0 });
  const days: Date[] = [];
  for (let i = 0; i < 42; i += 1) {
    days.push(addDays(start, i));
  }
  return days;
}

export function CalendarPage({ embedded }: { embedded?: boolean }) {
  const activePet = usePetStore((s) =>
    s.pets.find((p) => p.id === s.activePetId),
  );
  const careItems = useCareStore((s) => s.items);
  const records = useRecordsStore();
  const hospitals = records.hospitals;
  const medications = records.medications;

  const [anchor, setAnchor] = useState(new Date());
  const [selected, setSelected] = useState(new Date());
  const [open, setOpen] = useState(false);

  if (!activePet) {
    if (embedded) return null;
    return (
      <div className="page">
        <PageHeader title="캘린더" />
        <EmptyState
          icon={<CalendarDays size={26} />}
          title="등록된 반려동물이 없어요"
          description="마이펫 탭에서 먼저 등록해주세요."
        />
      </div>
    );
  }

  const days = useMemo(() => buildMonthGrid(anchor), [anchor]);
  const monthLabel = format(anchor, 'yyyy년 M월');

  const eventsForDay = (date: Date) => {
    const careOnDay = careItems.filter(
      (item) =>
        item.petId === activePet.id &&
        isSameDay(parseISO(item.scheduledAt), date),
    );
    const hospitalOnDay = hospitals.filter(
      (h) =>
        h.petId === activePet.id &&
        (isSameDay(parseISO(h.visitDate), date) ||
          (h.nextVisitDate && isSameDay(parseISO(h.nextVisitDate), date))),
    );
    const photosOnDay = records.photos.filter(
      (p) => p.petId === activePet.id && isSameDay(parseISO(p.takenAt), date),
    );
    return { careOnDay, hospitalOnDay, photosOnDay };
  };

  const { careOnDay, hospitalOnDay } = eventsForDay(selected);

  // ── Vet report summary (recent vitals/symptoms) ──
  const petWeights = records.weights
    .filter((w) => w.petId === activePet.id)
    .slice()
    .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
  const latestWeight = petWeights[petWeights.length - 1];
  const prevWeight = petWeights[petWeights.length - 2];
  const weightDelta =
    latestWeight && prevWeight
      ? +(latestWeight.weight - prevWeight.weight).toFixed(2)
      : null;
  const recentSymptoms = records.symptoms.filter(
    (s) =>
      s.petId === activePet.id &&
      differenceInCalendarDays(new Date(), parseISO(s.recordedAt)) <= 14,
  );
  const activeMeds = medications.filter(
    (m) =>
      m.petId === activePet.id &&
      (!m.endDate || parseISO(m.endDate) >= new Date()),
  );

  // ── This month's care summary ──
  const inThisMonth = (iso: string) => {
    const d = parseISO(iso);
    return d >= startOfMonth(anchor) && d <= endOfMonth(anchor);
  };
  const monthCare = careItems.filter(
    (c) => c.petId === activePet.id && inThisMonth(c.scheduledAt),
  );
  const monthDone = monthCare.filter((c) => c.completed).length;
  const completionRate =
    monthCare.length > 0 ? Math.round((monthDone / monthCare.length) * 100) : 0;
  const monthWalks = records.walks.filter(
    (w) => w.petId === activePet.id && inThisMonth(w.startedAt),
  ).length;
  const monthTreats = records.treats.filter(
    (t) => t.petId === activePet.id && inThisMonth(t.recordedAt),
  ).length;

  const content = (
    <>
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={() => setAnchor((d) => subMonths(d, 1))}
            className="rounded-full p-1 text-muted hover:bg-primary-50"
            aria-label="이전 달"
          >
            <ChevronLeft size={20} />
          </button>
          <h3 className="text-base font-bold">{monthLabel}</h3>
          <button
            onClick={() => setAnchor((d) => addMonths(d, 1))}
            className="rounded-full p-1 text-muted hover:bg-primary-50"
            aria-label="다음 달"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-muted">
          {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const inMonth =
              day >= startOfMonth(anchor) && day <= endOfMonth(anchor);
            const isSelected = isSameDay(day, selected);
            const {
              careOnDay: cs,
              hospitalOnDay: hs,
              photosOnDay: ps,
            } = eventsForDay(day);
            const hasEvent = cs.length > 0 || hs.length > 0 || ps.length > 0;
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelected(day)}
                className={cn(
                  'relative aspect-square rounded-soft text-xs',
                  inMonth ? 'text-ink' : 'text-muted/50',
                  isSelected && 'bg-primary text-white',
                  !isSelected && hasEvent && 'bg-primary-50',
                )}
              >
                <span>{day.getDate()}</span>
                {hasEvent && (
                  <span
                    className={cn(
                      'absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full',
                      isSelected ? 'bg-white' : 'bg-primary',
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </Card>

      <Card
        className="mt-4"
        title={format(selected, 'M월 d일') + ' 일정'}
        action={
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Plus size={16} />}
            onClick={() => setOpen(true)}
          >
            병원 방문
          </Button>
        }
      >
        {careOnDay.length === 0 && hospitalOnDay.length === 0 ? (
          <EmptyState
            icon={<Sun size={26} />}
            title="이날은 일정이 없어요"
            description="여유로운 하루를 보내세요."
          />
        ) : (
          <ul className="space-y-2">
            {careOnDay.map((item) => {
              const Icon = CARE_ICON_COMPONENTS[item.type];
              return (
              <li key={item.id} className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-soft bg-gray-100 text-gray-600">
                  <Icon size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold">
                    {item.title || CARE_LABELS[item.type]}
                  </p>
                  <p className="text-xs text-muted">
                    {format(parseISO(item.scheduledAt), 'HH:mm')}
                    {item.completed && ' · 완료'}
                  </p>
                </div>
              </li>
              );
            })}
            {hospitalOnDay.map((h) => (
              <li key={h.id} className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-soft bg-gray-100 text-gray-600">
                  <Stethoscope size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold">{h.hospitalName}</p>
                  <p className="text-xs text-muted">
                    {h.purpose}
                    {h.hospitalContact && ` · ${h.hospitalContact}`}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="mt-4" title={`${monthLabel} 케어 요약`}>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-soft bg-gray-100 p-3 text-center">
            <p className="text-xs text-muted">케어 완료율</p>
            <p className="text-xl font-bold text-primary">{completionRate}%</p>
            <p className="text-[11px] text-muted">
              {monthDone}/{monthCare.length}
            </p>
          </div>
          <div className="rounded-soft bg-gray-100 p-3 text-center">
            <p className="text-xs text-muted">산책</p>
            <p className="text-xl font-bold">{monthWalks}회</p>
          </div>
          <div className="rounded-soft bg-gray-100 p-3 text-center">
            <p className="text-xs text-muted">간식</p>
            <p className="text-xl font-bold">{monthTreats}회</p>
          </div>
          <div className="rounded-soft bg-gray-100 p-3 text-center">
            <p className="text-xs text-muted">현재 체중</p>
            <p className="text-xl font-bold">
              {latestWeight ? `${latestWeight.weight}kg` : '-'}
            </p>
            {weightDelta !== null && weightDelta !== 0 && (
              <p className="text-[11px] text-muted">
                {weightDelta > 0 ? '+' : ''}
                {weightDelta}kg
              </p>
            )}
          </div>
        </div>
      </Card>

      <PhotoAlbum petId={activePet.id} date={selected} />

      <Card className="mt-4" title="병원 리포트">
        {/* Recent vitals/symptoms summary for vet visits. */}
        <div className="mb-3 space-y-1.5 rounded-soft bg-primary-50 p-3 text-xs">
          <p>
            <span className="text-muted">최근 체중: </span>
            {latestWeight
              ? `${latestWeight.weight}kg${
                  weightDelta !== null && weightDelta !== 0
                    ? ` (${weightDelta > 0 ? '+' : ''}${weightDelta}kg)`
                    : ''
                }`
              : '기록 없음'}
          </p>
          <p>
            <span className="text-muted">복용 중인 약: </span>
            {activeMeds.length > 0
              ? activeMeds.map((m) => m.name).join(', ')
              : '없음'}
          </p>
          <p>
            <span className="text-muted">최근 2주 증상: </span>
            {recentSymptoms.length > 0
              ? Array.from(
                  new Set(
                    recentSymptoms.flatMap((s) =>
                      s.kinds.map((k) => SYMPTOM_LABELS[k]),
                    ),
                  ),
                ).join(', ')
              : '없음'}
          </p>
        </div>
        {hospitals.filter((h) => h.petId === activePet.id).length === 0 ? (
          <p className="text-sm text-muted">
            아직 진료 기록이 없어요. 방문 후 기록해두면 다음 진료에 도움이 돼요.
          </p>
        ) : (
          <ul className="space-y-3">
            {hospitals
              .filter((h) => h.petId === activePet.id)
              .slice(-3)
              .reverse()
              .map((h) => (
                <li key={h.id} className="rounded-soft bg-primary-50 p-3">
                  <p className="text-sm font-semibold">
                    {format(parseISO(h.visitDate), 'yyyy-MM-dd')} ·{' '}
                    {h.hospitalName}
                  </p>
                  <p className="text-xs text-muted">{h.purpose}</p>
                  {h.diagnosis && (
                    <p className="mt-1 text-xs">소견: {h.diagnosis}</p>
                  )}
                </li>
              ))}
          </ul>
        )}
      </Card>

      <p className="mt-4 text-center text-[11px] text-muted">
        ※ 진단·처방은 동물병원에서 확인해야 해요.
      </p>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="병원 방문 기록"
      >
        {medications.length > 0 && (
          <p className="rounded-soft bg-primary-50 p-2 text-[11px] text-muted">
            현재 복용 중인 약: {medications.map((m) => m.name).join(', ')}
          </p>
        )}
        <AddHospitalForm petId={activePet.id} onClose={() => setOpen(false)} />
      </Modal>
    </>
  );

  if (embedded) return content;
  return (
    <div className="page">
      <PageHeader title="캘린더" subtitle={`${activePet.name}의 일정`} />
      <PetSwitcher />
      {content}
    </div>
  );
}
