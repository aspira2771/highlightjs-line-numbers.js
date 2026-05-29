import { useEffect } from 'react';
import { isSameDay, parseISO } from 'date-fns';
import { useCareStore } from '@/stores/careStore';
import { usePetStore } from '@/stores/petStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useNotification } from './useNotification';
import { CARE_LABELS } from '@/utils/careLabels';

const FIRED_KEY = 'mypet:reminder:fired';

function loadFired(): Set<string> {
  try {
    const raw = localStorage.getItem(FIRED_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveFired(fired: Set<string>) {
  localStorage.setItem(FIRED_KEY, JSON.stringify(Array.from(fired)));
}

export function useCareReminder() {
  const items = useCareStore((s) => s.items);
  const pets = usePetStore((s) => s.pets);
  const careReminders = useSettingsStore((s) => s.careReminders);
  const leadMinutes = useSettingsStore((s) => s.reminderLeadMinutes);
  const { permission, notify } = useNotification();

  useEffect(() => {
    if (permission !== 'granted') return;
    if (!careReminders) return; // user disabled care reminders
    const tick = () => {
      const now = new Date();
      const fired = loadFired();
      let changed = false;
      for (const item of items) {
        if (item.completed) continue;
        const at = parseISO(item.scheduledAt);
        if (!isSameDay(at, now)) continue;
        // Fire `leadMinutes` before the scheduled time.
        const diffMin = (at.getTime() - now.getTime()) / 60000 - leadMinutes;
        if (diffMin <= 0 && diffMin > -1 && !fired.has(item.id)) {
          const pet = pets.find((p) => p.id === item.petId);
          const petName = pet?.name ?? '아이';
          notify(
            `${petName}의 ${CARE_LABELS[item.type]} 시간이에요`,
            item.title || `${petName} ${CARE_LABELS[item.type]} 챙겨주세요!`,
          );
          fired.add(item.id);
          changed = true;
        }
      }
      if (changed) saveFired(fired);
    };
    tick();
    const interval = window.setInterval(tick, 30 * 1000);
    return () => window.clearInterval(interval);
  }, [items, pets, permission, notify, careReminders, leadMinutes]);
}
