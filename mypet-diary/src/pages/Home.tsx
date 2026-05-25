import { useMemo, useState } from 'react';
import { Plus, Flame, Sparkles, BellRing } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Card, EmptyState } from '@/components/common/Card';
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

  const careItems = useCareStore((s) => s.items);
  const todayItemsForPet = useCareStore((s) => s.todayItemsForPet);
  const todayItems = useMemo(
    () => (activePet ? todayItemsForPet(activePet.id) : []),
    [careItems, activePet, todayItemsForPet],
  );
  const toggle = useCareStore((s) => s.toggle);
  const remove = useCareStore((s) => s.remove);
  const addItem = useCareStore((s) => s.addItem);

  const award = usePointsStore((s) => s.award);
  const markStreak = usePointsStore((s) => s.markStreak);
  const totalPoints = usePointsStore((s) => s.total());
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
      ? `${activePet.name}: "오늘 계획을 알려줘!"`
      : completed === total
      ? `${activePet.name}: "오늘 다 했어! 고마워!"`
      : `${activePet.name}: "오늘 ${total - completed}개 남았어!"`;

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

      <Card className="bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="flex flex-col items-center text-center">
          <Character
            photoUrl={activePet.photoUrl}
            characterUrl={activePet.characterUrl}
            species={activePet.species}
            template={activePet.characterTemplate}
            mood={mood}
            size="lg"
          />
          <p className="mt-4 font-hand text-lg text-ink">{message}</p>
          <div className="mt-4 w-full">
            <div className="mb-1 flex items-center justify-between text-xs text-muted">
              <span>오늘의 케어</span>
              <span>
                {completed} / {total}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-pill bg-white">
              <div
                className="h-full rounded-pill bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="my-4 grid grid-cols-2 gap-3">
        <Card className="flex items-center gap-3">
          <Flame className="text-primary" />
          <div>
            <p className="text-xs text-muted">연속 케어</p>
            <p className="text-lg font-bold">
              {streak?.currentDays ?? 0}일
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <Sparkles className="text-accent-200" />
          <div>
            <p className="text-xs text-muted">포인트</p>
            <p className="text-lg font-bold">{totalPoints}P</p>
          </div>
        </Card>
      </div>

      {permission !== 'granted' && permission !== 'unsupported' && (
        <Card className="mb-4 flex items-center gap-3 border border-primary-100">
          <BellRing className="text-primary" />
          <div className="flex-1">
            <p className="text-sm font-semibold">알림을 켜주세요</p>
            <p className="text-xs text-muted">
              {activePet.name}이 시간 맞춰 말 걸어줄 거예요.
            </p>
          </div>
          <Button size="sm" onClick={request}>
            켜기
          </Button>
        </Card>
      )}

      <Card
        title="오늘 할 일"
        action={
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Plus size={16} />}
            onClick={() => setAddOpen(true)}
          >
            추가
          </Button>
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
