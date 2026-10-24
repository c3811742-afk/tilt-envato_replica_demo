// Narrows a string (e.g. a <select> value) to one of a known list: isOneOf(adminRoles, value).
export const isOneOf = <T extends string>(list: readonly T[], value: string): value is T =>
  (list as readonly string[]).includes(value);

// Adds the item if it's missing, removes it if it's there (for checkbox lists).
export const toggleItem = <T>(list: readonly T[], item: T): T[] =>
  list.includes(item) ? list.filter((current) => current !== item) : [...list, item];

// Case-insensitive search across several fields. An empty query matches everything.
export const matchesQuery = (query: string, fields: string[]) => {
  const needle = query.trim().toLocaleLowerCase();
  return !needle || fields.some((field) => field.toLocaleLowerCase().includes(needle));
};

// Swaps an item with its neighbor above or below. With `inGroup`, only items of the same group count as
// neighbors (e.g. subcategories of the same parent). Returns the list unchanged at either end.
export const moveItem = <T extends { id: string }>(
  list: readonly T[],
  id: string,
  direction: 'up' | 'down',
  inGroup: (item: T) => boolean = () => true,
): T[] => {
  const groupIndexes = list.flatMap((item, index) => (inGroup(item) ? [index] : []));
  const position = groupIndexes.findIndex((index) => list[index].id === id);
  const current = groupIndexes[position];
  const neighbor = groupIndexes[direction === 'up' ? position - 1 : position + 1];
  const next = [...list];
  if (position === -1 || neighbor === undefined) return next;
  [next[current], next[neighbor]] = [next[neighbor], next[current]];
  return next;
};

// The list with one item swapped for its saved version (same id).
export const replaceById = <T extends { id: string }>(list: readonly T[], saved: T) =>
  list.map((item) => (item.id === saved.id ? saved : item));

// The list with the saved item updated in place, or added at the end when it's new.
export const upsertById = <T extends { id: string }>(list: readonly T[], saved: T) =>
  list.some((item) => item.id === saved.id) ? replaceById(list, saved) : [...list, saved];

export const removeById = <T extends { id: string }>(list: readonly T[], id: string) =>
  list.filter((item) => item.id !== id);

// Compares two texts ignoring upper and lower case and outer spaces (for tag names and language codes).
export const sameText = (a: string, b: string) => a.trim().toLocaleLowerCase() === b.trim().toLocaleLowerCase();
