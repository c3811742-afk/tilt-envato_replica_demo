import type { Locale } from '@/shared/theme';

// Fills {placeholders} in a text string: fillText('By {name}', { name: 'Sara' }) -> 'By Sara'.
export const fillText = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));

// Unicode "first strong isolate" (U+2068) and "pop directional isolate" (U+2069) marks.
const isolateStart = String.fromCharCode(0x2068);
const isolateEnd = String.fromCharCode(0x2069);

// Wraps user-written text (a name, a title) placed inside a sentence so its direction can't flip the sentence:
// "By أحمد نبيل" stays left to right in English, and an English name stays readable in Arabic.
export const isolate = (value: string) => `${isolateStart}${value}${isolateEnd}`;

// ['A', 'B', 'C'] -> "A, B, and C" / "A وB وC"
export const formatList = (items: string[], locale: Locale) =>
  new Intl.ListFormat(locale, { type: 'conjunction' }).format(items);
