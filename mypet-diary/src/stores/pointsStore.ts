import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isSameDay, parseISO } from 'date-fns';
import type { PointTransaction, Streak } from '@/types';
import { toISODate, toISODateTime } from '@/utils/date';
import { uid } from '@/utils/id';

interface PointsState {
  transactions: PointTransaction[];
  streaks: Record<string, Streak>;
  total: () => number;
  award: (amount: number, reason: string) => void;
  markStreak: (petId: string) => void;
}

export const usePointsStore = create<PointsState>()(
  persist(
    (set, get) => ({
      transactions: [],
      streaks: {},
      total: () =>
        get().transactions.reduce((sum, tx) => sum + tx.amount, 0),
      award: (amount, reason) =>
        set((state) => ({
          transactions: [
            ...state.transactions,
            {
              id: uid('pt'),
              amount,
              reason,
              createdAt: toISODateTime(),
            },
          ],
        })),
      markStreak: (petId) =>
        set((state) => {
          const prev = state.streaks[petId];
          const today = new Date();
          if (prev && isSameDay(parseISO(prev.lastCheckDate), today)) {
            return state;
          }
          const yesterday = prev
            ? Math.floor(
                (today.getTime() - parseISO(prev.lastCheckDate).getTime()) /
                  (24 * 60 * 60 * 1000),
              )
            : null;
          const currentDays =
            yesterday === 1 ? (prev?.currentDays ?? 0) + 1 : 1;
          const bestDays = Math.max(prev?.bestDays ?? 0, currentDays);
          return {
            streaks: {
              ...state.streaks,
              [petId]: {
                petId,
                currentDays,
                bestDays,
                lastCheckDate: toISODate(today),
              },
            },
          };
        }),
    }),
    { name: 'mypet:points' },
  ),
);
