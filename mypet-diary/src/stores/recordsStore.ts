import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  HospitalRecord,
  MealRecord,
  Medication,
  ReptileEnvironment,
  Supplement,
  WalkRecord,
  WeightRecord,
} from '@/types';
import { uid } from '@/utils/id';

interface RecordsState {
  weights: WeightRecord[];
  meals: MealRecord[];
  walks: WalkRecord[];
  medications: Medication[];
  supplements: Supplement[];
  hospitals: HospitalRecord[];
  reptileEnvs: ReptileEnvironment[];

  addWeight: (input: Omit<WeightRecord, 'id'>) => WeightRecord;
  addMeal: (input: Omit<MealRecord, 'id'>) => MealRecord;
  addWalk: (input: Omit<WalkRecord, 'id'>) => WalkRecord;
  addMedication: (input: Omit<Medication, 'id'>) => Medication;
  addSupplement: (input: Omit<Supplement, 'id'>) => Supplement;
  addHospital: (input: Omit<HospitalRecord, 'id'>) => HospitalRecord;
  addReptileEnv: (input: Omit<ReptileEnvironment, 'id'>) => ReptileEnvironment;

  removeWeight: (id: string) => void;
  removeMeal: (id: string) => void;
  removeWalk: (id: string) => void;
  removeMedication: (id: string) => void;
  removeSupplement: (id: string) => void;
  removeHospital: (id: string) => void;
}

function append<T extends { id: string }>(list: T[], item: T): T[] {
  return [...list, item];
}

export const useRecordsStore = create<RecordsState>()(
  persist(
    (set) => ({
      weights: [],
      meals: [],
      walks: [],
      medications: [],
      supplements: [],
      hospitals: [],
      reptileEnvs: [],

      addWeight: (input) => {
        const item = { ...input, id: uid('w') };
        set((state) => ({ weights: append(state.weights, item) }));
        return item;
      },
      addMeal: (input) => {
        const item = { ...input, id: uid('m') };
        set((state) => ({ meals: append(state.meals, item) }));
        return item;
      },
      addWalk: (input) => {
        const item = { ...input, id: uid('walk') };
        set((state) => ({ walks: append(state.walks, item) }));
        return item;
      },
      addMedication: (input) => {
        const item = { ...input, id: uid('med') };
        set((state) => ({ medications: append(state.medications, item) }));
        return item;
      },
      addSupplement: (input) => {
        const item = { ...input, id: uid('sup') };
        set((state) => ({ supplements: append(state.supplements, item) }));
        return item;
      },
      addHospital: (input) => {
        const item = { ...input, id: uid('hosp') };
        set((state) => ({ hospitals: append(state.hospitals, item) }));
        return item;
      },
      addReptileEnv: (input) => {
        const item = { ...input, id: uid('env') };
        set((state) => ({ reptileEnvs: append(state.reptileEnvs, item) }));
        return item;
      },

      removeWeight: (id) =>
        set((state) => ({ weights: state.weights.filter((x) => x.id !== id) })),
      removeMeal: (id) =>
        set((state) => ({ meals: state.meals.filter((x) => x.id !== id) })),
      removeWalk: (id) =>
        set((state) => ({ walks: state.walks.filter((x) => x.id !== id) })),
      removeMedication: (id) =>
        set((state) => ({
          medications: state.medications.filter((x) => x.id !== id),
        })),
      removeSupplement: (id) =>
        set((state) => ({
          supplements: state.supplements.filter((x) => x.id !== id),
        })),
      removeHospital: (id) =>
        set((state) => ({
          hospitals: state.hospitals.filter((x) => x.id !== id),
        })),
    }),
    { name: 'mypet:records' },
  ),
);
