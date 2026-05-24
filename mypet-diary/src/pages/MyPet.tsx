import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card, EmptyState } from '@/components/common/Card';
import { Modal } from '@/components/common/Modal';
import { PageHeader } from '@/components/common/PageHeader';
import { Character } from '@/components/character/Character';
import { PetForm } from '@/features/pet/PetForm';
import { usePetStore } from '@/stores/petStore';
import { useNotification } from '@/hooks/useNotification';
import {
  CARE_ICONS,
  CARE_LABELS,
  SPECIES_LABELS,
} from '@/utils/careLabels';
import { ageInYears } from '@/utils/date';

export function MyPetPage() {
  const pets = usePetStore((s) => s.pets);
  const activePetId = usePetStore((s) => s.activePetId);
  const addPet = usePetStore((s) => s.addPet);
  const updatePet = usePetStore((s) => s.updatePet);
  const removePet = usePetStore((s) => s.removePet);
  const setActivePet = usePetStore((s) => s.setActivePet);
  const { permission, request } = useNotification();

  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const editingPet = pets.find((p) => p.id === editId) ?? null;

  return (
    <div className="page">
      <PageHeader
        title="마이펫"
        subtitle="반려동물 프로필을 관리해요"
        action={
          <Button
            size="sm"
            leftIcon={<Plus size={16} />}
            onClick={() => setAddOpen(true)}
          >
            추가
          </Button>
        }
      />

      {pets.length === 0 && (
        <EmptyState
          emoji="🐾"
          title="첫 친구를 등록해보세요"
          description="이름·종·사진을 등록하면 자동으로 케어 리스트를 추천해줘요."
          action={<Button onClick={() => setAddOpen(true)}>지금 등록하기</Button>}
        />
      )}

      <ul className="space-y-3">
        {pets.map((pet) => {
          const age = ageInYears(pet.birthDate);
          return (
            <li key={pet.id}>
              <Card>
                <div className="flex items-center gap-4">
                  <Character
                    photoUrl={pet.photoUrl}
                    species={pet.species}
                    template={pet.characterTemplate}
                    size="sm"
                    animated={false}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-base font-bold">{pet.name}</p>
                      {pet.id === activePetId && (
                        <span className="pill bg-primary-100 text-primary-500">
                          활성
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted">
                      {SPECIES_LABELS[pet.species]}
                      {pet.breed && ` · ${pet.breed}`}
                      {age !== null && ` · ${age}살`}
                      {pet.weight && ` · ${pet.weight}kg`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {pet.id !== activePetId && (
                      <button
                        className="text-xs text-primary"
                        onClick={() => setActivePet(pet.id)}
                      >
                        활성
                      </button>
                    )}
                    <button
                      className="text-xs text-muted"
                      onClick={() => setEditId(pet.id)}
                    >
                      수정
                    </button>
                    <button
                      className="text-xs text-red-500"
                      onClick={() => {
                        if (confirm(`${pet.name}을 삭제할까요?`)) {
                          removePet(pet.id);
                        }
                      }}
                      aria-label="삭제"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {pet.careTemplate.map((type) => (
                    <span key={type} className="pill bg-primary-50 text-ink">
                      {CARE_ICONS[type]} {CARE_LABELS[type]}
                    </span>
                  ))}
                </div>
                {pet.notes && (
                  <p className="mt-3 rounded-soft bg-bg p-2 text-xs text-muted">
                    {pet.notes}
                  </p>
                )}
              </Card>
            </li>
          );
        })}
      </ul>

      <Card className="mt-6" title="설정">
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">푸시 알림</p>
              <p className="text-xs text-muted">
                {permission === 'granted'
                  ? '켜져 있어요'
                  : permission === 'denied'
                  ? '브라우저 설정에서 허용해주세요'
                  : permission === 'unsupported'
                  ? '이 브라우저는 알림을 지원하지 않아요'
                  : '아직 허용 전이에요'}
              </p>
            </div>
            {permission !== 'granted' && permission !== 'unsupported' && (
              <Button size="sm" onClick={request}>
                허용
              </Button>
            )}
          </div>
        </div>
      </Card>

      <p className="mt-6 text-center text-[11px] text-muted">
        ※ 종별 케어 항목은 보호자의 기록 보조용이에요. 의학적 기준은 동물병원의
        조언을 따라주세요.
      </p>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="반려동물 등록"
      >
        <PetForm
          onSubmit={(values) => {
            addPet(values);
            setAddOpen(false);
          }}
        />
      </Modal>

      <Modal
        open={!!editingPet}
        onClose={() => setEditId(null)}
        title="반려동물 수정"
      >
        {editingPet && (
          <PetForm
            initial={editingPet}
            submitLabel="수정 저장"
            onSubmit={(values) => {
              updatePet(editingPet.id, values);
              setEditId(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}
