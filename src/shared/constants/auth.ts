// Sign-in methods. "email" uses a password; the others are simulated in the demo (no backend).
export const authProviders = ['email', 'google', 'apple', 'facebook'] as const;
export type AuthProvider = (typeof authProviders)[number];
export const socialProviders = ['google', 'apple', 'facebook'] as const satisfies readonly AuthProvider[];
export type SocialProvider = (typeof socialProviders)[number];

export const auth = {
  passwordMinLength: 8,
  codeLength: 6, // email and phone verification, password reset
  codeValidMinutes: 10,
  resendCooldownSeconds: 30,
} as const;

// Egyptian mobile numbers: shown with the country code, stored in national format (01XXXXXXXXX).
export const phoneCountryCode = '+20';

// Shown on the terms and privacy pages.
export const termsUpdatedAt = '2026-10-01';
export const privacyUpdatedAt = '2026-10-01';

// Query parameter that carries the page to return to after signing in (e.g. the checkout).
export const returnToParam = 'next';
