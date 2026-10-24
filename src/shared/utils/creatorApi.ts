import { storageKeys } from '@/shared/constants';
import type { CreatorApplication, CreatorApplicationReceipt } from '@/shared/types';
import { call, signedInAccount } from './accountStore';
import { respondError } from './mockResponse';
import { readApplications, resourcesApi } from './resourcesApi';
import { storage } from './storage';

// Demo stand-in for the creator application server. A submitted application goes into the same list the
// admin team reviews (Admin › Creators › Applications), tied to the applicant's account.
export const creatorApi = {
  submitApplication: async (application: CreatorApplication): Promise<CreatorApplicationReceipt> => {
    if (!application.acceptAgreement) return respondError(new Error('The creator agreement was not accepted'));
    const account = await call(() => signedInAccount());
    const id = await resourcesApi.apply({
      kind: 'author',
      name: application.displayName.trim() || application.legalName.trim(),
      email: account.email,
      portfolio: application.portfolioUrl,
      categories: application.specialties,
      about: application.about,
      accountId: account.id,
    });
    return { id, submittedAt: new Date().toISOString() };
  },
};

// The admin team's decision on an application: still waiting, approved, or rejected with a reason.
export interface CreatorApplicationStatus {
  status: 'pending' | 'approved' | 'rejected';
  reason?: string; // one of text.admin.creators.applicationReasons when rejected
  decidedAt?: string;
}

export const creatorApplicationStatus = (reference: string): CreatorApplicationStatus => {
  const saved = readApplications().find((application) => application.reference === reference);
  if (!saved?.status || saved.status === 'pending') return { status: 'pending' };
  return { status: saved.status, reason: saved.decision?.reason, decidedAt: saved.decision?.at };
};

// For live status pages: runs `onChange` when the applications change in another tab (e.g. an admin decides).
export const subscribeToApplications = (onChange: () => void) => {
  const listener = (event: StorageEvent) => {
    if (event.key === storageKeys.applications) onChange();
  };
  window.addEventListener('storage', listener);
  return () => window.removeEventListener('storage', listener);
};

// The raw list, as a stable value for useSyncExternalStore (a string changes only when the list does).
export const applicationsSnapshot = () => storage.get(storageKeys.applications) ?? '';
