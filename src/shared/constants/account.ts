import { itemPath, routes, searchPath } from './routes';

// What the user will use the site for, asked after sign-up.
export const useCases = ['freelancer', 'student', 'agency', 'business'] as const;
export type UseCase = (typeof useCases)[number];

// How the user wants to hear from us. Sign-in and security messages always go by email.
export const notificationChannels = ['email', 'whatsapp'] as const;
export type NotificationChannel = (typeof notificationChannels)[number];

// What we can send; each can be turned off in the account settings.
export const notificationTopics = ['billing', 'downloads', 'newItems', 'productNews'] as const;
export type NotificationTopic = (typeof notificationTopics)[number];

// What happens when a subscriber downloads: ask for a project name, never ask, or suggest the last one.
export const licensingPreferences = ['alwaysAsk', 'neverAsk', 'rememberLast'] as const;
export type LicensingPreference = (typeof licensingPreferences)[number];
export const defaultLicensingPreference: LicensingPreference = 'alwaysAsk';

// Egypt's 27 governorates, for the billing address. Their names are in the text files (text.governorates).
export const governorates = [
  'cairo',
  'giza',
  'alexandria',
  'qalyubia',
  'sharqia',
  'dakahlia',
  'gharbia',
  'monufia',
  'beheira',
  'kafrElSheikh',
  'damietta',
  'portSaid',
  'ismailia',
  'suez',
  'northSinai',
  'southSinai',
  'redSea',
  'matrouh',
  'newValley',
  'faiyum',
  'beniSuef',
  'minya',
  'asyut',
  'sohag',
  'qena',
  'luxor',
  'aswan',
] as const;
export type Governorate = (typeof governorates)[number];

// Release notes ("What's new"), newest first. Their title and text are in text.releaseNotes.
export const releaseNotes = [
  { id: 'realPreviews', date: '2026-10-22' },
  { id: 'cookieSettings', date: '2026-10-21' },
  { id: 'darkMode', date: '2026-10-20' },
] as const;
export type ReleaseNoteId = (typeof releaseNotes)[number]['id'];

// The pages of the account settings, in menu order.
export const accountSections = ['profile', 'security', 'notifications', 'plan', 'billing', 'licensing', 'deleteAccount'] as const;
export type AccountSection = (typeof accountSections)[number];

// Demo download queue: a download is "Preparing" for this long, then "Ready".
export const downloadPreparingSeconds = 6;

// How often a page showing progress (downloads preparing, AI images generating) checks the time again.
export const progressTickMs = 1000;

// The first-login tour walks through the site, in this order. Each step's text is in text.tour.steps.
export const tourSteps = ['search', 'categories', 'filters', 'preview', 'downloads', 'notifications', 'account'] as const;
export type TourStep = (typeof tourSteps)[number];

// The item the tour shows a preview and a download of.
export const tourItemId = 'ramadan-kareem-intro';

// Where each step happens (a path to open first, or the current page when none) and the element it points at:
// the first one of `targets` that is on screen (data-tour="…"), so a step can point at the phone version of a control.
export const tourStepPlaces = {
  search: { path: routes.home, targets: ['search'] },
  categories: { path: routes.home, targets: ['categories'] },
  filters: { path: searchPath({ category: 'videoTemplates' }), targets: ['filters', 'filtersButton'] },
  preview: { path: itemPath(tourItemId), targets: ['preview'] },
  downloads: { path: itemPath(tourItemId), targets: ['download'] },
  notifications: { targets: ['notifications'] },
  account: { targets: ['account'] },
} as const satisfies Record<TourStep, { path?: string; targets: readonly string[] }>;

// How long a step waits for its page to show the element before showing the step without a highlight.
export const tourTargetWaitMs = 3000;

// Each element is scrolled so its top sits this far down the screen, leaving room for the card under it.
export const tourScroll = { topShare: 0.2 } as const;
