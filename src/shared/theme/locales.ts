// `intl` is the tag passed to Intl formatters: Egyptian region, Western digits (0-9) in both languages.
export const locales = {
  en: { lang: 'en', dir: 'ltr', intl: 'en-EG' },
  ar: { lang: 'ar', dir: 'rtl', intl: 'ar-EG-u-nu-latn' },
} as const;

export type Locale = keyof typeof locales;
export type Direction = (typeof locales)[Locale]['dir'];

// Arabic first: the demo is built for the Egyptian market.
export const defaultLocale: Locale = 'ar';

export const localeCodes = Object.keys(locales) as Locale[];

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && localeCodes.includes(value as Locale);
