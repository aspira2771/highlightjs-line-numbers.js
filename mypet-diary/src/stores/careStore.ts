import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { differenceInCalendarDays, isSameDay, parseISO } from 'date-fns';
import type { CareItem } from '@/types';
import { uid } from '@/utils/id';
import { toISODateTime } from '@/utils/date';
import { useRecordsStore } from './recordsStore';
import { usePetStore } from './petStore';

/** Whether a recurring care template should produce an occurrence today. */
function shouldOccurToday(item: CareItem, today: Date): boolean {
  const r = item.recurrence;
  if (!r) return false;
  if (r.endDate && today > parseISO(r.endDate)) return false;
  const start = parseISO(item.scheduledAt);
  const days = differenceInCalendarDays(today, start);
  if (days < 0) return false;
  const interval = Math.max(1, r.interval ?? 1);
  switch (r.pattern) {
    case 'daily':
    case 'custom':
      return days % interval === 0;
    case 'weekly':
      if (r.daysOfWeek?.length) return r.daysOfWeek.includes(today.getDay());
      return today.getDay() === start.getDay() && Math.floor(days / 7) % interval === 0;
    case 'monthly':
      return today.getDate() === start.getDate();
    default:
      return false;
  }
}

/**
 * Care types that have a matching tab in the 기록 (Records) page. Completing
 * one of these on the home checklist auto-creates the corresponding record so
 * the Records page stays in sync without re-entering the data.
 */
type SyncableKind = 'meal' | 'walk' | 'weight';

/** Link stored on a completed care item so toggling it off can undo the record. */
interface SyncedRecord {
  kind: SyncableKind;
  id: string;
}

const SYNC_NOTE = '오늘의 케어에서 자동 기록';

/** Create the record matching a completed care item; null if the type has no record. */
function createSyncedRecord(item: CareItem): SyncedRecord | null {
  const records = useRecordsStore.getState();
  const recordedAt = toISODateTime();
  switch (item.type) {
    case 'meal': {
      const meal = records.addMeal({
        petId: item.petId,
        recordedAt,
        note: SYNC_NOTE,
      });
      return { kind: 'meal', id: meal.id };
    }
    case 'walk': {
      const walk = records.addWalk({
        petId: item.petId,
        startedAt: recordedAt,
        durationMinutes: 0,
        note: SYNC_NOTE,
      });
      return { kind: 'walk', id: walk.id };
    }
    case 'weight': {
      // Weight needs an actual value — fall back to the pet's known weight.
      const pet = usePetStore
        .getState()
        .pets.find((p) => p.id === item.petId);
      if (typeof pet?.weight !== 'number') return null;
      const weight = records.addWeight({
        petId: item.petId,
        weight: pet.weight,
        recordedAt,
        note: SYNC_NOTE,
      });
      return { kind: 'weight', id: weight.id };
    }
    default:
      return null;
  }
}

/** Remove a previously auto-created record (when a care item is un-completed). */
function removeSyncedRecord(link: SyncedRecord) {
  const records = useRecordsStore.getState();
  if (link.kind === 'meal') records.removeMeal(link.id);
  else if (link.kind === 'walk') records.removeWalk(link.id);
  else if (link.kind === 'weight') records.removeWeight(link.id);
}

interface CareState {
  items: CareItem[];
  addItem: (input: Omit<CareItem, 'id' | 'completed'>) => CareItem;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  itemsForPet: (petId: string) => CareItem[];
  todayItemsForPet: (petId: string) => CareItem[];
  /** Materialize today's instances of recurring care items for a pet. */
  materializeRecurring: (petId: string) => void;
}

export const useCareStore = create<CareState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (input) => {
        const item: CareItem = {
          ...input,
          id: uid('care'),
          completed: false,
        };
        set((state) => ({ items: [...state.items, item] }));
        return item;
      },
      toggle: (id) => {
        const item = get().items.find((i) => i.id === id);
        if (!item) return;
        const willComplete = !item.completed;

        const existingLink = item.metadata?.syncedRecord as
          | SyncedRecord
          | undefined;
        let metadata = item.metadata;

        if (willComplete) {
          const link = createSyncedRecord(item);
          if (link) metadata = { ...(item.metadata ?? {}), syncedRecord: link };
        } else if (existingLink) {
          // Undo the auto-created record and drop the link.
          removeSyncedRecord(existingLink);
          const { syncedRecord: _removed, ...rest } = item.metadata ?? {};
          metadata = rest;
        }

        set((state) => ({
          items: state.items.map((it) =>
            it.id === id
              ? {
                  ...it,
                  completed: willComplete,
                  completedAt: willComplete ? toISODateTime() : undefined,
                  metadata,
                }
              : it,
          ),
        }));
      },
      remove: (id) => {
        // Also clean up any auto-created record so the Records page stays in sync.
        const item = get().items.find((i) => i.id === id);
        const link = item?.metadata?.syncedRecord as SyncedRecord | undefined;
        if (link) removeSyncedRecord(link);
        set((state) => ({
          items: state.items.filter((it) => it.id !== id),
        }));
      },
      itemsForPet: (petId) =>
        get().items.filter((item) => item.petId === petId),
      todayItemsForPet: (petId) => {
        const today = new Date();
        return get().items.filter(
          (item) =>
            item.petId === petId &&
            isSameDay(parseISO(item.scheduledAt), today),
        );
      },
      materializeRecurring: (petId) => {
        const today = new Date();
        const items = get().items;
        // Templates = recurring items that aren't themselves generated instances.
        const templates = items.filter(
          (i) => i.petId === petId && i.recurrence && !i.metadata?.seriesId,
        );
        const toAdd: CareItem[] = [];
        for (const t of templates) {
          if (isSameDay(parseISO(t.scheduledAt), today)) continue; // already covers today
          if (!shouldOccurToday(t, today)) continue;
          const exists = items.some(
            (i) =>
              i.metadata?.seriesId === t.id &&
              isSameDay(parseISO(i.scheduledAt), today),
          );
          if (exists) continue;
          const time = parseISO(t.scheduledAt);
          const scheduled = new Date(today);
          scheduled.setHours(time.getHours(), time.getMinutes(), 0, 0);
          toAdd.push({
            ...t,
            id: uid('care'),
            scheduledAt: scheduled.toISOString(),
            completed: false,
            completedAt: undefined,
            recurrence: undefined,
            metadata: { ...(t.metadata ?? {}), seriesId: t.id },
          });
        }
        if (toAdd.length) set((state) => ({ items: [...state.items, ...toAdd] }));
      },
    }),
    { name: 'mypet:care' },
  ),
);
