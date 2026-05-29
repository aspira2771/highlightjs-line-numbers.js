import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * User preferences for notification intensity. Per the product spec, alerts are
 * split into categories so users can dial down notification fatigue.
 */
interface SettingsState {
  /** 필수: care/medication time reminders. */
  careReminders: boolean;
  /** 감성: streak & celebration messages. */
  celebrations: boolean;
  /** Minutes before a scheduled item to remind (0 = at time). */
  reminderLeadMinutes: number;
  setCareReminders: (v: boolean) => void;
  setCelebrations: (v: boolean) => void;
  setReminderLeadMinutes: (v: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      careReminders: true,
      celebrations: true,
      reminderLeadMinutes: 0,
      setCareReminders: (v) => set({ careReminders: v }),
      setCelebrations: (v) => set({ celebrations: v }),
      setReminderLeadMinutes: (v) => set({ reminderLeadMinutes: v }),
    }),
    { name: 'mypet:settings' },
  ),
);
