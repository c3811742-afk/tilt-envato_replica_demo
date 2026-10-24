import { storageKeys } from '@/shared/constants';
import type { StudioClaim, StudioElement, StudioPayout } from '@/shared/types';
import { storage } from './storage';

// The demo's creator server: creators' elements, payouts and copyright claims, kept in this browser.
// The admin's review queue reads and decides on the same elements.

const readList = <T>(key: string): T[] => {
  const saved = storage.get(key);
  if (!saved) return [];
  try {
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch (error) {
    // Corrupted demo data: start empty rather than breaking the app.
    console.error(error);
    return [];
  }
};

const writeList = <T>(key: string, list: T[]) => storage.set(key, JSON.stringify(list));

export const readStudioElements = () => readList<StudioElement>(storageKeys.studioElements);
export const writeStudioElements = (elements: StudioElement[]) => writeList(storageKeys.studioElements, elements);

export const saveStudioElement = (updated: StudioElement) => {
  writeStudioElements([updated, ...readStudioElements().filter((element) => element.id !== updated.id)]);
  return updated;
};

export const findStudioElement = (id: string) => readStudioElements().find((element) => element.id === id) ?? null;

export const readStudioPayouts = () => readList<StudioPayout>(storageKeys.studioPayouts);
export const writeStudioPayouts = (payouts: StudioPayout[]) => writeList(storageKeys.studioPayouts, payouts);

export const readStudioClaims = () => readList<StudioClaim>(storageKeys.studioClaims);
export const writeStudioClaims = (claims: StudioClaim[]) => writeList(storageKeys.studioClaims, claims);
