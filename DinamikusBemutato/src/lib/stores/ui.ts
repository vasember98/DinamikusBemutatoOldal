import { writable, readable, derived } from 'svelte/store';
import { browser } from '$app/environment';

/**
 * Small helper to persist a writable store in localStorage (SSR-safe).
 */
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
        /* ignore quota/privacy errors */
      }
    });
  }
  return store;
}

/**
 * MatchMedia → readable<boolean> (SSR-safe).
 */
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

/** Top-level visibility of the sidebar (hamburger toggles this). */
export const sidebarVisible = persistentWritable<boolean>('ui:sidebarVisible', true);

/** User-resized width in pixels (if you add a resize handle). */
export const sidebarWidth = persistentWritable<number>('ui:sidebarWidth', 288); // 72 * 4px

/** Whether viewport is below the lg breakpoint (Tailwind ~1024px). */
export const isNarrow = mediaQueryStore('(max-width: 1023.98px)', false);

/**
 * Prefer showing the sidebar as an overlay drawer on narrow screens.
 * You can use this to switch between fixed and drawer variants.
 */
export const useOverlaySidebar = derived(isNarrow, (narrow) => narrow);

/** Reduced-motion preference (for toggles/animations). */
export const prefersReducedMotion = mediaQueryStore('(prefers-reduced-motion: reduce)', false);

/** Convenience helpers if you want to control width programmatically. */
export const setSidebarWidth = (px: number) => {
  const clamped = Math.max(200, Math.min(px, 480));
  sidebarWidth.set(clamped);
};
export const resetSidebarWidth = () => sidebarWidth.set(288);
/** Programmatic controls */
export const openSidebar = () => sidebarVisible.set(true);
export const closeSidebar = () => sidebarVisible.set(false);
export const toggleSidebar = () =>
  sidebarVisible.update((v) => !v);

