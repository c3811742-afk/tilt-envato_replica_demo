import { createContext, useContext } from 'react';
import type { OptionalCookieCategory } from '@/shared/constants';
import type { CookieConsent } from '@/shared/types';

export interface CookieConsentContextValue {
  consent: CookieConsent | null; // null until the user has chosen
  save: (choices: Record<OptionalCookieCategory, boolean>) => void;
  settingsOpen: boolean;
  openSettings: () => void; // e.g. from "Cookie settings" in the footer
  closeSettings: () => void;
}

export const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

// The user's cookie choice, and the cookie settings dialog.
export const useCookieConsent = () => {
  const context = useContext(CookieConsentContext);
  if (!context) throw new Error('useCookieConsent must be used inside <CookieConsentProvider>');
  return context;
};
