import { storageKeys } from '@/shared/constants';
import { mockBanners, mockItems, mockOccasions } from '@/shared/mocks';
import type { HomepageSettings } from '@/shared/types';
import { originalTitle } from './itemText';
import { createStoredValue } from './storedValue';

// The home page as the admin team sets it up: featured items and collections, the month's free items,
// occasion headlines and banners. Until the team saves, it starts from the site's own picks.

const isSettings = (value: unknown): value is HomepageSettings =>
  typeof value === 'object' && value !== null && 'featured' in value && 'banners' in value;

const builtIn = (): HomepageSettings => ({
  featured: mockItems
    .filter((item) => item.featured)
    .map((item) => ({ id: `featured-${item.id}`, kind: 'element' as const, refId: item.id, title: originalTitle(item) })),
  occasions: mockOccasions,
  freeElements: [], // none chosen: the free row shows the library's free items
  banners: mockBanners,
});

export const homepageStore = createStoredValue<HomepageSettings>(storageKeys.homepage, isSettings, builtIn);

export const today = () => new Date().toISOString().slice(0, 10);

// Whether something dated (an occasion, a banner) is showing on a day (YYYY-MM-DD).
export const isShowingOn = ({ startDate, endDate }: { startDate: string; endDate: string }, day: string) =>
  startDate <= day && day <= endDate;

// The occasion showing today (the one that started last, if two overlap), or null.
export const currentOccasion = (day: string = today()) =>
  homepageStore
    .get()
    .occasions.filter((occasion) => isShowingOn(occasion, day))
    .sort((a, b) => b.startDate.localeCompare(a.startDate))[0] ?? null;

// The banner showing today, or null.
export const currentBanner = (day: string = today()) => homepageStore.get().banners.find((banner) => isShowingOn(banner, day)) ?? null;

// The featured items' ids, in order, and the featured collections' ids.
export const featuredIds = (kind: 'element' | 'collection') =>
  homepageStore
    .get()
    .featured.filter((slot) => slot.kind === kind)
    .map((slot) => slot.refId);

// This month's free items, or null when the team hasn't chosen any.
export const freeItemIdsThisMonth = (day: string = today()) =>
  homepageStore.get().freeElements.find((entry) => entry.month === day.slice(0, 7))?.elementIds ?? null;

// The items anyone with an account can download this month without a plan: the team's picks for the month, or the
// library's own free items when it hasn't picked any. Every page and the download check use this.
export const freeItemIdsNow = (day: string = today()): ReadonlySet<string> =>
  new Set(freeItemIdsThisMonth(day) ?? mockItems.filter((item) => item.tier === 'free').map((item) => item.id));
