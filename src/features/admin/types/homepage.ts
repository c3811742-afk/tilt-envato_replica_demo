import type { LocalizedText } from './catalog';

export type FeaturedKind = 'element' | 'collection';

// A collection of elements put together by the TILT team (e.g. "Ramadan essentials").
export interface Collection {
  id: string;
  title: string;
  itemCount: number;
}

// One spot in the "Featured" row of the homepage, in display order.
export interface FeaturedSlot {
  id: string;
  kind: FeaturedKind;
  refId: string; // the element or collection id
  title: string;
}

// A date range in the Egyptian calendar when the homepage shows its own headline (e.g. Ramadan).
export interface Occasion {
  id: string;
  name: LocalizedText;
  headline: LocalizedText;
  startDate: string; // YYYY-MM-DD
  endDate: string;
}

export type OccasionInput = Omit<Occasion, 'id'>;

export interface FreeElements {
  month: string; // YYYY-MM
  elementIds: string[];
}

// Whether a dated item (an occasion, a banner) is showing on a given day.
export type ScheduleStatus = 'scheduled' | 'active' | 'ended';

export interface Banner {
  id: string;
  text: LocalizedText;
  link: string;
  startDate: string;
  endDate: string;
}

export type BannerInput = Omit<Banner, 'id'>;
