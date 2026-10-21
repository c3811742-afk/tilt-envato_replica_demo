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
