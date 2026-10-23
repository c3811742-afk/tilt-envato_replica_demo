import { useSyncExternalStore } from 'react';
import type { StoredValue } from '@/shared/utils';

// The current value of a stored preference and a setter; every component using it updates together.
export const useStoredValue = <T>(store: StoredValue<T>) => [useSyncExternalStore(store.subscribe, store.get), store.set] as const;
