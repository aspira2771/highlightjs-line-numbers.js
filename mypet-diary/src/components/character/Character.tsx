import type { CharacterMood, CharacterTemplate, PetSpecies } from '@/types';
import { SPECIES_EMOJI } from '@/utils/careLabels';
import { cn } from '@/utils/cn';

interface CharacterProps {
  photoUrl?: string;
  species: PetSpecies;
  template?: CharacterTemplate;
  mood?: CharacterMood;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const MOOD_DECORATION: Record<CharacterMood, string> = {
  happy: '·',
  sad: '·',
  calm: '·',
  sleepy: '·',
};

const MOOD_LABEL: Record<CharacterMood, string> = {
  happy: '기뻐요',
  sad: '아쉬워요',
  calm: '안심',
  sleepy: '졸려요',
};

const MOOD_TONE: Record<CharacterMood, string> = {
  happy: 'bg-primary text-white',
  sad: 'bg-accent-100 text-ink',
  calm: 'bg-secondary-100 text-ink',
  sleepy: 'bg-panel text-muted',
};

const TEMPLATE_BG: Record<CharacterTemplate, string> = {
  classic: 'from-primary-50 to-primary-100',
  pastel: 'from-secondary-50 to-secondary-100',
  star: 'from-accent-50 to-accent-100',
  forest: 'from-secondary-100 to-secondary-200',
  astronaut: 'from-primary-100 to-secondary-100',
};

const SIZE_CLASS = {
  sm: 'h-16 w-16 text-2xl',
  md: 'h-28 w-28 text-4xl',
  lg: 'h-40 w-40 text-6xl',
};

export function Character({
  photoUrl,
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
          'flex items-center justify-center rounded-full bg-gradient-to-br border border-line/60',
          TEMPLATE_BG[template],
          SIZE_CLASS[size],
          animated && 'animate-floaty',
        )}
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt="pet"
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <span aria-hidden>{SPECIES_EMOJI[species]}</span>
        )}
      </div>
      {size !== 'sm' && (
        <span
          className={cn(
            'absolute -bottom-1 right-0 rounded-pill px-2 py-0.5 text-[10px] font-medium shadow-soft',
            MOOD_TONE[mood],
          )}
        >
          {MOOD_LABEL[mood]}
        </span>
      )}
      <span className="sr-only">{MOOD_DECORATION[mood]}</span>
    </div>
  );
}

export const CHARACTER_TEMPLATES: Array<{
  id: CharacterTemplate;
  label: string;
}> = [
  { id: 'classic', label: '클래식' },
  { id: 'pastel', label: '파스텔' },
  { id: 'star', label: '골드' },
  { id: 'forest', label: '포레스트' },
  { id: 'astronaut', label: '듀얼' },
];
