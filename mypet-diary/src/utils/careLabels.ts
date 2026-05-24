import type { CareItemType, PetSpecies } from '@/types';

export const CARE_LABELS: Record<CareItemType, string> = {
  meal: '사료',
  medication: '약',
  supplement: '영양제',
  treat: '간식',
  walk: '산책',
  weight: '체중',
  vaccine: '예방접종',
  hospital: '병원',
  humidity: '습도',
  temperature: '온도',
  shedding: '탈피',
  uvb_lamp: 'UVB 램프',
  cage_cleaning: '사육장 청소',
  bath: '목욕',
  grooming: '미용',
};

export const CARE_ICONS: Record<CareItemType, string> = {
  meal: '🍚',
  medication: '💊',
  supplement: '🧪',
  treat: '🍪',
  walk: '🐾',
  weight: '⚖️',
  vaccine: '💉',
  hospital: '🏥',
  humidity: '💧',
  temperature: '🌡️',
  shedding: '🍃',
  uvb_lamp: '💡',
  cage_cleaning: '🧹',
  bath: '🛁',
  grooming: '✂️',
};

export const SPECIES_LABELS: Record<PetSpecies, string> = {
  dog: '강아지',
  cat: '고양이',
  reptile: '파충류',
  hamster: '햄스터',
  rabbit: '토끼',
  other: '기타',
};

export const SPECIES_EMOJI: Record<PetSpecies, string> = {
  dog: '🐶',
  cat: '🐱',
  reptile: '🦎',
  hamster: '🐹',
  rabbit: '🐰',
  other: '🐾',
};

export const CARE_TEMPLATE: Record<PetSpecies, CareItemType[]> = {
  dog: ['walk', 'meal', 'treat', 'weight', 'vaccine', 'bath', 'grooming'],
  cat: ['meal', 'supplement', 'weight', 'vaccine', 'hospital'],
  reptile: [
    'humidity',
    'temperature',
    'shedding',
    'meal',
    'uvb_lamp',
    'cage_cleaning',
  ],
  hamster: ['meal', 'cage_cleaning', 'weight'],
  rabbit: ['meal', 'cage_cleaning', 'grooming', 'weight'],
  other: ['meal', 'weight', 'hospital'],
};

export function recommendedCare(species: PetSpecies): CareItemType[] {
  return CARE_TEMPLATE[species];
}
