import {
  dateRanges,
  durationRanges,
  filterKeys,
  formatSoftware,
  lengthRanges,
  madeInCountry,
  tempoRanges,
  type FilterKey,
} from '@/shared/constants';
import type { Facets, FilterValues, Item } from '@/shared/types';

const dayMs = 24 * 60 * 60 * 1000;

// The range a number falls in: rangeOf(42, { short: [0, 15], medium: [15, 60] }) -> 'medium'.
const rangeOf = (value: number | undefined, ranges: Record<string, readonly [number, number]>) =>
  value === undefined
    ? []
    : Object.entries(ranges)
        .filter(([, [from, to]]) => value >= from && value < to)
        .map(([name]) => name);

// Every "uploaded in the past …" range an item falls in (a week-old item is also in the past month and year).
const dateRangesOf = (createdAt: string, now: number) => {
  const ageDays = (now - new Date(createdAt).getTime()) / dayMs;
  return Object.entries(dateRanges)
    .filter(([, days]) => ageDays <= days)
    .map(([name]) => name);
};

const yes = (flag: boolean) => (flag ? ['yes'] : []);

// The values an item has for one filter. A filter matches when the item has any of the selected values.
export const itemFilterValues = (item: Item, key: FilterKey, now: number): string[] => {
  switch (key) {
    case 'software':
      return [...new Set(item.formats.map((format) => formatSoftware[format]).filter((app) => app !== undefined))];
    case 'fileType':
      return item.formats;
    case 'resolution':
      return item.resolution ? [item.resolution] : [];
    case 'orientation':
      return item.orientation ? [item.orientation] : [];
    case 'duration':
      return item.categoryId === 'music' ? [] : rangeOf(item.duration, durationRanges);
    case 'color':
      return item.color ? [item.color] : [];
    case 'date':
      return dateRangesOf(item.createdAt, now);
    case 'plugins':
      return item.plugins ? (item.plugins.length ? item.plugins : ['none']) : [];
    case 'mood':
      return item.music?.moods ?? [];
    case 'genre':
      return item.music?.genres ?? [];
    case 'theme':
      return item.music?.themes ?? [];
    case 'length':
      return item.music ? rangeOf(item.duration, lengthRanges) : [];
    case 'tempo':
      return item.music ? rangeOf(item.music.bpm, tempoRanges) : [];
    case 'contentId':
      return item.music ? [item.music.contentId] : [];
    case 'fontCategory':
      return item.font ? [item.font.category] : [];
    case 'optimumSize':
      return item.font ? [item.font.optimumSize] : [];
    case 'spacing':
      return item.font ? [item.font.spacing] : [];
    case 'bilingual':
      return yes(item.bilingual);
    case 'madeInEgypt':
      return yes(item.creator.country === madeInCountry);
  }
};

const matchesFilter = (item: Item, key: FilterKey, selected: string[] | undefined, now: number) =>
  !selected?.length || itemFilterValues(item, key, now).some((value) => selected.includes(value));

// Items that match every selected filter, except `ignore` (used to count that filter's own options).
export const applyFilters = (items: readonly Item[], filters: FilterValues, now: number, ignore?: FilterKey) =>
  items.filter((item) => filterKeys.every((key) => key === ignore || matchesFilter(item, key, filters[key], now)));

// How many results each option would have if it were picked, given the other selected filters.
export const countFacets = (items: readonly Item[], filters: FilterValues, now: number): Facets =>
  Object.fromEntries(
    filterKeys.map((key) => {
      const counts: Record<string, number> = {};
      for (const item of applyFilters(items, filters, now, key)) {
        for (const value of itemFilterValues(item, key, now)) counts[value] = (counts[value] ?? 0) + 1;
      }
      return [key, counts];
    }),
  );

// How many filter options are selected (shown on the phone "Filters" button).
export const countSelectedFilters = (filters: FilterValues) =>
  Object.values(filters).reduce((total, values) => total + (values?.length ?? 0), 0);
