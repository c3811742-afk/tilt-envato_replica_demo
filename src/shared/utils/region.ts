import { arabicCountries, countryCurrencies, displayCurrencies, fallbackCurrency, fallbackSuggestedLocale, timeZoneCountries, type DisplayCurrency } from '@/shared/constants';
import { isLocale, type Locale } from '@/shared/theme';

// The visitor's country from their device's time zone, or null when it isn't one we know.
export const detectCountry = (): string | null => {
  try {
    return timeZoneCountries[Intl.DateTimeFormat().resolvedOptions().timeZone] ?? null;
  } catch {
    // Older browsers without time zone support: we just don't know the country.
    return null;
  }
};

// The language to offer: the browser's language when we support it, otherwise the country's.
export const suggestLocale = (): Locale => {
  for (const language of navigator.languages ?? [navigator.language]) {
    const base = language.split('-')[0];
    if (isLocale(base)) return base;
  }
  const country = detectCountry();
  return country && arabicCountries.includes(country) ? 'ar' : fallbackSuggestedLocale;
};

export const suggestCurrency = (): DisplayCurrency => countryCurrencies[detectCountry() ?? ''] ?? fallbackCurrency;

export const isDisplayCurrency = (value: unknown): value is DisplayCurrency =>
  typeof value === 'string' && value in displayCurrencies;

// An amount in Egyptian pounds, converted to another currency for display.
export const convertPrice = (amount: number, currency: DisplayCurrency) => amount * displayCurrencies[currency].rate;
