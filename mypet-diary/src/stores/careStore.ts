import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isSameDay, parseISO } from 'date-fns';
import type { CareItem } from '@/types';
import { uid } from '@/utils/id';
import { toISODateTime } from '@/utils/date';

interface CareState {
  items: CareItem[];
  addItem: (input: Omit<CareItem, 'id' | 'completed'>) => CareItem;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  itemsForPet: (petId: string) => CareItem[];
  todayItemsForPet: (petId: string) => CareItem[];
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
      toggle: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  completed: !item.completed,
                  completedAt: !item.completed ? toISODateTime() : undefined,
                }
              : item,
          ),
        })),
      remove: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
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
    }),
    { name: 'mypet:care' },
  ),
);
