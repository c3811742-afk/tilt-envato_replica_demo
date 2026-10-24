import type { Locale } from '@/shared/theme';
// Fills {placeholders} in a UI string: fillText('{count} results', { count: '12' }) -> '12 results'.
// Format numbers and prices first (formatNumber, formatPrice) so they follow the active language.
export const fillText = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));

// Unicode "first strong isolate" (U+2068) and "pop directional isolate" (U+2069) marks.
const isolateStart = String.fromCharCode(0x2068);
const isolateEnd = String.fromCharCode(0x2069);

// Wraps user-written text (a name, a title) placed inside a sentence so its direction can't flip the sentence:
// "By أحمد نبيل" stays left to right in English, and an English name stays readable in Arabic.
export const isolate = (value: string) => `${isolateStart}${value}${isolateEnd}`;

// ['A', 'B', 'C'] -> "A, B, and C" / "A وB وC". With type 'unit': "A, B, C" (for lists of choices).
export const formatList = (items: string[], locale: Locale, type: Intl.ListFormatType = 'conjunction') =>
  new Intl.ListFormat(locale, { type }).format(items);
