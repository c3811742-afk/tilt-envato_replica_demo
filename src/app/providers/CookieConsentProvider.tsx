import { useMemo, useState, type ReactNode } from 'react';
import { optionalCookieCategories, storageKeys, type OptionalCookieCategory } from '@/shared/constants';
import { CookieConsentContext } from '@/shared/hooks';
import type { CookieConsent } from '@/shared/types';
import { storage } from '@/shared/utils';

const isConsent = (value: unknown): value is CookieConsent =>
  typeof value === 'object' &&
  value !== null &&
  optionalCookieCategories.every((category) => typeof (value as Record<string, unknown>)[category] === 'boolean');

const savedConsent = (): CookieConsent | null => {
  const saved = storage.get(storageKeys.cookieConsent);
  if (!saved) return null;
  try {
    const parsed: unknown = JSON.parse(saved);
    return isConsent(parsed) ? parsed : null;
  } catch (error) {
    // A corrupted choice is treated as no choice: the banner asks again.
    console.error(error);
    return null;
  }
};

// Remembers which optional cookies the user allowed, and whether the cookie settings dialog is open.
export const CookieConsentProvider = ({ children }: { children: ReactNode }) => {
  const [consent, setConsent] = useState(savedConsent);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const value = useMemo(
    () => ({
      consent,
      settingsOpen,
      save: (choices: Record<OptionalCookieCategory, boolean>) => {
        const next: CookieConsent = { ...choices, decidedAt: new Date().toISOString() };
        storage.set(storageKeys.cookieConsent, JSON.stringify(next));
        setConsent(next);
        setSettingsOpen(false);
      },
      openSettings: () => setSettingsOpen(true),
      closeSettings: () => setSettingsOpen(false),
    }),
    [consent, settingsOpen],
  );

  return <CookieConsentContext value={value}>{children}</CookieConsentContext>;
};
