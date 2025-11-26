import { writable, readable, derived } from 'svelte/store';
import { browser } from '$app/environment';
function persistentWritable<T>(key: string, initial: T) {
  const start = () => {
    if (!browser) return initial;
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? initial : (JSON.parse(raw) as T);
    } catch {
      return initial;
    }
  };
  const store = writable<T>(start());
  if (browser) {
    store.subscribe((v) => {
      try {
        localStorage.setItem(key, JSON.stringify(v));
      } catch {
      }
    });
  }
  return store;
}
function mediaQueryStore(query: string, fallback = false) {
  return readable<boolean>(fallback, (set) => {
    if (!browser) return () => {};
    const mql = window.matchMedia(query);
    const update = () => set(mql.matches);
    update();
    mql.addEventListener?.('change', update);
    return () => mql.removeEventListener?.('change', update);
  });
}
export const sidebarVisible = persistentWritable<boolean>('ui:sidebarVisible', true);
export const sidebarWidth = persistentWritable<number>('ui:sidebarWidth', 288);
export const isNarrow = mediaQueryStore('(max-width: 1023.98px)', false);
export const useOverlaySidebar = derived(isNarrow, (narrow) => narrow);
export const prefersReducedMotion = mediaQueryStore('(prefers-reduced-motion: reduce)', false);
export const setSidebarWidth = (px: number) => {
  const clamped = Math.max(200, Math.min(px, 480));
  sidebarWidth.set(clamped);
};
export const resetSidebarWidth = () => sidebarWidth.set(288);
export const openSidebar = () => sidebarVisible.set(true);
export const closeSidebar = () => sidebarVisible.set(false);
export const toggleSidebar = () =>
  sidebarVisible.update((v) => !v);
