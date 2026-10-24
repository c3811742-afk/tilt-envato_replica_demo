import type { OptionalCookieCategory } from '@/shared/constants';

// The user's cookie choice. Optional groups are off until the user turns them on.
export type CookieConsent = Record<OptionalCookieCategory, boolean> & {
  decidedAt: string; // ISO date
};
