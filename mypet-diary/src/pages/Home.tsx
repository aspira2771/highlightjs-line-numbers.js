import { useMemo, useState } from 'react';
import { isSameDay, parseISO } from 'date-fns';
import { Plus, BellRing } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Card, EmptyState } from '@/components/common/Card';
import { StatRow } from '@/components/common/ListRow';
import { Modal } from '@/components/common/Modal';
import { Character } from '@/components/character/Character';
import { CareList } from '@/components/care/CareList';
import { AddCareForm } from '@/features/care/AddCareForm';
import { PetSwitcher } from '@/features/pet/PetSwitcher';
import { usePetStore } from '@/stores/petStore';
import { useCareStore } from '@/stores/careStore';
import { usePointsStore } from '@/stores/pointsStore';
import { useNotification } from '@/hooks/useNotification';
import type { CharacterMood } from '@/types';

export function HomePage() {
  const navigate = useNavigate();
  const pets = usePetStore((s) => s.pets);
  const activePetId = usePetStore((s) => s.activePetId);
  const activePet = pets.find((p) => p.id === activePetId) ?? null;

  // Subscribe to the raw items array (stable ref) and derive today's items
  // with useMemo — returning a fresh array from the selector itself would
  // make Zustand re-render every tick (React error #185 infinite loop).
  const items = useCareStore((s) => s.items);
  const todayItems = useMemo(() => {
    if (!activePet) return [];
    const now = new Date();
    return items.filter(
      (i) => i.petId === activePet.id && isSameDay(parseISO(i.scheduledAt), now),
    );
  }, [items, activePet]);
  const toggle = useCareStore((s) => s.toggle);
  const remove = useCareStore((s) => s.remove);
  const addItem = useCareStore((s) => s.addItem);

  const award = usePointsStore((s) => s.award);
  const markStreak = usePointsStore((s) => s.markStreak);
  const transactions = usePointsStore((s) => s.transactions);
  const totalPoints = useMemo(
    () => transactions.reduce((sum, tx) => sum + tx.amount, 0),
    [transactions],
  );
  const streak = usePointsStore((s) =>
    activePet ? s.streaks[activePet.id] : undefined,
  );

  const { permission, request } = useNotification();

  const [addOpen, setAddOpen] = useState(false);

  if (!activePet) {
    return (
      <div className="page">
        <EmptyState
          emoji="🐾"
          title="아직 등록된 반려동물이 없어요"
          description="마이펫 탭에서 첫 친구를 만나러 가요!"
          action={
            <Button onClick={() => navigate('/mypet')}>반려동물 등록</Button>
          }
        />
      </div>
    );
  }

  const completed = todayItems.filter((i) => i.completed).length;
  const total = todayItems.length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
  const mood: CharacterMood =
    total === 0
      ? 'calm'
      : completed === total
      ? 'happy'
      : completed > 0
      ? 'calm'
      : 'sad';
  const message =
    total === 0
      ? '오늘 케어를 등록해볼까요?'
      : completed === total
      ? '오늘 케어를 다 마쳤어요!'
      : `오늘 ${total - completed}개 남았어요`;

  const handleToggle = (id: string) => {
    const item = todayItems.find((i) => i.id === id);
    toggle(id);
    if (item && !item.completed) {
      award(10, `${activePet.name} ${item.type} 완료`);
      markStreak(activePet.id);
    }
  };

  return (
    <div className="page">
      <PetSwitcher />

      {/* Hero card */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-4">
          <Character
            photoUrl={activePet.photoUrl}
            characterUrl={activePet.characterUrl}
            species={activePet.species}
            template={activePet.characterTemplate}
            mood={mood}
            size="md"
          />
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-muted">
              {activePet.name}
            </p>
            <p className="mt-0.5 text-[21px] font-bold leading-snug tracking-tight text-ink">
              {message}
            </p>
          </div>
        </div>
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-[13px]">
            <span className="font-semibold text-gray-600">오늘의 케어</span>
            <span className="font-bold text-primary">
              {completed}
              <span className="text-gray-400">/{total}</span>
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-pill bg-gray-100">
            <div
              className="h-full rounded-pill bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="my-3">
        <StatRow
          stats={[
            { value: `${streak?.currentDays ?? 0}일`, label: '연속 케어' },
            { value: `${streak?.bestDays ?? 0}일`, label: '최고 기록' },
            { value: `${totalPoints}P`, label: '포인트' },
          ]}
        />
      </div>

      {permission !== 'granted' && permission !== 'unsupported' && (
        <button
          onClick={request}
          className="mb-3 flex w-full items-center gap-3 rounded-card bg-primary-50 p-4 text-left transition active:scale-[0.99]"
        >
          <BellRing className="text-primary" size={20} />
          <div className="flex-1">
            <p className="text-[14px] font-bold text-ink">알림 켜기</p>
            <p className="text-[13px] text-gray-600">
              {activePet.name}의 케어 시간을 알려드릴게요
            </p>
          </div>
          <span className="text-[14px] font-bold text-primary">켜기</span>
        </button>
      )}

      <Card
        title="오늘 할 일"
        action={
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1 rounded-pill bg-gray-100 px-3 py-1.5 text-[13px] font-bold text-gray-700 transition active:scale-95"
          >
            <Plus size={15} strokeWidth={2.6} />
            추가
          </button>
        }
      >
        <CareList
          items={todayItems}
          onToggle={handleToggle}
          onRemove={remove}
        />
      </Card>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="오늘 케어 추가"
      >
        <AddCareForm
          petId={activePet.id}
          defaultTypes={activePet.careTemplate}
          onAdd={addItem}
          onClose={() => setAddOpen(false)}
        />
      </Modal>
    </div>
  );
}
