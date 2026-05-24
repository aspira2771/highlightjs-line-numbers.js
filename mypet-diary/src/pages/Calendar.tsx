import { useMemo, useState } from 'react';
import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  isSameDay,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card, EmptyState } from '@/components/common/Card';
import { Modal } from '@/components/common/Modal';
import { PageHeader } from '@/components/common/PageHeader';
import { PetSwitcher } from '@/features/pet/PetSwitcher';
import { AddHospitalForm } from '@/features/hospital/AddHospitalForm';
import { usePetStore } from '@/stores/petStore';
import { useCareStore } from '@/stores/careStore';
import { useRecordsStore } from '@/stores/recordsStore';
import { CARE_ICONS, CARE_LABELS } from '@/utils/careLabels';
import { cn } from '@/utils/cn';

function buildMonthGrid(anchor: Date): Date[] {
  const start = startOfWeek(startOfMonth(anchor), { weekStartsOn: 0 });
  const days: Date[] = [];
  for (let i = 0; i < 42; i += 1) {
    days.push(addDays(start, i));
  }
  return days;
}

export function CalendarPage() {
  const activePet = usePetStore((s) =>
    s.pets.find((p) => p.id === s.activePetId),
  );
  const careItems = useCareStore((s) => s.items);
  const hospitals = useRecordsStore((s) => s.hospitals);
  const medications = useRecordsStore((s) => s.medications);

  const [anchor, setAnchor] = useState(new Date());
  const [selected, setSelected] = useState(new Date());
  const [open, setOpen] = useState(false);

  if (!activePet) {
    return (
      <div className="page">
        <PageHeader title="캘린더" />
        <EmptyState
          emoji="📅"
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
    return { careOnDay, hospitalOnDay };
  };

  const { careOnDay, hospitalOnDay } = eventsForDay(selected);

  return (
    <div className="page">
      <PageHeader title="캘린더" subtitle={`${activePet.name}의 일정`} />
      <PetSwitcher />

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={() => setAnchor((d) => subMonths(d, 1))}
            className="rounded-full p-1.5 text-muted transition hover:bg-panel"
            aria-label="이전 달"
          >
            <ChevronLeft size={18} />
          </button>
          <h3 className="font-serif text-[17px] tracking-tightest text-ink">
            {monthLabel}
          </h3>
          <button
            onClick={() => setAnchor((d) => addMonths(d, 1))}
            className="rounded-full p-1.5 text-muted transition hover:bg-panel"
            aria-label="다음 달"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase tracking-wide text-muted">
          {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const inMonth =
              day >= startOfMonth(anchor) && day <= endOfMonth(anchor);
            const isSelected = isSameDay(day, selected);
            const { careOnDay: cs, hospitalOnDay: hs } = eventsForDay(day);
            const hasEvent = cs.length > 0 || hs.length > 0;
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelected(day)}
                className={cn(
                  'relative aspect-square rounded-soft text-[13px] transition',
                  inMonth ? 'text-ink' : 'text-muted/40',
                  isSelected && 'bg-primary text-white font-medium',
                  !isSelected && hasEvent && 'bg-panel font-medium',
                  !isSelected && !hasEvent && 'hover:bg-panel/60',
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
            emoji="🌤️"
            title="이날은 일정이 없어요"
            description="여유로운 하루를 보내세요."
          />
        ) : (
          <ul className="space-y-2">
            {careOnDay.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <span className="text-xl">{CARE_ICONS[item.type]}</span>
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
            ))}
            {hospitalOnDay.map((h) => (
              <li key={h.id} className="flex items-center gap-3">
                <span className="text-xl">🏥</span>
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

      <Card className="mt-4" title="병원 리포트">
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
                <li key={h.id} className="rounded-soft border border-line bg-panel/50 p-3.5">
                  <p className="text-[13px] font-medium text-ink">
                    {format(parseISO(h.visitDate), 'yyyy-MM-dd')} ·{' '}
                    {h.hospitalName}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted">{h.purpose}</p>
                  {h.diagnosis && (
                    <p className="mt-1.5 text-[12px] text-ink-soft">
                      소견: {h.diagnosis}
                    </p>
                  )}
                </li>
              ))}
          </ul>
        )}
      </Card>

      <p className="mt-5 text-center text-[11px] text-muted">
        진단·처방은 동물병원에서 확인해야 해요.
      </p>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="병원 방문 기록"
      >
        {medications.length > 0 && (
          <p className="rounded-soft border border-line bg-panel/60 p-2.5 text-[11px] text-muted">
            현재 복용 중인 약: {medications.map((m) => m.name).join(', ')}
          </p>
        )}
        <AddHospitalForm petId={activePet.id} onClose={() => setOpen(false)} />
      </Modal>
    </div>
  );
}
