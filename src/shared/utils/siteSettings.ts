import { storageKeys } from '@/shared/constants';
import { mockPlans, mockPrograms, mockPromoCodes } from '@/shared/mocks';
import type { CategoryId, EmptySearch, Plan, Program, PromoCode, SentSearchReport } from '@/shared/types';
import { createStoredValue } from './storedValue';

// What the admin team changes on the site, kept in this browser's storage. Until the team saves something,
// the site uses its built-in data. The admin pages write these; the customer pages read them.

const isList = <T>(value: unknown): value is T[] => Array.isArray(value);

// Every plan, with the team's prices and limits. Plans no longer sold are kept for their subscribers.
export const planStore = createStoredValue<Plan[]>(storageKeys.plans, isList, () => mockPlans);

// The plans on sale (the pricing page and checkout).
export const plansOnSale = () => planStore.get().filter((plan) => plan.active !== false);

export const findPlanById = (id: string) => planStore.get().find((plan) => plan.id === id);

export const promoCodeStore = createStoredValue<PromoCode[]>(storageKeys.promoCodes, isList, () => mockPromoCodes);

// The order of the categories on the site, and the ones hidden from category lists (their items stay searchable).
export interface CategorySettings {
  order: CategoryId[];
  hidden: CategoryId[];
}

const isCategorySettings = (value: unknown): value is CategorySettings =>
  typeof value === 'object' && value !== null && 'order' in value && 'hidden' in value;

export const categorySettingsStore = createStoredValue<CategorySettings>(storageKeys.categorySettings, isCategorySettings, () => ({
  order: [],
  hidden: [],
}));

// Sorts by the team's order; categories it hasn't placed keep their usual order after the placed ones.
export const byCategoryOrder = <T extends { id: CategoryId }>(list: T[]) => {
  const { order } = categorySettingsStore.get();
  const rank = (id: CategoryId) => (order.includes(id) ? order.indexOf(id) : order.length);
  return [...list].sort((a, b) => rank(a.id) - rank(b.id));
};

// Tags the team renamed or merged (old -> new) or banned (old -> null). Items show their tags with these applied.
export type TagEdits = Record<string, string | null>;

const isTagEdits = (value: unknown): value is TagEdits => typeof value === 'object' && value !== null && !Array.isArray(value);

export const tagEditStore = createStoredValue<TagEdits>(storageKeys.tagEdits, isTagEdits, () => ({}));

const maxRenames = 10; // a tag renamed again and again still ends somewhere

// An item's tags as the team left them: renamed and merged ones replaced, banned ones gone, no repeats.
export const editedTags = (tags: readonly string[], edits: TagEdits = tagEditStore.get()) => {
  const resolve = (tag: string): string | null => {
    let current: string | null = tag;
    for (let step = 0; step < maxRenames && current !== null && current in edits; step += 1) current = edits[current];
    return current;
  };
  return [...new Set(tags.map(resolve).filter((tag): tag is string => tag !== null))];
};

// What customers tell the team about search, read in the admin's search insights.
export const searchReportStore = createStoredValue<SentSearchReport[]>(storageKeys.searchReports, isList, () => []);
export const emptySearchStore = createStoredValue<EmptySearch[]>(storageKeys.emptySearches, isList, () => []);

const emptySearchesKept = 500; // the newest ones; older ones are dropped

// Remembers a search that found nothing (typed searches only).
export const logEmptySearch = (term: string) => {
  const trimmed = term.trim();
  if (!trimmed) return;
  emptySearchStore.set([{ term: trimmed, at: new Date().toISOString() }, ...emptySearchStore.get()].slice(0, emptySearchesKept));
};

// Student programs and competitions the team runs (set up in the admin), shown on the Become an author page.
export const programStore = createStoredValue<Program[]>(storageKeys.programs, isList, () => mockPrograms);

// The ones still to come or open today, soonest first.
export const currentPrograms = (day: string = new Date().toISOString().slice(0, 10)) =>
  programStore
    .get()
    .filter((program) => program.endDate >= day)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
