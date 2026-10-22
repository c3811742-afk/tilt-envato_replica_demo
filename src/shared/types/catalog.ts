import type { AccentName, Locale, PreviewFont } from '@/shared/theme';
import type { IconName } from '@/shared/assets';
import type {
  BusinessType,
  ColorFilter,
  ContentIdStatus,
  FilterKey,
  FontCategory,
  FontSpacing,
  MusicGenre,
  MusicMood,
  MusicTheme,
  Occasion,
  OptimumSize,
  Orientation,
  Plugin,
  Resolution,
  SortOption,
  SoundKind,
  Spotlight,
  TrackVersionKind,
} from '@/shared/constants';

export const categoryIds = [
  'videoTemplates',
  'stockVideo',
  'music',
  'soundEffects',
  'fonts',
  'graphics',
  'graphicTemplates',
  'photos',
  'presentationTemplates',
  'webTemplates',
] as const;

export type CategoryId = (typeof categoryIds)[number];

// The same text in every language. Item and creator text is written in one language and translated.
export type LocalizedText = Record<Locale, string>;

export interface Category {
  id: CategoryId;
  icon: IconName;
  accent: AccentName;
  keywords: string[]; // extra search words (Arabic, English, Franco-Arab) that match the category
  itemCount: number;
}

export interface Creator {
  id: string;
  name: string; // a brand name: never translated
  city: LocalizedText;
  country: string; // ISO 3166 code, e.g. "EG"; shown with the active language's country name
  bio: LocalizedText;
  joinedAt: string; // ISO date
  accent: AccentName;
}

export type ItemTier = 'free' | 'premium'; // free items are the free items of the month

// Where a free-to-use asset (image, audio) comes from, shown as its credit.
export interface AssetCredit {
  author: string;
  license: string; // e.g. "CC0", "Public domain"
  sourceName: string; // e.g. "Wikimedia Commons"
  sourceUrl: string; // the file's page at the source
}

// An alternate version of a music track: a shorter edit, a mix without drums, or a loop.
export interface TrackVersion {
  kind: TrackVersionKind;
  duration: number; // seconds
}

export interface MusicInfo {
  bpm: number;
  moods: MusicMood[];
  genres: MusicGenre[];
  themes: MusicTheme[];
  contentId: ContentIdStatus;
  versions: TrackVersion[];
}

export interface FontInfo {
  family: PreviewFont; // the open font used for the live preview (loaded from Google Fonts)
  category: FontCategory;
  optimumSize: OptimumSize;
  spacing: FontSpacing;
  arabic: boolean; // has Arabic letters (the preview starts with Arabic sample text)
}

export interface Item {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  originalLanguage: Locale; // the language the creator wrote the title and description in
  categoryId: CategoryId;
  creator: Creator;
  tags: string[];
  accent: AccentName;
  tier: ItemTier;
  formats: string[]; // file formats in the download, e.g. ['AEP', 'MP4']
  fileSize: number; // bytes
  downloads: number;
  recentDownloads: number; // in the last 30 days: what "trending" ranks by
  rating: number; // 0-5
  ratingCount: number;
  createdAt: string; // ISO date
  featured: boolean; // picked by the team for the home page
  bilingual: boolean; // the design has Arabic and English text
  local: boolean; // shows local people, places or sounds
  occasions: Occasion[];
  businesses: BusinessType[];
  image?: string; // preview image URL (from the asset registry); without one, the cover is generated
  imageCredit?: AssetCredit;
  color?: ColorFilter; // main color of the preview image
  look?: string; // the preview image's color layout (see imageLook in utils), for "search by image"
  orientation?: Orientation;
  resolution?: Resolution;
  duration?: number; // seconds (video, music, sound effects)
  plugins?: Plugin[]; // After Effects plugins a video template needs (none when empty)
  sound?: SoundKind; // what a sound effect or a stock video's sound is like (for its preview)
  music?: MusicInfo;
  font?: FontInfo;
  previewSongId?: string; // the music item playing in a video template's preview
}

// Selected values of each filter, e.g. { orientation: ['portrait'], color: ['red', 'blue'] }.
export type FilterValues = Partial<Record<FilterKey, string[]>>;

// How many results each filter option would have, e.g. { orientation: { portrait: 4 } }.
export type Facets = Partial<Record<FilterKey, Record<string, number>>>;

// What a track sounds like, measured from an audio file (or a link): used to find similar music.
export interface SoundProfile {
  bpm: number;
  energy: number; // 0 (quiet, sparse) to 1 (loud, busy)
}

export interface SearchQuery {
  query?: string;
  categoryId?: CategoryId;
  sort?: SortOption;
  filters?: FilterValues;
  mustInclude?: string; // advanced search: every one of these words
  exclude?: string; // advanced search: none of these words
  authors?: string[]; // advanced search: only these creators (ids)
  excludeAuthors?: string[]; // advanced search: not these creators (ids)
  occasion?: Occasion;
  business?: BusinessType;
  spotlight?: Spotlight;
  look?: string; // search by image: the reference image's color layout
  soundsLike?: SoundProfile; // find similar music
  uploadedFrom?: string; // ISO date: uploaded on or after
  uploadedTo?: string; // ISO date: uploaded on or before
  offset?: number;
  limit?: number;
}

export interface Page<T> {
  items: T[];
  total: number;
}

export interface SearchResults extends Page<Item> {
  facets: Facets;
}

export interface CatalogStats {
  itemCount: number;
  creatorCount: number;
  categoryCount: number;
}

export interface CreatorProfile {
  creator: Creator;
  itemCount: number;
  downloads: number;
}

// A hand-picked set of items (by the team), or a drop: a new set from one creator or partner.
export interface Collection {
  id: string;
  kind: 'collection' | 'drop';
  title: LocalizedText;
  description: LocalizedText;
  itemIds: string[];
  creatorId?: string; // a creator drop
  partner?: string; // a partner drop: the partner's name
  accent: AccentName;
  publishedAt: string; // ISO date
}

export interface CollectionWithItems extends Collection {
  items: Item[];
  creator?: Creator;
}

// What the search box suggests while typing: a search term, a category, or an item to open.
export type SearchSuggestion =
  | { kind: 'term'; term: string }
  | { kind: 'category'; categoryId: CategoryId }
  | { kind: 'item'; item: Item };

export interface SearchReport {
  query: string;
  categoryId?: CategoryId;
  reason: string;
  comment: string;
}
