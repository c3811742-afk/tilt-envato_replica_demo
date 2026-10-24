import type { IconName } from '@/shared/assets';
import type { CategoryId } from '@/shared/types';

// How the mock catalog behaves.
export const catalog = {
  mockLatencyMs: 350, // simulated network delay for every mock call
  suggestLatencyMs: 80, // search suggestions answer faster, so they keep up with typing
  suggestDelayMs: 150, // wait this long after the last key press before asking for suggestions
  suggestionLimit: 6, // suggestions shown under the search box
  searchPageSize: 12, // items per page of results
  infiniteScrollMargin: '100%', // load more while the end of the list is within a screen of the view (catches fast scrolls)
  railSize: 10, // items in a home page row
  similarSize: 8, // items in the "Similar items" row
  moreByCreatorSize: 8, // items in the "More by …" row
  downloadedTogetherSize: 6, // items in the "Often downloaded together" row
  creatorProfileSize: 24, // items per page of a creator's portfolio
  faqPreviewSize: 4, // questions shown on the home page
  homeCollections: 3, // collections shown on the home page
  referenceImages: 8, // "search by image": example images to pick from
  uploadLimits: { imageBytes: 10 * 1024 * 1024, audioBytes: 20 * 1024 * 1024 }, // largest files the searches read
  imageMatchMaxDistance: 0.2, // search by image: how different (0-1) a match may look
  soundMatchLimit: 12, // find similar music: tracks shown
  tutorialSongId: 'lofi-study-beats', // background music of the template tutorials
  tutorialStepSeconds: 6, // how long each tutorial step is shown
  defaultPreviewSeconds: 20, // preview length when an item has no duration
  waveformBars: 96, // bars drawn in a waveform
  earliestUploadYear: 2020, // the upload date filter accepts years from this one to the current year
} as const;

export const sortOptions = ['relevant', 'popular', 'newest'] as const;
export type SortOption = (typeof sortOptions)[number];
export const defaultSort: SortOption = 'relevant';

// The icon that stands for each category (category cards, chips and generated item covers).
export const categoryIcons: Record<CategoryId, IconName> = {
  videoTemplates: 'video',
  stockVideo: 'film',
  music: 'music',
  soundEffects: 'waves',
  fonts: 'type',
  graphics: 'shapes',
  graphicTemplates: 'layout',
  photos: 'image',
  presentationTemplates: 'presentation',
  webTemplates: 'code',
};
