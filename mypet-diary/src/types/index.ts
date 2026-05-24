export type PetSpecies =
  | 'dog'
  | 'cat'
  | 'reptile'
  | 'hamster'
  | 'rabbit'
  | 'other';

export type CareItemType =
  | 'meal'
  | 'medication'
  | 'supplement'
  | 'treat'
  | 'walk'
  | 'weight'
  | 'vaccine'
  | 'hospital'
  | 'humidity'
  | 'temperature'
  | 'shedding'
  | 'uvb_lamp'
  | 'cage_cleaning'
  | 'bath'
  | 'grooming';

export type CharacterMood = 'happy' | 'sad' | 'calm' | 'sleepy';

export type CharacterTemplate =
  | 'classic'
  | 'pastel'
  | 'star'
  | 'forest'
  | 'astronaut';

export interface Recurrence {
  pattern: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval?: number;
  daysOfWeek?: number[];
  endDate?: string;
}

export interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  breed?: string;
  birthDate?: string;
  adoptionDate?: string;
  gender?: 'male' | 'female';
  weight?: number;
  photoUrl: string;
  characterUrl?: string;
  characterTemplate?: CharacterTemplate;
  notes?: string;
  careTemplate: CareItemType[];
  createdAt: string;
}

export interface CareItem {
  id: string;
  petId: string;
  type: CareItemType;
  title: string;
  scheduledAt: string;
  completed: boolean;
  completedAt?: string;
  recurrence?: Recurrence;
  metadata?: Record<string, unknown>;
}

export interface WeightRecord {
  id: string;
  petId: string;
  weight: number;
  recordedAt: string;
  note?: string;
}

export interface Medication {
  id: string;
  petId: string;
  name: string;
  dosage?: string;
  startDate: string;
  endDate?: string;
  recurrence: Recurrence;
  purpose?: string;
}

export interface Supplement {
  id: string;
  petId: string;
  name: string;
  recurrence: Recurrence;
  remainingCount?: number;
  alertThreshold?: number;
}

export interface HospitalRecord {
  id: string;
  petId: string;
  visitDate: string;
  hospitalName: string;
  hospitalContact?: string;
  purpose: string;
  diagnosis?: string;
  treatment?: string;
  cost?: number;
  nextVisitDate?: string;
  attachments?: string[];
}

export interface WalkRecord {
  id: string;
  petId: string;
  startedAt: string;
  durationMinutes: number;
  hadBowelMovement?: boolean;
  weather?: string;
  note?: string;
}

export interface MealRecord {
  id: string;
  petId: string;
  recordedAt: string;
  foodName?: string;
  amount?: string;
  note?: string;
}

export interface ReptileEnvironment {
  id: string;
  petId: string;
  recordedAt: string;
  humidity?: number;
  temperature?: number;
  sheddingStatus?: 'normal' | 'abnormal' | 'in_progress';
  note?: string;
}

export interface PointTransaction {
  id: string;
  amount: number;
  reason: string;
  createdAt: string;
}

export interface Streak {
  petId: string;
  currentDays: number;
  bestDays: number;
  lastCheckDate: string;
}
