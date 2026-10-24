import type { Banner, FeaturedKind, FeaturedSlot, FreeElements, HomepageOccasion } from '@/shared/types';

// The home page settings are the site's own (see shared/types/homepage.ts).
export type { Banner, FeaturedKind, FeaturedSlot, FreeElements };
export type Occasion = HomepageOccasion;
export type OccasionInput = Omit<Occasion, 'id'>;
export type BannerInput = Omit<Banner, 'id'>;

// A collection of items put together by the TILT team (e.g. "Ramadan essentials").
export interface Collection {
  id: string;
  title: string;
  itemCount: number;
}

// Whether a dated item (an occasion, a banner) is showing on a given day.
export type ScheduleStatus = 'scheduled' | 'active' | 'ended';
