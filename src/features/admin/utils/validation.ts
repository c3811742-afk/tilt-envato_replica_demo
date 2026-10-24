import type { LocalizedText } from '@/features/admin/types';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (value: string) => emailPattern.test(value.trim());

// A full http(s) link, e.g. https://example.com/item/1
export const isValidLink = (value: string) => {
  const trimmed = value.trim();
  return URL.canParse(trimmed) && /^https?:\/\//i.test(trimmed);
};

// A language code like "fr" or "pt-BR".
export const isValidLanguageCode = (value: string) => /^[a-z]{2}(-[A-Z]{2})?$/.test(value.trim());

export const isBlank = (value: string) => value.trim() === '';

// The number typed in a field, or null when it's empty or not a number.
export const toNumber = (value: string) => {
  const number = Number(value.trim());
  return value.trim() !== '' && Number.isFinite(number) ? number : null;
};

// A whole number of at least `min` (e.g. seats, downloads, credits).
export const isWholeNumber = (value: string, min = 0) => {
  const number = toNumber(value);
  return number !== null && Number.isInteger(number) && number >= min;
};

// An amount of money above zero, with at most two decimals.
export const isValidAmount = (value: string) => {
  const number = toNumber(value);
  // Compared with a small margin: 19.99 * 100 is 1998.9999999999998 in floating point.
  return number !== null && number > 0 && Math.abs(Math.round(number * 100) - number * 100) < 1e-6;
};

export const trimLocalized = (value: LocalizedText): LocalizedText => ({ en: value.en.trim(), ar: value.ar.trim() });

// The {placeholders} in a text, sorted, so a translation can be checked for the same ones.
export const placeholdersOf = (value: string) => [...value.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();

export const samePlaceholders = (source: string, translation: string) =>
  placeholdersOf(source).join() === placeholdersOf(translation).join();
