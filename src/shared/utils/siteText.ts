import { storageKeys, type Text } from '@/shared/constants';
import { createStoredValue } from './storedValue';

// Corrections to the site's text, made by the team in the admin (translations, category names):
// language code -> text key (e.g. 'categories.music.name') -> the corrected text.
export type TextEdits = Partial<Record<string, Record<string, string>>>;

const isEdits = (value: unknown): value is TextEdits => typeof value === 'object' && value !== null && !Array.isArray(value);

export const textEditStore = createStoredValue<TextEdits>(storageKeys.textEdits, isEdits, () => ({}));

// Sets one text by its dotted key, copying only the objects on the way. Keys that aren't text are left alone.
const withEdit = (value: unknown, path: string[], text: string): unknown => {
  if (path.length === 0) return typeof value === 'string' ? text : value;
  if (typeof value !== 'object' || value === null) return value;
  const [head, ...rest] = path;
  if (!(head in value)) return value;
  const child = withEdit((value as Record<string, unknown>)[head], rest, text);
  return Array.isArray(value)
    ? value.map((item, index) => (String(index) === head ? child : item))
    : { ...value, [head]: child };
};

// The site's text in one language with the team's corrections applied (empty corrections are ignored).
export const withTextEdits = (text: Text, edits: Record<string, string> = {}): Text =>
  Object.entries(edits).reduce<unknown>((current, [key, value]) => (value.trim() ? withEdit(current, key.split('.'), value) : current), text) as Text;
