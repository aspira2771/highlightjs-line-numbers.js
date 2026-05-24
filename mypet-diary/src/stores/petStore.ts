import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Pet } from '@/types';
import { uid } from '@/utils/id';
import { toISODateTime } from '@/utils/date';
import { recommendedCare } from '@/utils/careLabels';

interface PetState {
  pets: Pet[];
  activePetId: string | null;
  addPet: (input: Omit<Pet, 'id' | 'createdAt' | 'careTemplate'> & {
    careTemplate?: Pet['careTemplate'];
  }) => Pet;
  updatePet: (id: string, patch: Partial<Pet>) => void;
  removePet: (id: string) => void;
  setActivePet: (id: string) => void;
  getActivePet: () => Pet | null;
}

export const usePetStore = create<PetState>()(
  persist(
    (set, get) => ({
      pets: [],
      activePetId: null,
      addPet: (input) => {
        const newPet: Pet = {
          ...input,
          id: uid('pet'),
          createdAt: toISODateTime(),
          careTemplate: input.careTemplate ?? recommendedCare(input.species),
        };
        set((state) => ({
          pets: [...state.pets, newPet],
          activePetId: state.activePetId ?? newPet.id,
        }));
        return newPet;
      },
      updatePet: (id, patch) =>
        set((state) => ({
          pets: state.pets.map((pet) =>
            pet.id === id ? { ...pet, ...patch } : pet,
          ),
        })),
      removePet: (id) =>
        set((state) => {
          const pets = state.pets.filter((pet) => pet.id !== id);
          const activePetId =
            state.activePetId === id ? (pets[0]?.id ?? null) : state.activePetId;
          return { pets, activePetId };
        }),
      setActivePet: (id) => set({ activePetId: id }),
      getActivePet: () => {
        const { pets, activePetId } = get();
        return pets.find((pet) => pet.id === activePetId) ?? null;
      },
    }),
    { name: 'mypet:pets' },
  ),
);
