import type { BadgeTone } from '@/features/admin/components/Badge';
import type {
  ArticleKind,
  ArticleStatus,
  AttributeType,
  Audience,
  DeprecateReason,
  FeaturedKind,
  MessageStatus,
  ProgramKind,
  ProgramStatus,
  ReportStatus,
  ScheduleStatus,
} from '@/features/admin/types';

export const attributeTypes: readonly AttributeType[] = ['single', 'multiple', 'boolean', 'range'];

// Attribute types that need a list of options.
export const typesWithOptions: readonly AttributeType[] = ['single', 'multiple'];

export const deprecateReasons: readonly DeprecateReason[] = ['noDownloads', 'outdatedStyle', 'outdatedSoftware', 'replaced'];

// "No downloads in the last N months" choices on the unused elements page.
export const unusedPeriods = [6, 12, 24] as const;
export type UnusedPeriod = (typeof unusedPeriods)[number];

// Free elements of the month: enough for a full homepage row, few enough to stay special.
export const maxFreeElements = 8;

export const featuredKinds: readonly FeaturedKind[] = ['element', 'collection'];

export const homepageTabs = ['featured', 'occasions', 'freeElements', 'banners'] as const;
export const searchTabs = ['noClicks', 'reports'] as const;
export const contentTabs = ['faqs', 'legal', 'help', 'learn', 'releaseNotes'] as const;
export const messageTabs = ['announcements', 'newsletters'] as const;

export const scheduleStatusTone: Record<ScheduleStatus, BadgeTone> = {
  scheduled: 'info',
  active: 'success',
  ended: 'neutral',
};

export const reportStatuses: readonly ReportStatus[] = ['open', 'resolved', 'dismissed'];
export const reportStatusTone: Record<ReportStatus, BadgeTone> = {
  open: 'warning',
  resolved: 'success',
  dismissed: 'neutral',
};

// The content tabs that hold articles, and which kind each one holds.
export const articleTabKind = {
  help: 'help',
  learn: 'learn',
  releaseNotes: 'releaseNote',
} as const satisfies Record<string, ArticleKind>;

export const articleStatuses: readonly ArticleStatus[] = ['draft', 'published'];
export const articleStatusTone: Record<ArticleStatus, BadgeTone> = { draft: 'neutral', published: 'success' };

export const audiences: readonly Audience[] = ['customers', 'creators', 'everyone'];
export const messageStatusTone: Record<MessageStatus, BadgeTone> = {
  scheduled: 'info',
  sent: 'success',
  canceled: 'neutral',
};

export const programKinds: readonly ProgramKind[] = ['studentProgram', 'competition'];
export const programStatusTone: Record<ProgramStatus, BadgeTone> = {
  upcoming: 'info',
  open: 'success',
  judging: 'warning',
  closed: 'neutral',
};

// How many translation rows are shown before "Show more".
export const translationsPageSize = 50;
