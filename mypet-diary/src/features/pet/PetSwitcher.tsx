import { usePetStore } from '@/stores/petStore';
import { Character } from '@/components/character/Character';
import { cn } from '@/utils/cn';

export function PetSwitcher() {
  const pets = usePetStore((s) => s.pets);
  const activePetId = usePetStore((s) => s.activePetId);
  const setActivePet = usePetStore((s) => s.setActivePet);

  if (pets.length <= 1) return null;

  return (
    <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
      {pets.map((pet) => (
        <button
          key={pet.id}
          onClick={() => setActivePet(pet.id)}
          className={cn(
            'flex shrink-0 items-center gap-2 rounded-pill px-3 py-1.5 text-[13px] font-bold transition',
            pet.id === activePetId
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600',
          )}
        >
          <Character
            photoUrl={pet.photoUrl}
            characterUrl={pet.characterUrl}
            species={pet.species}
            template={pet.characterTemplate}
            size="sm"
            animated={false}
          />
          <span>{pet.name}</span>
        </button>
      ))}
    </div>
  );
}
