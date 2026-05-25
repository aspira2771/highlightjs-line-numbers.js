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

  updateWeight: (id: string, patch: RecordPatch<WeightRecord>) => void;
  updateMeal: (id: string, patch: RecordPatch<MealRecord>) => void;
  updateWalk: (id: string, patch: RecordPatch<WalkRecord>) => void;
  updateMedication: (id: string, patch: RecordPatch<Medication>) => void;
  updateSupplement: (id: string, patch: RecordPatch<Supplement>) => void;

  removeWeight: (id: string) => void;
  removeMeal: (id: string) => void;
  removeWalk: (id: string) => void;
  removeMedication: (id: string) => void;
  removeSupplement: (id: string) => void;
  removeHospital: (id: string) => void;
}

/** Fields editable on a record — id and petId stay fixed. */
type RecordPatch<T extends { id: string; petId: string }> = Partial<
  Omit<T, 'id' | 'petId'>
>;

function append<T extends { id: string }>(list: T[], item: T): T[] {
  return [...list, item];
}

function patchById<T extends { id: string }>(
  list: T[],
  id: string,
  patch: NoInfer<Partial<T>>,
): T[] {
  return list.map((item) => (item.id === id ? { ...item, ...patch } : item));
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

      updateWeight: (id, patch) =>
        set((state) => ({ weights: patchById(state.weights, id, patch) })),
      updateMeal: (id, patch) =>
        set((state) => ({ meals: patchById(state.meals, id, patch) })),
      updateWalk: (id, patch) =>
        set((state) => ({ walks: patchById(state.walks, id, patch) })),
      updateMedication: (id, patch) =>
        set((state) => ({
          medications: patchById(state.medications, id, patch),
        })),
      updateSupplement: (id, patch) =>
        set((state) => ({
          supplements: patchById(state.supplements, id, patch),
        })),

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
