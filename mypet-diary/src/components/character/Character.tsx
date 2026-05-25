import type { CharacterMood, CharacterTemplate, PetSpecies } from '@/types';
import { SPECIES_EMOJI } from '@/utils/careLabels';
import { cn } from '@/utils/cn';

interface CharacterProps {
  photoUrl?: string;
  /** AI-generated 2D character image; preferred over the raw photo when present. */
  characterUrl?: string;
  species: PetSpecies;
  template?: CharacterTemplate;
  mood?: CharacterMood;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const MOOD_DECORATION: Record<CharacterMood, string> = {
  happy: '✨',
  sad: '💧',
  calm: '🌿',
  sleepy: '💤',
};

const TEMPLATE_BG: Record<CharacterTemplate, string> = {
  classic: 'from-primary-50 to-primary-100',
  pastel: 'from-secondary-50 to-secondary-100',
  star: 'from-accent-50 to-accent-100',
  forest: 'from-secondary-100 to-secondary-200',
  astronaut: 'from-primary-100 to-secondary-100',
};

const SIZE_CLASS = {
  sm: 'h-20 w-20 text-3xl',
  md: 'h-32 w-32 text-5xl',
  lg: 'h-48 w-48 text-7xl',
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
  const imageSrc = characterUrl || photoUrl;
  return (
    <div className="relative inline-flex items-center justify-center">
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-gradient-to-br shadow-card ring-4 ring-white',
          TEMPLATE_BG[template],
          SIZE_CLASS[size],
          animated && 'animate-bounceSoft',
        )}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt="pet"
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <span aria-hidden>{SPECIES_EMOJI[species]}</span>
        )}
      </div>
      <span
        className="absolute -right-1 -top-1 select-none text-xl"
        aria-label={`mood: ${mood}`}
      >
        {MOOD_DECORATION[mood]}
      </span>
    </div>
  );
}

export const CHARACTER_TEMPLATES: Array<{
  id: CharacterTemplate;
  label: string;
}> = [
  { id: 'classic', label: '클래식 코랄' },
  { id: 'pastel', label: '민트 파스텔' },
  { id: 'star', label: '노란 별' },
  { id: 'forest', label: '숲속 친구' },
  { id: 'astronaut', label: '우주 탐험' },
];
