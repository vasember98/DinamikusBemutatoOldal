import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'sidebar:expanded';

function createExpandedStore() {
  let initialState: Set<string>;
  
  if (browser) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const arr = stored ? JSON.parse(stored) : [];
      initialState = new Set(arr);
    } catch (e) {
      initialState = new Set<string>();
    }
  } else {
    initialState = new Set<string>();
  }
  
  const store = writable<Set<string>>(initialState);
  const { subscribe, set, update } = store;
  
  function saveToStorage(expandedIds: Set<string>) {
    if (browser) {
      const arr = Array.from(expandedIds);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    }
  }
  
  return {
    subscribe,
    
    toggle(id: string, force?: boolean) {
      update((current) => {
        const updated = new Set(current);
        
        if (force === true) {
          updated.add(id);
        } else if (force === false) {
          updated.delete(id);
        } else {
          if (updated.has(id)) {
            updated.delete(id);
          } else {
            updated.add(id);
          }
        }
        
        saveToStorage(updated);
        return updated;
      });
    },
    
    setMany(ids: string[], shouldOpen: boolean) {
      update((current) => {
        const updated = new Set(current);
        
        ids.forEach(id => {
          if (shouldOpen) {
            updated.add(id);
          } else {
            updated.delete(id);
          }
        });
        
        saveToStorage(updated);
        return updated;
      });
    },
    
    clear() {
      set(new Set());
      if (browser) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  };
}

export const expanded = createExpandedStore();
