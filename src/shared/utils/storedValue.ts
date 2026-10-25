import { storage } from './storage';

export interface StoredValue<T> {
  get: () => T;
  set: (value: T) => void;
  subscribe: (listener: () => void) => () => void;
}

// A preference kept in localStorage that components can subscribe to (see useStoredValue).
// A missing or invalid stored value reads as `fallback()`.
export const createStoredValue = <T>(key: string, isValid: (value: unknown) => value is T, fallback: () => T): StoredValue<T> => {
  const listeners = new Set<() => void>();
  // The last value read, so the same stored text always returns the same value (React compares snapshots).
  let cache: { raw: string | null; value: T } | null = null;

  const get = () => {
    const raw = storage.get(key);
    if (cache && cache.raw === raw) return cache.value;
    let value = fallback();
    if (raw !== null) {
      try {
        const parsed: unknown = JSON.parse(raw);
        if (isValid(parsed)) value = parsed;
      } catch {
        // An old or hand-edited value that isn't JSON: use the fallback.
      }
    }
    cache = { raw, value };
    return value;
  };

  return {
    get,
    set: (value) => {
      storage.set(key, JSON.stringify(value));
      cache = { raw: storage.get(key), value };
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      // Changed in another tab (e.g. the admin open next to the site): read it again.
      const onStorage = (event: StorageEvent) => {
        if (event.key === null || event.key === key) listener();
      };
      window.addEventListener('storage', onStorage);
      return () => {
        listeners.delete(listener);
        window.removeEventListener('storage', onStorage);
      };
    },
  };
};
