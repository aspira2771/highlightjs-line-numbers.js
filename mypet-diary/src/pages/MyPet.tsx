import { useState } from 'react';
import { Plus, Trash2, Bell, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card, EmptyState } from '@/components/common/Card';
import { Modal } from '@/components/common/Modal';
import { PageHeader } from '@/components/common/PageHeader';
import { Character } from '@/components/character/Character';
import { MenuRow } from '@/components/common/ListRow';
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
                <div className="flex items-start gap-4">
                  <Character
                    photoUrl={pet.photoUrl}
                    species={pet.species}
                    template={pet.characterTemplate}
                    size="sm"
                    animated={false}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[18px] font-bold tracking-tight text-ink">
                        {pet.name}
                      </p>
                      {pet.id === activePetId && (
                        <span className="pill-solid">활성</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[13px] font-medium text-muted">
                      {SPECIES_LABELS[pet.species]}
                      {pet.breed && ` · ${pet.breed}`}
                      {age !== null && ` · ${age}살`}
                      {pet.weight && ` · ${pet.weight}kg`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 text-[13px] font-semibold">
                    {pet.id !== activePetId && (
                      <button
                        className="text-primary"
                        onClick={() => setActivePet(pet.id)}
                      >
                        활성
                      </button>
                    )}
                    <button
                      className="text-gray-500 hover:text-ink"
                      onClick={() => setEditId(pet.id)}
                    >
                      수정
                    </button>
                    <button
                      className="text-gray-400 hover:text-negative"
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
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {pet.careTemplate.map((type) => (
                    <span key={type} className="pill">
                      <span className="mr-1">{CARE_ICONS[type]}</span>
                      {CARE_LABELS[type]}
                    </span>
                  ))}
                </div>
                {pet.notes && (
                  <p className="mt-4 rounded-soft bg-gray-100 p-3.5 text-[13px] leading-relaxed text-gray-700">
                    {pet.notes}
                  </p>
                )}
              </Card>
            </li>
          );
        })}
      </ul>

      <Card className="mt-3 py-2" title="설정">
        <div className="divide-y divide-line">
          <MenuRow
            icon={<Bell size={18} />}
            label="푸시 알림"
            trailing={
              <span className="text-[14px] font-semibold text-muted">
                {permission === 'granted'
                  ? '켜짐'
                  : permission === 'unsupported'
                  ? '미지원'
                  : permission === 'denied'
                  ? '차단됨'
                  : '꺼짐'}
              </span>
            }
            onClick={
              permission !== 'granted' && permission !== 'unsupported'
                ? request
                : undefined
            }
          />
          <MenuRow icon={<Crown size={18} />} label="프리미엄 케어" />
          <MenuRow icon={<Sparkles size={18} />} label="포인트 상점" />
        </div>
      </Card>

      <p className="mt-7 text-center text-[12px] leading-relaxed text-gray-400">
        종별 케어 항목은 보호자의 기록 보조용이에요.
        <br />
        의학적 기준은 동물병원의 조언을 따라주세요.
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
