import type { CategoryId } from '@/shared/types';

// Where a creator's element is: a draft only they see, waiting for review, live, rejected (soft: can be fixed and
// sent again; hard: final), taken down by the team, or switched off by the creator.
export const studioStatuses = ['draft', 'pending', 'live', 'softRejected', 'hardRejected', 'unpublished', 'disabled'] as const;
export type StudioStatus = (typeof studioStatuses)[number];

// The details each kind of element asks for, on top of the common ones (title, description, tags, category).
export type StudioDetailKey = 'resolution' | 'duration' | 'frameRate' | 'orientation' | 'bpm' | 'mood' | 'fontWeights' | 'scripts' | 'slides' | 'pages' | 'layers';
export const studioDetailFields: Record<CategoryId, StudioDetailKey[]> = {
  videoTemplates: ['resolution', 'duration', 'frameRate'],
  stockVideo: ['resolution', 'duration', 'frameRate', 'orientation'],
  music: ['duration', 'bpm', 'mood'],
  soundEffects: ['duration'],
  fonts: ['fontWeights', 'scripts'],
  graphics: ['orientation', 'layers'],
  graphicTemplates: ['orientation', 'layers'],
  photos: ['resolution', 'orientation'],
  presentationTemplates: ['slides'],
  webTemplates: ['pages'],
};
// Details entered as numbers (the others are text).
export const studioNumberDetails: readonly StudioDetailKey[] = ['duration', 'frameRate', 'bpm', 'fontWeights', 'slides', 'pages', 'layers'];

// Software an element can work with, offered per category.
export const studioSoftware: Record<CategoryId, string[]> = {
  videoTemplates: ['After Effects', 'Premiere Pro', 'DaVinci Resolve', 'Final Cut Pro', 'CapCut'],
  stockVideo: ['Any video editor'],
  music: ['Any audio editor'],
  soundEffects: ['Any audio editor'],
  fonts: ['Windows', 'macOS', 'Web'],
  graphics: ['Illustrator', 'Photoshop', 'Figma', 'Canva'],
  graphicTemplates: ['Photoshop', 'Illustrator', 'Figma', 'Canva'],
  photos: ['Any image editor'],
  presentationTemplates: ['PowerPoint', 'Keynote', 'Google Slides'],
  webTemplates: ['HTML', 'WordPress', 'Figma'],
};

// Where a font, track or photo inside an element came from must be declared, with its license.
export const studioSourceKinds = ['font', 'music', 'photo'] as const;
export type StudioSourceKind = (typeof studioSourceKinds)[number];

export const studioLimits = {
  titleMaxLength: 80,
  descriptionMaxLength: 1000,
  tagsMax: 15,
  fileMaxBytes: 500 * 1024 * 1024, // per file
  previewMaxBytes: 50 * 1024 * 1024,
  claimResponseMinLength: 20,
} as const;

// Earnings: the creator's share of each paid download, and when money can be paid out.
export const studioEarnings = {
  perDownload: 6, // EGP the creator earns for each paid download of their element
  pendingDays: 30, // earnings wait this long (for refunds and claims) before they can be paid out
  periodMonths: 6, // months shown in "Earnings per period"
} as const;

// The payout rules until the admin team changes them (Admin › Payouts › Rules).
export const defaultPayoutRules = { creatorShare: 50, minimumPayout: 500, payoutDay: 5 } as const;

// Occasions in Egypt creators are reminded about, 6 to 8 weeks before. Dates move each year (several follow
// the Islamic or Coptic calendar), so they are listed per year. Labels: text.studio.occasions.
export const studioOccasions = [
  { key: 'newYear', date: '2027-01-01' },
  { key: 'copticChristmas', date: '2027-01-07' },
  { key: 'ramadan', date: '2027-02-08' },
  { key: 'eidAlFitr', date: '2027-03-10' },
  { key: 'mothersDay', date: '2027-03-21' },
  { key: 'shamElNessim', date: '2027-05-03' },
  { key: 'eidAlAdha', date: '2027-05-17' },
  { key: 'backToSchool', date: '2027-09-19' },
] as const;
export type StudioOccasion = (typeof studioOccasions)[number]['key'];
export const occasionReminderWeeks = { earliest: 8, latest: 6 } as const;

// Searches customers often make: analytics shows those with few results so creators know what to make.
export const popularSearches = [
  'ramadan',
  'رمضان',
  'eid',
  'عيد',
  'wedding invitation',
  'دعوة فرح',
  'graduation',
  'logo reveal',
  'arabic font',
  'خط عربي',
  'oud',
  'cairo',
  'القاهرة',
  'podcast intro',
  'real estate',
  'restaurant menu',
  'instagram story',
  'mothers day',
  'sham el nessim',
  'football',
] as const;
export const fewResultsThreshold = 3; // a popular search with this many results or fewer is worth making content for
export const topElementsCount = 5;
