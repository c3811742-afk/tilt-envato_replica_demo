import type { IconName } from '@/shared/assets';
import { colorSwatches, type ColorSwatchName } from '@/shared/theme';
import type { CategoryId } from '@/shared/types';

// Occasions people make templates for. Labels: text.browse.occasions.
export const occasions = ['ramadan', 'eid', 'wedding', 'engagement', 'graduation', 'birthday', 'shamElNessim'] as const;
export type Occasion = (typeof occasions)[number];

export const occasionIcons: Record<Occasion, IconName> = {
  ramadan: 'moon',
  eid: 'star',
  wedding: 'heart',
  engagement: 'ring',
  graduation: 'graduation',
  birthday: 'gift',
  shamElNessim: 'flower',
};

// Business types with ready-made templates. Labels: text.browse.businesses.
export const businessTypes = ['restaurant', 'pharmacy', 'clinic', 'realEstate', 'salon', 'gym', 'school', 'onlineStore'] as const;
export type BusinessType = (typeof businessTypes)[number];

export const businessIcons: Record<BusinessType, IconName> = {
  restaurant: 'utensils',
  pharmacy: 'pill',
  clinic: 'medical',
  realEstate: 'building',
  salon: 'scissors',
  gym: 'dumbbell',
  school: 'graduation',
  onlineStore: 'bag',
};

// Home page sections of local content: the categories they show (only items marked `local`).
export const spotlights = {
  peoplePlaces: { categoryIds: ['photos', 'stockVideo'] },
  localSounds: { categoryIds: ['music', 'soundEffects'] },
} as const satisfies Record<string, { categoryIds: readonly CategoryId[] }>;
export type Spotlight = keyof typeof spotlights;

// Apps that open an item's files. Each file format belongs to one app.
export const softwareIds = [
  'afterEffects',
  'premierePro',
  'photoshop',
  'illustrator',
  'figma',
  'powerpoint',
  'keynote',
  'googleSlides',
  'html',
] as const;
export type Software = (typeof softwareIds)[number];

export const formatSoftware: Partial<Record<string, Software>> = {
  AEP: 'afterEffects',
  MOGRT: 'premierePro',
  PRPROJ: 'premierePro',
  PSD: 'photoshop',
  AI: 'illustrator',
  EPS: 'illustrator',
  FIG: 'figma',
  PPTX: 'powerpoint',
  KEY: 'keynote',
  GSLIDES: 'googleSlides',
  HTML: 'html',
};

export const resolutions = ['hd', 'fullHd', '4k'] as const;
export type Resolution = (typeof resolutions)[number];

export const orientations = ['landscape', 'portrait', 'square'] as const;
export type Orientation = (typeof orientations)[number];

export const plugins = ['none', 'element3d', 'trapcode', 'saber'] as const;
export type Plugin = Exclude<(typeof plugins)[number], 'none'>;

// The main color of an item's preview. Each has a swatch in the theme (vars.colorSwatches).
export const colorFilters = Object.keys(colorSwatches) as ColorSwatchName[];
export type ColorFilter = ColorSwatchName;

export const musicMoods = ['calm', 'happy', 'energetic', 'dramatic', 'romantic', 'inspiring'] as const;
export type MusicMood = (typeof musicMoods)[number];

export const musicGenres = ['oriental', 'shaabi', 'pop', 'electronic', 'cinematic', 'corporate', 'lofi', 'acoustic'] as const;
export type MusicGenre = (typeof musicGenres)[number];

export const musicThemes = ['ramadan', 'wedding', 'travel', 'business', 'vlog', 'documentary', 'kids', 'sports'] as const;
export type MusicTheme = (typeof musicThemes)[number];

export const contentIdStatuses = ['cleared', 'registered'] as const;
export type ContentIdStatus = (typeof contentIdStatuses)[number];

// Alternate versions of a track, in the order they're listed.
export const trackVersionKinds = ['alternate', 'edit60', 'edit30', 'loop'] as const;
export type TrackVersionKind = (typeof trackVersionKinds)[number];

export const fontCategories = ['sansSerif', 'serif', 'display', 'script', 'kufi', 'naskh', 'ruqaa', 'thuluth'] as const;
export type FontCategory = (typeof fontCategories)[number];

export const optimumSizes = ['text', 'display'] as const;
export type OptimumSize = (typeof optimumSizes)[number];

export const fontSpacings = ['condensed', 'normal', 'wide'] as const;
export type FontSpacing = (typeof fontSpacings)[number];

// What a sound effect (or a stock video's sound) is like: picks how its preview is generated.
export const soundKinds = ['whoosh', 'street', 'clicks', 'applause', 'traffic', 'impacts', 'waves', 'rain', 'wind'] as const;
export type SoundKind = (typeof soundKinds)[number];

// Ranges that the duration, length and tempo filters group items into: [from, to), in seconds or BPM.
export const durationRanges = { short: [0, 15], medium: [15, 60], long: [60, Infinity] } as const;
export const lengthRanges = { underOne: [0, 60], oneToThree: [60, 180], overThree: [180, Infinity] } as const;
export const tempoRanges = { slow: [0, 90], medium: [90, 120], fast: [120, Infinity] } as const;

// "Uploaded in the past …": days back from today.
export const dateRanges = { pastWeek: 7, pastMonth: 31, pastYear: 366 } as const;

// Every filter on the search page and its options. Option labels: text.filters[key].options[value].
export const filterOptions = {
  software: softwareIds,
  fileType: ['AEP', 'MOGRT', 'PRPROJ', 'MP4', 'MOV', 'WAV', 'MP3', 'OTF', 'TTF', 'WOFF2', 'AI', 'EPS', 'SVG', 'PNG', 'PSD', 'FIG', 'JPG', 'PPTX', 'KEY', 'GSLIDES', 'HTML'],
  resolution: resolutions,
  orientation: orientations,
  duration: Object.keys(durationRanges) as (keyof typeof durationRanges)[],
  color: colorFilters,
  date: Object.keys(dateRanges) as (keyof typeof dateRanges)[],
  plugins,
  mood: musicMoods,
  genre: musicGenres,
  theme: musicThemes,
  length: Object.keys(lengthRanges) as (keyof typeof lengthRanges)[],
  tempo: Object.keys(tempoRanges) as (keyof typeof tempoRanges)[],
  contentId: contentIdStatuses,
  fontCategory: fontCategories,
  optimumSize: optimumSizes,
  spacing: fontSpacings,
  bilingual: ['yes'],
  madeInEgypt: ['yes'],
} as const satisfies Record<string, readonly string[]>;

export type FilterKey = keyof typeof filterOptions;
export const filterKeys = Object.keys(filterOptions) as FilterKey[];

// How each filter is shown: chips (pick several), one choice, color swatches, or a single on / off switch.
export const filterControls: Record<FilterKey, 'chips' | 'single' | 'colors' | 'toggle'> = {
  software: 'chips',
  fileType: 'chips',
  resolution: 'chips',
  orientation: 'chips',
  duration: 'chips',
  color: 'colors',
  date: 'single',
  plugins: 'chips',
  mood: 'chips',
  genre: 'chips',
  theme: 'chips',
  length: 'chips',
  tempo: 'chips',
  contentId: 'single',
  fontCategory: 'chips',
  optimumSize: 'single',
  spacing: 'chips',
  bilingual: 'toggle',
  madeInEgypt: 'toggle',
};

// The country "Made in Egypt" refers to (the creator's country).
export const madeInCountry = 'EG';

// Filters shown for each category, in order. `all` is the search page with no category picked.
export const categoryFilters: Record<CategoryId | 'all', readonly FilterKey[]> = {
  all: ['software', 'fileType', 'resolution', 'orientation', 'duration', 'color', 'date', 'bilingual', 'madeInEgypt'],
  videoTemplates: ['software', 'plugins', 'resolution', 'orientation', 'duration', 'color', 'fileType', 'date', 'bilingual', 'madeInEgypt'],
  stockVideo: ['resolution', 'orientation', 'duration', 'color', 'fileType', 'date', 'madeInEgypt'],
  music: ['mood', 'genre', 'theme', 'length', 'tempo', 'contentId', 'fileType', 'date', 'madeInEgypt'],
  soundEffects: ['duration', 'fileType', 'date', 'madeInEgypt'],
  fonts: ['fontCategory', 'optimumSize', 'spacing', 'fileType', 'date', 'madeInEgypt'],
  graphics: ['software', 'fileType', 'color', 'date', 'madeInEgypt'],
  graphicTemplates: ['software', 'orientation', 'color', 'fileType', 'date', 'bilingual', 'madeInEgypt'],
  photos: ['orientation', 'color', 'fileType', 'date', 'madeInEgypt'],
  presentationTemplates: ['software', 'fileType', 'date', 'bilingual', 'madeInEgypt'],
  webTemplates: ['software', 'fileType', 'date', 'bilingual', 'madeInEgypt'],
};

// Categories whose items have a tutorial and project files to look inside on the item page.
export const templateCategories = ['videoTemplates', 'graphicTemplates', 'presentationTemplates', 'webTemplates'] as const satisfies readonly CategoryId[];
export type TemplateCategory = (typeof templateCategories)[number];

// How an item is previewed: played (video or audio), typed in (fonts), or shown as an image.
export const previewKinds: Record<CategoryId, 'video' | 'audio' | 'font' | 'image'> = {
  videoTemplates: 'video',
  stockVideo: 'video',
  music: 'audio',
  soundEffects: 'audio',
  fonts: 'font',
  graphics: 'image',
  graphicTemplates: 'image',
  photos: 'image',
  presentationTemplates: 'image',
  webTemplates: 'image',
};

// The letters a font card shows, and the font preview's settings (sizes in rem).
export const fontSpecimen = { latin: 'Aa', arabic: 'أب' } as const;
export const fontPreviewSize = { min: 1, max: 6, step: 0.25, initial: 3 } as const;
export const textAlignments = ['start', 'center', 'end'] as const;
export type TextAlignment = (typeof textAlignments)[number];

// Search results list view: music and sound effects are tracks, fonts can be a list of samples.
export const resultViews = ['grid', 'list'] as const;
export type ResultView = (typeof resultViews)[number];

export const gridSizes = ['small', 'medium', 'large'] as const;
export type GridSize = (typeof gridSizes)[number];

export const pagingModes = ['infinite', 'pages'] as const;
export type PagingMode = (typeof pagingModes)[number];

// What a visitor sees before choosing their own view settings.
export const defaultBrowsePreferences = {
  gridSize: 'medium',
  pagingMode: 'infinite',
  fontView: 'list',
  volume: 0.8, // 0 to 1, shared by every preview
} as const satisfies { gridSize: GridSize; pagingMode: PagingMode; fontView: ResultView; volume: number };

// Reasons a user can give when results don't match their search. Labels: text.searchReport.reasons.
export const searchReportReasons = ['unrelated', 'wrongCategory', 'lowQuality', 'other'] as const;
export type SearchReportReason = (typeof searchReportReasons)[number];

// Find similar music from a link: the services we accept and how to recognise their links.
export const musicLinkPatterns = {
  youtube: /^(https?:\/\/)?(www\.|m\.|music\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)[\w-]{6,}/i,
  spotify: /^(https?:\/\/)?open\.spotify\.com\/(intl-\w+\/)?track\/\w{10,}/i,
} as const;
export type MusicLinkService = keyof typeof musicLinkPatterns;
