import { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { PetForm } from '@/features/pet/PetForm';
import { usePetStore } from '@/stores/petStore';

interface Props {
  open: boolean;
  onClose: () => void;
  onRegistered: () => void;
}

/** Onboarding sheet shown on the walk tab when no pet is registered. */
export function RegisterPetSheet({ open, onClose, onRegistered }: Props) {
  const addPet = usePetStore((s) => s.addPet);
  const [showForm, setShowForm] = useState(false);

  const close = () => {
    setShowForm(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={showForm ? '반려동물 등록' : '누구랑 산책 할까요?'}
    >
      {showForm ? (
        <PetForm
          submitLabel="등록 완료"
          onSubmit={(values) => {
            addPet(values);
            setShowForm(false);
            onRegistered();
          }}
        />
      ) : (
        <div className="flex flex-col items-center pb-2 pt-2 text-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gray-100 text-6xl">
            🐶
          </div>
          <p className="mt-5 text-[16px] font-semibold text-gray-600">
            산책을 함께 할 반려동물이 없어요😢
          </p>
          <Button
            block
            size="lg"
            className="mt-8"
            onClick={() => setShowForm(true)}
          >
            반려동물 등록
          </Button>
        </div>
      )}
    </Modal>
  );
}
