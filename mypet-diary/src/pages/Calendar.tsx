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
import { AddHospitalForm } from '@/features/hospital/AddHospitalForm';
import { useCareStore } from '@/stores/careStore';
import { useRecordsStore } from '@/stores/recordsStore';
import { CARE_ICONS, CARE_LABELS, CARE_TINT } from '@/utils/careLabels';
import { ListRow } from '@/components/common/ListRow';
import { cn } from '@/utils/cn';
import type { Pet } from '@/types';

function buildMonthGrid(anchor: Date): Date[] {
  const start = startOfWeek(startOfMonth(anchor), { weekStartsOn: 0 });
  const days: Date[] = [];
  for (let i = 0; i < 42; i += 1) {
    days.push(addDays(start, i));
  }
  return days;
}

export function CalendarView({ activePet }: { activePet: Pet }) {
  const careItems = useCareStore((s) => s.items);
  const hospitals = useRecordsStore((s) => s.hospitals);
  const medications = useRecordsStore((s) => s.medications);

  const [anchor, setAnchor] = useState(new Date());
  const [selected, setSelected] = useState(new Date());
  const [open, setOpen] = useState(false);

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
    <div className="space-y-4">
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={() => setAnchor((d) => subMonths(d, 1))}
            className="rounded-full p-1.5 text-muted transition hover:bg-gray-100"
            aria-label="이전 달"
          >
            <ChevronLeft size={18} />
          </button>
          <h3 className="text-[17px] font-bold tracking-tight text-ink">
            {monthLabel}
          </h3>
          <button
            onClick={() => setAnchor((d) => addMonths(d, 1))}
            className="rounded-full p-1.5 text-muted transition hover:bg-gray-100"
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
                  !isSelected && hasEvent && 'bg-gray-100 font-medium',
                  !isSelected && !hasEvent && 'hover:bg-gray-100',
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
          <div className="divide-y divide-line">
            {careOnDay.map((item) => (
              <ListRow
                key={item.id}
                thumb={CARE_ICONS[item.type]}
                thumbClass={CARE_TINT[item.type]}
                title={item.title || CARE_LABELS[item.type]}
                description={`${format(parseISO(item.scheduledAt), 'HH:mm')}${item.completed ? ' · 완료' : ''}`}
                trailing={
                  item.completed ? (
                    <span className="shrink-0 rounded-full bg-primary-50 px-2.5 py-1 text-[12px] font-bold text-primary">
                      완료
                    </span>
                  ) : undefined
                }
              />
            ))}
            {hospitalOnDay.map((h) => (
              <ListRow
                key={h.id}
                thumb="🏥"
                thumbClass="bg-[#FFE6E9]"
                title={h.hospitalName}
                description={`${h.purpose}${h.hospitalContact ? ` · ${h.hospitalContact}` : ''}`}
              />
            ))}
          </div>
        )}
      </Card>

      <Card title="병원 리포트">
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
                <li key={h.id} className="rounded-soft border border-line bg-gray-50 p-3.5">
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
          <p className="rounded-soft border border-line bg-gray-100 p-2.5 text-[11px] text-muted">
            현재 복용 중인 약: {medications.map((m) => m.name).join(', ')}
          </p>
        )}
        <AddHospitalForm petId={activePet.id} onClose={() => setOpen(false)} />
      </Modal>
    </div>
  );
}
