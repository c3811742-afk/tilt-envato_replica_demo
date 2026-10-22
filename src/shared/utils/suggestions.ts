import { texts } from '@/shared/constants';
import type { Category, Item, SearchSuggestion } from '@/shared/types';
import { normalizeSearchText } from './search';

const arabicLetters = /[؀-ۿ]/;

// True when a word of the text starts with what was typed ("ram" matches "Ramadan", not "Instagram").
const startsAWord = (text: string, typed: string) =>
  normalizeSearchText(text)
    .split(' ')
    .some((word) => word.startsWith(typed));

const suggestionShare = { categories: 1, items: 2 } as const; // the rest of the list is search terms

// Suggestions for what the user has typed so far: matching search terms first (in the script they're typing in),
// then a category and the best matching items.
export const suggestSearches = (
  typed: string,
  items: readonly Item[],
  categories: readonly Category[],
  limit: number,
): SearchSuggestion[] => {
  const query = normalizeSearchText(typed);
  if (!query) return [];
  const arabic = arabicLetters.test(query);

  const categoryMatches: SearchSuggestion[] = categories
    .filter((category) =>
      [...Object.values(texts).map((text) => text.categories[category.id].name), ...category.keywords].some((name) =>
        normalizeSearchText(name).startsWith(query),
      ),
    )
    .slice(0, suggestionShare.categories)
    .map((category) => ({ kind: 'category', categoryId: category.id }));

  const itemMatches: SearchSuggestion[] = items
    .filter((item) => Object.values(item.title).some((title) => startsAWord(title, query)))
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, suggestionShare.items)
    .map((item) => ({ kind: 'item', item }));

  // Tags weighted by how many downloads their items have, so common terms come first.
  const termWeights = new Map<string, number>();
  for (const item of items) {
    for (const tag of item.tags) {
      const normalized = normalizeSearchText(tag);
      if (normalized === query || !startsAWord(tag, query) || arabicLetters.test(tag) !== arabic) continue;
      const bonus = normalized.startsWith(query) ? 2 : 1;
      termWeights.set(tag.toLowerCase(), (termWeights.get(tag.toLowerCase()) ?? 0) + item.downloads * bonus);
    }
  }
  const termCount = Math.max(limit - categoryMatches.length - itemMatches.length, 0);
  const terms: SearchSuggestion[] = [...termWeights]
    .sort((a, b) => b[1] - a[1])
    .slice(0, termCount)
    .map(([term]) => ({ kind: 'term', term }));

  return [...terms, ...categoryMatches, ...itemMatches].slice(0, limit);
};
