import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  HospitalRecord,
  MealRecord,
  Medication,
  PhotoMemory,
  ReptileEnvironment,
  Supplement,
  SymptomNote,
  TreatRecord,
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
  symptoms: SymptomNote[];
  treats: TreatRecord[];
  photos: PhotoMemory[];

  addWeight: (input: Omit<WeightRecord, 'id'>) => WeightRecord;
  addMeal: (input: Omit<MealRecord, 'id'>) => MealRecord;
  addWalk: (input: Omit<WalkRecord, 'id'>) => WalkRecord;
  addMedication: (input: Omit<Medication, 'id'>) => Medication;
  addSupplement: (input: Omit<Supplement, 'id'>) => Supplement;
  addHospital: (input: Omit<HospitalRecord, 'id'>) => HospitalRecord;
  addReptileEnv: (input: Omit<ReptileEnvironment, 'id'>) => ReptileEnvironment;
  addSymptom: (input: Omit<SymptomNote, 'id'>) => SymptomNote;
  addTreat: (input: Omit<TreatRecord, 'id'>) => TreatRecord;
  addPhoto: (input: Omit<PhotoMemory, 'id'>) => PhotoMemory;

  updateWeight: (id: string, patch: RecordPatch<WeightRecord>) => void;
  updateMeal: (id: string, patch: RecordPatch<MealRecord>) => void;
  updateWalk: (id: string, patch: RecordPatch<WalkRecord>) => void;
  updateMedication: (id: string, patch: RecordPatch<Medication>) => void;
  updateSupplement: (id: string, patch: RecordPatch<Supplement>) => void;
  updateReptileEnv: (id: string, patch: RecordPatch<ReptileEnvironment>) => void;
  updateSymptom: (id: string, patch: RecordPatch<SymptomNote>) => void;
  updateTreat: (id: string, patch: RecordPatch<TreatRecord>) => void;
  updatePhoto: (id: string, patch: RecordPatch<PhotoMemory>) => void;

  removeWeight: (id: string) => void;
  removeMeal: (id: string) => void;
  removeWalk: (id: string) => void;
  removeMedication: (id: string) => void;
  removeSupplement: (id: string) => void;
  removeHospital: (id: string) => void;
  removeReptileEnv: (id: string) => void;
  removeSymptom: (id: string) => void;
  removeTreat: (id: string) => void;
  removePhoto: (id: string) => void;
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
      symptoms: [],
      treats: [],
      photos: [],

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
      addSymptom: (input) => {
        const item = { ...input, id: uid('sym') };
        set((state) => ({ symptoms: append(state.symptoms, item) }));
        return item;
      },
      addTreat: (input) => {
        const item = { ...input, id: uid('treat') };
        set((state) => ({ treats: append(state.treats, item) }));
        return item;
      },
      addPhoto: (input) => {
        const item = { ...input, id: uid('photo') };
        set((state) => ({ photos: append(state.photos, item) }));
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
      updateReptileEnv: (id, patch) =>
        set((state) => ({
          reptileEnvs: patchById(state.reptileEnvs, id, patch),
        })),
      updateSymptom: (id, patch) =>
        set((state) => ({ symptoms: patchById(state.symptoms, id, patch) })),
      updateTreat: (id, patch) =>
        set((state) => ({ treats: patchById(state.treats, id, patch) })),
      updatePhoto: (id, patch) =>
        set((state) => ({ photos: patchById(state.photos, id, patch) })),

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
      removeReptileEnv: (id) =>
        set((state) => ({
          reptileEnvs: state.reptileEnvs.filter((x) => x.id !== id),
        })),
      removeSymptom: (id) =>
        set((state) => ({
          symptoms: state.symptoms.filter((x) => x.id !== id),
        })),
      removeTreat: (id) =>
        set((state) => ({ treats: state.treats.filter((x) => x.id !== id) })),
      removePhoto: (id) =>
        set((state) => ({ photos: state.photos.filter((x) => x.id !== id) })),
    }),
    { name: 'mypet:records' },
  ),
);
