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
            'flex shrink-0 items-center gap-2 rounded-pill border px-3 py-1.5 text-xs font-semibold transition',
            pet.id === activePetId
              ? 'border-primary bg-primary text-white'
              : 'border-primary-100 bg-white text-ink',
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
