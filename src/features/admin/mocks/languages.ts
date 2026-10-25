import type { LanguageInput } from '@/features/admin/types';

// The site's languages. The texts themselves come from the real text files (en.ts, ar.ts).
export const seedLanguages: LanguageInput[] = [
  { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl' },
];

// The language every other one is translated from.
export const sourceLanguageCode = 'en';
