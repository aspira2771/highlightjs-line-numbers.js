import type { CharacterMood, CharacterTemplate, PetSpecies } from '@/types';
import { SPECIES_EMOJI } from '@/utils/careLabels';
import { cn } from '@/utils/cn';

interface CharacterProps {
  photoUrl?: string;
  characterUrl?: string;
  species: PetSpecies;
  template?: CharacterTemplate;
  mood?: CharacterMood;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const MOOD_LABEL: Record<CharacterMood, string> = {
  happy: '기분 최고',
  sad: '아쉬워요',
  calm: '편안해요',
  sleepy: '졸려요',
};

const MOOD_TONE: Record<CharacterMood, string> = {
  happy: 'bg-primary text-white',
  sad: 'bg-amber-100 text-amber-700',
  calm: 'bg-primary-50 text-primary-500',
  sleepy: 'bg-gray-100 text-gray-600',
};

const TEMPLATE_BG: Record<CharacterTemplate, string> = {
  classic: 'bg-primary-50',
  pastel: 'bg-[#E7F9F5]',
  star: 'bg-[#FFF4E0]',
  forest: 'bg-[#EAF6EC]',
  astronaut: 'bg-[#EEE9FE]',
};

const SIZE_CLASS = {
  sm: 'h-14 w-14 text-2xl',
  md: 'h-24 w-24 text-4xl',
  lg: 'h-32 w-32 text-5xl',
};

export function Character({
  photoUrl,
  characterUrl,
  species,
  template = 'classic',
  mood = 'happy',
  size = 'md',
  animated = true,
}: CharacterProps) {
  return (
    <div className="relative inline-flex items-center justify-center">
      <div
        className={cn(
          'flex items-center justify-center overflow-hidden rounded-full',
          TEMPLATE_BG[template],
          SIZE_CLASS[size],
          animated && 'animate-floaty',
        )}
      >
        {characterUrl ? (
          // Pokémon-GO style: cut-out pet floating on the tinted circle.
          <img
            src={characterUrl}
            alt="pet character"
            className="h-[88%] w-[88%] object-contain drop-shadow-[0_2px_4px_rgba(0,27,55,0.18)]"
          />
        ) : photoUrl ? (
          <img
            src={photoUrl}
            alt="pet"
            className="h-full w-full object-cover"
          />
        ) : (
          <span aria-hidden>{SPECIES_EMOJI[species]}</span>
        )}
      </div>
      {size === 'lg' && (
        <span
          className={cn(
            'absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-pill px-3 py-1 text-[12px] font-bold shadow-soft',
            MOOD_TONE[mood],
          )}
        >
          {MOOD_LABEL[mood]}
        </span>
      )}
    </div>
  );
}

export const CHARACTER_TEMPLATES: Array<{
  id: CharacterTemplate;
  label: string;
}> = [
  { id: 'classic', label: '블루' },
  { id: 'pastel', label: '민트' },
  { id: 'star', label: '옐로' },
  { id: 'forest', label: '그린' },
  { id: 'astronaut', label: '퍼플' },
];
