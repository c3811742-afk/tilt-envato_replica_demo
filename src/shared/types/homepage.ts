import type { LocalizedText } from './catalog';

// What the admin team sets up on the home page.

export type FeaturedKind = 'element' | 'collection';

// One spot in the "Featured" row, in display order. refId: an item id or a collection id.
export interface FeaturedSlot {
  id: string;
  kind: FeaturedKind;
  refId: string;
  title: string; // shown in the admin list
}

// A date range (e.g. Ramadan) when the home page shows its own headline.
export interface Occasion {
  id: string;
  name: LocalizedText;
  headline: LocalizedText;
  startDate: string; // YYYY-MM-DD
  endDate: string;
}

// The items free for one month (YYYY-MM).
export interface FreeElements {
  month: string;
  elementIds: string[];
}

// A strip at the top of every page, between two dates.
export interface Banner {
  id: string;
  text: LocalizedText;
  link: string; // a full https:// link
  startDate: string; // YYYY-MM-DD
  endDate: string;
}

export interface HomepageSettings {
  featured: FeaturedSlot[];
  occasions: Occasion[];
  freeElements: FreeElements[];
  banners: Banner[];
}
