import { Droplet, Leaf, Moon, Sparkles, type LucideIcon } from 'lucide-react';
import type { CharacterMood, CharacterTemplate, PetSpecies } from '@/types';
import { SPECIES_ICON_COMPONENTS } from '@/utils/careIcons';
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

const MOOD_ICON: Record<CharacterMood, LucideIcon> = {
  happy: Sparkles,
  sad: Droplet,
  calm: Leaf,
  sleepy: Moon,
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
  const SpeciesIcon = SPECIES_ICON_COMPONENTS[species];
  const MoodIcon = MOOD_ICON[mood];
  const iconSize = size === 'lg' ? 72 : size === 'md' ? 48 : 30;
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
          <SpeciesIcon
            size={iconSize}
            strokeWidth={1.5}
            className="text-gray-400"
            aria-hidden
          />
        )}
      </div>
      <span
        className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-gray-600 shadow-soft"
        aria-label={`mood: ${mood}`}
      >
        <MoodIcon size={13} />
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
