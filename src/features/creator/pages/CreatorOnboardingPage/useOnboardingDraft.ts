import { useEffect, useState } from 'react';
import { onboardingSteps, emptyApplication, emptyDraft, type OnboardingDraft } from './onboardingModel';
import { storageKeys } from '@/shared/constants';
import { storage } from '@/shared/utils';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

// The saved draft. Anything missing or malformed falls back to an empty application.
const loadDraft = (): OnboardingDraft => {
  const raw = storage.get(storageKeys.creatorOnboarding);
  if (!raw) return emptyDraft;
  try {
    const saved: unknown = JSON.parse(raw);
    if (!isRecord(saved) || !isRecord(saved.values)) return emptyDraft;
    const index = typeof saved.stepIndex === 'number' ? saved.stepIndex : 0;
    return {
      stepIndex: Math.min(Math.max(index, 0), onboardingSteps.length - 1),
      values: {
        ...emptyApplication,
        ...(saved.values as Partial<OnboardingDraft['values']>),
      },
      receipt: isRecord(saved.receipt) ? (saved.receipt as unknown as OnboardingDraft['receipt']) : null,
    };
  } catch (error) {
    // A corrupted draft starts a new application instead of breaking the page.
    console.error(error);
    return emptyDraft;
  }
};

// The application in progress, saved on every change so the user can leave and come back.
export const useOnboardingDraft = () => {
  const [draft, setDraft] = useState(loadDraft);
  useEffect(() => {
    storage.set(storageKeys.creatorOnboarding, JSON.stringify(draft));
  }, [draft]);
  return { draft, setDraft, resetDraft: () => setDraft(emptyDraft) };
};
