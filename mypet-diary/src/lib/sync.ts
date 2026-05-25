import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { usePetStore } from '@/stores/petStore';
import { useCareStore } from '@/stores/careStore';
import { useRecordsStore } from '@/stores/recordsStore';

/**
 * Cloud sync between the local Zustand stores and Supabase.
 *
 * Model: local-first. On login we pull the account's rows; if the cloud is
 * empty we migrate the local (e.g. guest) data up. Afterwards every local
 * change is mirrored to the cloud (debounced upsert + delete-missing).
 * Last writer wins per row. Guest sessions never sync.
 *
 * Field names convert camelCase <-> snake_case at the top level only; jsonb
 * values (recurrence/path/metadata) keep their original keys.
 */

interface Store {
  getState: () => Record<string, unknown>;
  setState: (partial: Record<string, unknown>) => void;
  subscribe: (listener: () => void) => () => void;
}

interface Spec {
  table: string;
  store: Store;
  key: string;
}

const SPECS: Spec[] = [
  { table: 'pets', store: usePetStore as unknown as Store, key: 'pets' },
  { table: 'care_items', store: useCareStore as unknown as Store, key: 'items' },
  { table: 'weights', store: useRecordsStore as unknown as Store, key: 'weights' },
  { table: 'meals', store: useRecordsStore as unknown as Store, key: 'meals' },
  { table: 'walks', store: useRecordsStore as unknown as Store, key: 'walks' },
  { table: 'medications', store: useRecordsStore as unknown as Store, key: 'medications' },
  { table: 'supplements', store: useRecordsStore as unknown as Store, key: 'supplements' },
  { table: 'hospitals', store: useRecordsStore as unknown as Store, key: 'hospitals' },
  { table: 'reptile_envs', store: useRecordsStore as unknown as Store, key: 'reptileEnvs' },
  { table: 'symptoms', store: useRecordsStore as unknown as Store, key: 'symptoms' },
  { table: 'treats', store: useRecordsStore as unknown as Store, key: 'treats' },
  { table: 'photos', store: useRecordsStore as unknown as Store, key: 'photos' },
];

const camelToSnake = (s: string) => s.replace(/[A-Z]/g, (m) => '_' + m.toLowerCase());
const snakeToCamel = (s: string) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

function toRow(obj: Record<string, unknown>, userId: string) {
  const r: Record<string, unknown> = {};
  for (const k of Object.keys(obj)) {
    if (obj[k] === undefined) continue;
    r[camelToSnake(k)] = obj[k];
  }
  r.user_id = userId;
  return r;
}

function fromRow(row: Record<string, unknown>) {
  const o: Record<string, unknown> = {};
  for (const k of Object.keys(row)) {
    if (k === 'user_id') continue;
    o[snakeToCamel(k)] = row[k];
  }
  return o;
}

let started = false;
let activeUserId: string | null = null;
let unsubs: Array<() => void> = [];
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let suppress = false; // don't echo a pull back as a push

async function pushTable(spec: Spec, userId: string) {
  if (!supabase) return;
  const rows = (spec.store.getState()[spec.key] ?? []) as Record<string, unknown>[];
  if (rows.length) {
    await supabase
      .from(spec.table)
      .upsert(rows.map((r) => toRow(r, userId)), { onConflict: 'id' });
  }
  // Remove cloud rows that no longer exist locally.
  const ids = rows.map((r) => `"${String(r.id)}"`);
  let del = supabase.from(spec.table).delete().eq('user_id', userId);
  if (ids.length) del = del.not('id', 'in', `(${ids.join(',')})`);
  await del;
}

async function pushAll(userId: string) {
  for (const spec of SPECS) {
    try {
      await pushTable(spec, userId);
    } catch (e) {
      console.error('[sync] push failed', spec.table, e);
    }
  }
}

function schedulePush() {
  if (!activeUserId) return;
  const uid = activeUserId;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushAll(uid).catch(() => {});
  }, 1500);
}

/** Begin syncing for a signed-in (non-guest) user. */
export async function startSync(userId: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  if (started && activeUserId === userId) return;
  stopSync();
  activeUserId = userId;
  started = true;

  try {
    const pulled: Record<string, Record<string, unknown>[]> = {};
    let total = 0;
    for (const spec of SPECS) {
      const { data, error } = await supabase
        .from(spec.table)
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      pulled[spec.table] = (data ?? []).map(fromRow);
      total += data?.length ?? 0;
    }
    if (total === 0) {
      await pushAll(userId); // migrate local data up on first login
    } else {
      suppress = true;
      for (const spec of SPECS) {
        spec.store.setState({ [spec.key]: pulled[spec.table] });
      }
      suppress = false;
    }
  } catch (e) {
    console.error('[sync] initial sync failed', e);
  }

  const stores = Array.from(new Set(SPECS.map((s) => s.store)));
  unsubs = stores.map((store) =>
    store.subscribe(() => {
      if (!suppress) schedulePush();
    }),
  );
}

/** Stop syncing (logout / switch to guest). */
export function stopSync(): void {
  unsubs.forEach((u) => u());
  unsubs = [];
  if (pushTimer) {
    clearTimeout(pushTimer);
    pushTimer = null;
  }
  started = false;
  activeUserId = null;
}
