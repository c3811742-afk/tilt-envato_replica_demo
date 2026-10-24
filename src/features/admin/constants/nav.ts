import type { IconName } from '@/shared/assets';
import { routes } from '@/shared/constants';
import type { Permission } from './roles';

// Sidebar links, in groups. Each link only shows for roles that have its permission,
// and a group only shows when at least one of its links does.
export const adminNavGroups = [
  {
    key: 'overview',
    items: [
      { key: 'dashboard', to: routes.adminDashboard, permission: 'viewDashboard', icon: 'layout' },
      { key: 'search', to: routes.adminSearch, permission: 'viewDashboard', icon: 'search' },
    ],
  },
  {
    key: 'people',
    items: [
      { key: 'users', to: routes.adminUsers, permission: 'manageUsers', icon: 'users' },
      { key: 'creators', to: routes.adminCreators, permission: 'reviewCreators', icon: 'star' },
    ],
  },
  {
    key: 'review',
    items: [
      { key: 'reviewQueue', to: routes.adminReview, permission: 'review', icon: 'eye' },
      { key: 'liveElements', to: routes.adminLiveElements, permission: 'unpublish', icon: 'grid' },
    ],
  },
  {
    key: 'catalog',
    items: [
      { key: 'categories', to: routes.adminCategories, permission: 'manageCatalog', icon: 'folder' },
      { key: 'tags', to: routes.adminTags, permission: 'manageCatalog', icon: 'tag' },
      { key: 'homepage', to: routes.adminHomepage, permission: 'manageHomepage', icon: 'home' },
      { key: 'unusedElements', to: routes.adminUnusedElements, permission: 'manageCatalog', icon: 'clock' },
      { key: 'searchInsights', to: routes.adminSearchInsights, permission: 'viewSearchInsights', icon: 'search' },
    ],
  },
  {
    key: 'content',
    items: [
      { key: 'siteContent', to: routes.adminContent, permission: 'manageContent', icon: 'pencil' },
      { key: 'languages', to: routes.adminLanguages, permission: 'manageTranslations', icon: 'globe' },
      { key: 'messages', to: routes.adminMessages, permission: 'sendMessages', icon: 'mail' },
      { key: 'programs', to: routes.adminPrograms, permission: 'managePrograms', icon: 'graduation' },
      { key: 'ai', to: routes.adminAi, permission: 'manageAi', icon: 'sparkle' },
    ],
  },
  {
    key: 'business',
    items: [
      { key: 'plans', to: routes.adminPlans, permission: 'managePlans', icon: 'layers' },
      { key: 'billing', to: routes.adminBilling, permission: 'manageBilling', icon: 'card' },
      { key: 'payouts', to: routes.adminPayouts, permission: 'managePayouts', icon: 'wallet' },
      { key: 'invoices', to: routes.adminInvoices, permission: 'issueInvoices', icon: 'receipt' },
    ],
  },
  {
    key: 'support',
    items: [
      { key: 'support', to: routes.adminSupport, permission: 'handleSupport', icon: 'message' },
      { key: 'licenses', to: routes.adminLicenses, permission: 'manageLicenses', icon: 'license' },
    ],
  },
  {
    key: 'team',
    items: [
      { key: 'admins', to: routes.adminAdmins, permission: 'manageAdmins', icon: 'shield' },
      { key: 'auditLog', to: routes.adminAuditLog, permission: 'viewAuditLog', icon: 'list' },
    ],
  },
] as const satisfies readonly {
  key: string;
  items: readonly { key: string; to: string; permission: Permission; icon: IconName }[];
}[];

export type AdminNavItem = (typeof adminNavGroups)[number]['items'][number];

// Every link, in sidebar order (used to send each role to its first page).
export const adminNav: readonly AdminNavItem[] = adminNavGroups.flatMap(
  (group): readonly AdminNavItem[] => group.items,
);

// Success messages carried to the next page after a review decision.
export const flashNotices = ['accepted', 'softRejected', 'hardRejected'] as const;
export type FlashNotice = (typeof flashNotices)[number];
