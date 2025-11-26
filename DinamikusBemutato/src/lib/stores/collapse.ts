import { writable } from 'svelte/store';
import { browser } from '$app/environment';
const KEY = 'sidebar:expanded';
function createExpandedStore() {
  const initial = browser
    ? (() => {
        try {
          const arr = JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[];
          return new Set(arr);
        } catch {
          return new Set<string>();
        }
      })()
    : new Set<string>();
  const { subscribe, set, update } = writable<Set<string>>(initial);
  const persist = (s: Set<string>) => {
    if (browser) localStorage.setItem(KEY, JSON.stringify([...s]));
  };
  return {
    subscribe,
    toggle(id: string, force?: boolean) {
      update((prev) => {
        const next = new Set(prev);
        if (force === true) next.add(id);
        else if (force === false) next.delete(id);
        else next.has(id) ? next.delete(id) : next.add(id);
        persist(next);
        return next;
      });
    },
    setMany(ids: string[], open: boolean) {
      update((prev) => {
        const next = new Set(prev);
        for (const id of ids) open ? next.add(id) : next.delete(id);
        persist(next);
        return next;
      });
    },
    clear() {
      set(new Set());
      if (browser) localStorage.removeItem(KEY);
    }
  };
}
export const expanded = createExpandedStore();
