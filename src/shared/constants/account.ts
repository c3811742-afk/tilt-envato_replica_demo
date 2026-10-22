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
export const accountSections = ['profile', 'security', 'notifications', 'licensing', 'billing', 'deleteAccount'] as const;
export type AccountSection = (typeof accountSections)[number];

// Demo download queue: a download is "Preparing" for this long, then "Ready".
export const downloadPreparingSeconds = 6;

// The first-login tour, in order. Each step's text is in text.tour.steps.
export const tourSteps = ['search', 'categories', 'downloads', 'account'] as const;
export type TourStep = (typeof tourSteps)[number];
