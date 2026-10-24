import { storageKeys, type PartnerProgram } from '@/shared/constants';
import { call, normalizeEmail, randomDigits } from './accountStore';
import { storage } from './storage';

// The newsletter list and program applications, kept in this browser for the demo.

// A list kept in this browser's storage (empty when missing or corrupted).
export const readList = <T>(key: string): T[] => {
  const saved = storage.get(key);
  if (!saved) return [];
  try {
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

const subscribers = () => readList<string>(storageKeys.newsletter);

export interface AuthorApplication {
  kind: 'author';
  name: string;
  email: string;
  portfolio: string;
  categories: string[];
}

export interface PartnerApplication {
  kind: PartnerProgram;
  name: string;
  email: string;
  website: string;
  audience: string;
  message: string;
}

export const resourcesApi = {
  isSubscribed: (email: string) => subscribers().includes(normalizeEmail(email)),

  // Signs up for the newsletter (signing up again changes nothing).
  subscribe: (email: string) =>
    call(() => {
      const address = normalizeEmail(email);
      storage.set(storageKeys.newsletter, JSON.stringify([...subscribers().filter((saved) => saved !== address), address]));
      return address;
    }),

  unsubscribe: (email: string) =>
    call(() => {
      const address = normalizeEmail(email);
      storage.set(storageKeys.newsletter, JSON.stringify(subscribers().filter((saved) => saved !== address)));
      return address;
    }),

  // An application to become an author or a partner. Returns its reference number.
  apply: (application: AuthorApplication | PartnerApplication) =>
    call(() => {
      const reference = `APP-${randomDigits(6)}`;
      storage.set(storageKeys.applications, JSON.stringify([...readList(storageKeys.applications), { ...application, reference, at: new Date().toISOString() }]));
      return reference;
    }),
};
