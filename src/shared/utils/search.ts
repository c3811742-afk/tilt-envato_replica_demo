import {
  arabicPrefixes,
  arabicStemMinLength,
  bilingualTerms,
  defaultSort,
  formatSoftware,
  naturalSearch,
  searchStopWords,
  searchSynonyms,
  searchWeights,
  texts,
  type SortOption,
} from '@/shared/constants';
import { categoryIds, type Category, type CategoryId, type Item } from '@/shared/types';

// Arabic short vowels, hamza marks and tatweel, plus Latin accents, are ignored when matching.
const ignoredMarks = /[̀-ًͯ-ٰٟـ]/g;

// Lower-cases and simplifies text so "أخبار" matches "اخبار" and "مدرسة" matches "مدرسه".
export const normalizeSearchText = (value: string) =>
  value
    .normalize('NFKD')
    .replace(ignoredMarks, '')
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[^\p{L}\p{N}\s+-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// A filter box inside a page (downloads, collections): true when any of the values contains the query.
export const matchesText = (query: string, ...values: (string | undefined)[]) => {
  const wanted = normalizeSearchText(query);
  return !wanted || values.some((value) => value !== undefined && normalizeSearchText(value).includes(wanted));
};

const stopWords = new Set(searchStopWords.map(normalizeSearchText));
const synonyms = new Map(
  Object.entries(searchSynonyms).map(([word, meanings]) => [normalizeSearchText(word), meanings.map(normalizeSearchText)]),
);
const prefixes = arabicPrefixes.map(normalizeSearchText);

// The same word in the other language, both ways ("مطعم" <-> "restaurant").
const translations = bilingualTerms.reduce((map, [en, ar]) => {
  const [english, arabic] = [normalizeSearchText(en), normalizeSearchText(ar)];
  map.set(english, [...(map.get(english) ?? []), arabic]);
  map.set(arabic, [...(map.get(arabic) ?? []), english]);
  return map;
}, new Map<string, string[]>());

// A word and what it means: its synonyms, for Arabic the word without a joined prefix, and all of these in the
// other language, so a search finds the same items in English and Arabic.
const alternativesOf = (word: string) => {
  const meanings = new Set([word, ...(synonyms.get(word) ?? [])]);
  for (const prefix of prefixes) {
    const stem = word.slice(prefix.length);
    if (word.startsWith(prefix) && stem.length >= arabicStemMinLength) {
      meanings.add(stem);
      for (const meaning of synonyms.get(stem) ?? []) meanings.add(meaning);
    }
  }
  // Its translations, and their other forms in the first language ("مطعم" -> "restaurant" -> "مطاعم").
  const alternatives = new Set(meanings);
  for (const meaning of meanings) {
    for (const translation of translations.get(meaning) ?? []) {
      alternatives.add(translation);
      for (const form of translations.get(translation) ?? []) alternatives.add(form);
    }
  }
  return [...alternatives];
};

export interface ParsedQuery {
  words: string[][]; // each searched word with its alternatives
  required: string[][]; // words written as +word, or from advanced search "must include"
  excluded: string[]; // words written as -word, or from advanced search "exclude"
}

const splitWords = (text: string) => normalizeSearchText(text).split(' ').filter(Boolean);

// Reads a search box query: "+word" must match, "-word" must not, stop words are dropped.
export const parseQuery = (query = '', mustInclude = '', exclude = ''): ParsedQuery => {
  const words: string[][] = [];
  const required: string[][] = splitWords(mustInclude).map(alternativesOf);
  const excluded: string[] = splitWords(exclude);
  for (const word of splitWords(query)) {
    if (word.length > 1 && word.startsWith('-')) excluded.push(word.slice(1));
    else if (word.length > 1 && word.startsWith('+')) required.push(alternativesOf(word.slice(1)));
    else if (!stopWords.has(word)) words.push(alternativesOf(word.replace(/^[+-]+/, '')));
  }
  return { words: words.filter((alternatives) => alternatives[0]), required, excluded };
};

export const isEmptyQuery = ({ words, required, excluded }: ParsedQuery) => !words.length && !required.length && !excluded.length;

// A piece of text split into words, each also without a joined Arabic prefix ("الشعار" is also "شعار").
type Words = string[];

const wordsOf = (text: string): Words =>
  normalizeSearchText(text)
    .split(' ')
    .flatMap((word) => [word, ...prefixes.filter((prefix) => word.startsWith(prefix) && word.length - prefix.length >= arabicStemMinLength).map((prefix) => word.slice(prefix.length))]);

// The text of an item that search looks at, split into words once per item.
interface SearchFields {
  titles: Words;
  tags: string[]; // whole tags, normalized ("real estate")
  tagWords: Words;
  formats: Words; // file types ("psd", "mp4")
  meta: Words; // category, occasion and business names, and labels of its filter values, in both languages
  creator: Words;
  descriptions: Words;
}

const fieldCache = new WeakMap<Item, SearchFields>();

const labelsOf = (item: Item, categories: readonly Pick<Category, 'id' | 'keywords'>[]) =>
  Object.values(texts).flatMap((text) => [
    text.categories[item.categoryId].name,
    ...item.occasions.map((occasion) => text.browse.occasions[occasion]),
    ...item.businesses.map((business) => text.browse.businesses[business]),
    ...(item.music
      ? [
          ...item.music.moods.map((mood) => text.filters.mood.options[mood]),
          ...item.music.genres.map((genre) => text.filters.genre.options[genre]),
          ...item.music.themes.map((theme) => text.filters.theme.options[theme]),
        ]
      : []),
    ...(item.font ? [text.filters.fontCategory.options[item.font.category]] : []),
    ...(item.orientation ? [text.filters.orientation.options[item.orientation]] : []),
    ...(item.resolution ? [text.filters.resolution.options[item.resolution]] : []),
    // The apps that open its files ("photoshop", "after effects").
    ...item.formats.flatMap((format) => {
      const app = formatSoftware[format];
      return app ? [text.filters.software.options[app]] : [];
    }),
    ...(categories.find((category) => category.id === item.categoryId)?.keywords ?? []),
  ]);

const fieldsOf = (item: Item, categories: readonly Pick<Category, 'id' | 'keywords'>[]) => {
  let fields = fieldCache.get(item);
  if (!fields) {
    fields = {
      titles: Object.values(item.title).flatMap(wordsOf),
      tags: item.tags.map(normalizeSearchText),
      tagWords: item.tags.flatMap(wordsOf),
      formats: item.formats.map(normalizeSearchText),
      meta: labelsOf(item, categories).flatMap(wordsOf),
      creator: wordsOf(item.creator.name),
      descriptions: Object.values(item.description).flatMap(wordsOf),
    };
    fieldCache.set(item, fields);
  }
  return fields;
};

// A searched word matches words that start with it ("logo" finds "logos"); short words must match exactly
// ("ai" is a file type, not the start of "aired").
const matches = (words: Words, word: string) =>
  word.length < 3 ? words.includes(word) : words.some((candidate) => candidate.startsWith(word));

// How well one word (any of its alternatives) matches an item; 0 = not at all.
const wordScore = (fields: SearchFields, alternatives: string[]) =>
  Math.max(
    ...alternatives.map((word) =>
      Math.max(
        matches(fields.titles, word) ? searchWeights.title : 0,
        fields.tags.includes(word) || fields.formats.includes(word) ? searchWeights.tag : matches(fields.tagWords, word) ? searchWeights.tagWord : 0,
        matches(fields.meta, word) ? searchWeights.meta : 0,
        matches(fields.creator, word) ? searchWeights.creator : 0,
        matches(fields.descriptions, word) ? searchWeights.description : 0,
      ),
    ),
  );

export interface ScoredItem {
  item: Item;
  matched: number; // how many of the searched words it matches
  score: number;
}

// Items that match a parsed query, with how well they match. Short queries need every word;
// descriptive ones ("calm oud music for a Ramadan video") need most of them.
export const matchItems = (
  items: readonly Item[],
  categories: readonly Pick<Category, 'id' | 'keywords'>[],
  parsed: ParsedQuery,
): ScoredItem[] => {
  const { words, required, excluded } = parsed;
  const needed =
    words.length <= naturalSearch.strictWordCount ? words.length : Math.ceil(words.length * naturalSearch.minMatchShare);

  const scored = items.flatMap((item) => {
    const fields = fieldsOf(item, categories);
    if (excluded.some((word) => wordScore(fields, [word]) > 0)) return [];
    if (required.some((alternatives) => wordScore(fields, alternatives) === 0)) return [];
    const scores = words.map((alternatives) => wordScore(fields, alternatives));
    const matched = scores.filter((score) => score > 0).length;
    return matched > 0 || !words.length ? [{ item, matched, score: scores.reduce((total, score) => total + score, 0) }] : [];
  });
  const close = scored.filter(({ matched }) => matched >= needed);
  // A descriptive search that finds too little also shows the nearest items (relevance puts the closest first).
  const descriptive = words.length > naturalSearch.strictWordCount;
  return descriptive && close.length < naturalSearch.minResults ? scored : close;
};

const byNewest = (a: Item, b: Item) => b.createdAt.localeCompare(a.createdAt);
const byPopular = (a: Item, b: Item) => b.downloads - a.downloads;
export const byTrending = (a: Item, b: Item) => b.recentDownloads - a.recentDownloads;

// Sorts scored items. "Most relevant" ranks by matched words, then score; with no query it's the most popular.
export const sortScored = (scored: ScoredItem[], sort: SortOption = defaultSort) =>
  [...scored]
    .sort((a, b) => {
      if (sort === 'newest') return byNewest(a.item, b.item);
      if (sort === 'popular') return byPopular(a.item, b.item);
      return b.matched - a.matched || b.score - a.score || byPopular(a.item, b.item);
    })
    .map(({ item }) => item);

// The first items in an order, e.g. a home page row.
export const sortItems = (items: readonly Item[], sort: SortOption) =>
  sortScored(items.map((item) => ({ item, matched: 0, score: 0 })), sort);

// Items most like `target`: same category first, then the most shared tags, then the most downloaded.
export const findSimilarItems = (items: readonly Item[], target: Item, limit: number) => {
  const targetTags = new Set(target.tags.map(normalizeSearchText));
  return items
    .filter((item) => item.id !== target.id)
    .map((item) => ({
      item,
      score:
        (item.categoryId === target.categoryId ? 3 : 0) +
        item.tags.filter((tag) => targetTags.has(normalizeSearchText(tag))).length,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || byPopular(a.item, b.item))
    .slice(0, limit)
    .map(({ item }) => item);
};

// Items most often downloaded in the same project as `target` (groups of items downloaded together).
export const findDownloadedTogether = (
  items: readonly Item[],
  groups: readonly string[][],
  target: Item,
  limit: number,
) => {
  const counts = new Map<string, number>();
  for (const group of groups) {
    if (!group.includes(target.id)) continue;
    for (const id of group) if (id !== target.id) counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return [...counts]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => items.find((item) => item.id === id))
    .filter((item): item is Item => item !== undefined)
    .slice(0, limit);
};

export const isCategoryId = (value: unknown): value is CategoryId =>
  typeof value === 'string' && (categoryIds as readonly string[]).includes(value);

// True when `value` is one of `options` (narrows URL parameters to a known list).
export const isOneOf = <T extends string>(value: unknown, options: readonly T[]): value is T =>
  typeof value === 'string' && (options as readonly string[]).includes(value);
