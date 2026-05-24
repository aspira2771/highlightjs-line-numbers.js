import { create, type StateCreator } from 'zustand';
import { persist, type PersistOptions } from 'zustand/middleware';

export function createPersistentStore<T>(
  config: StateCreator<T>,
  options: PersistOptions<T>,
) {
  return create<T>()(persist(config, options));
}
