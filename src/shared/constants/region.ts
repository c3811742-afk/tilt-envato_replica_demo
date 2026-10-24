import type { Locale } from '@/shared/theme';

// Currencies prices can be shown in. Payments are always in Egyptian pounds; other currencies are shown
// converted with these approximate rates (how much of the currency one pound buys).
export const displayCurrencies = {
  EGP: { rate: 1, fractionDigits: 0 },
  USD: { rate: 0.0206, fractionDigits: 2 },
  EUR: { rate: 0.0177, fractionDigits: 2 },
  GBP: { rate: 0.0154, fractionDigits: 2 },
  SAR: { rate: 0.0773, fractionDigits: 0 },
  AED: { rate: 0.0757, fractionDigits: 0 },
} as const;

export type DisplayCurrency = keyof typeof displayCurrencies;
export const displayCurrencyCodes = Object.keys(displayCurrencies) as DisplayCurrency[];

// The currency shown to visitors from a country we can't match below.
export const fallbackCurrency: DisplayCurrency = 'USD';

export const countryCurrencies: Partial<Record<string, DisplayCurrency>> = {
  EG: 'EGP',
  US: 'USD',
  GB: 'GBP',
  SA: 'SAR',
  AE: 'AED',
  DE: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  NL: 'EUR',
  PT: 'EUR',
  IE: 'EUR',
};

// The visitor's country, guessed from their device's time zone (no location access is needed).
export const timeZoneCountries: Partial<Record<string, string>> = {
  'Africa/Cairo': 'EG',
  'Asia/Riyadh': 'SA',
  'Asia/Dubai': 'AE',
  'Asia/Kuwait': 'KW',
  'Asia/Qatar': 'QA',
  'Asia/Bahrain': 'BH',
  'Asia/Muscat': 'OM',
  'Asia/Amman': 'JO',
  'Asia/Beirut': 'LB',
  'Asia/Baghdad': 'IQ',
  'Asia/Damascus': 'SY',
  'Asia/Gaza': 'PS',
  'Asia/Hebron': 'PS',
  'Asia/Aden': 'YE',
  'Africa/Tripoli': 'LY',
  'Africa/Tunis': 'TN',
  'Africa/Algiers': 'DZ',
  'Africa/Casablanca': 'MA',
  'Africa/Khartoum': 'SD',
  'Europe/London': 'GB',
  'Europe/Dublin': 'IE',
  'Europe/Berlin': 'DE',
  'Europe/Paris': 'FR',
  'Europe/Rome': 'IT',
  'Europe/Madrid': 'ES',
  'Europe/Amsterdam': 'NL',
  'Europe/Lisbon': 'PT',
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Los_Angeles': 'US',
};

// Countries where Arabic is the main language: visitors from them are offered the Arabic site.
export const arabicCountries: readonly string[] = [
  'EG', 'SA', 'AE', 'KW', 'QA', 'BH', 'OM', 'JO', 'LB', 'IQ', 'SY', 'PS', 'YE', 'LY', 'TN', 'DZ', 'MA', 'SD',
];

// The language offered when neither the browser language nor the country points to one we support.
export const fallbackSuggestedLocale: Locale = 'en';
