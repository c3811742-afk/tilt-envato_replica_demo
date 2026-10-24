import { routes } from '@/shared/constants';
import type { Permission } from './roles';

// Sidebar links, in groups. Each link only shows for roles that have its permission,
// and a group only shows when at least one of its links does.
export const adminNavGroups = [
  {
    key: 'overview',
    items: [{ key: 'dashboard', to: routes.adminDashboard, permission: 'viewDashboard' }],
  },
  {
    key: 'review',
    items: [
      { key: 'reviewQueue', to: routes.adminReview, permission: 'review' },
      { key: 'liveElements', to: routes.adminLiveElements, permission: 'unpublish' },
    ],
  },
  {
    key: 'catalog',
    items: [
      { key: 'categories', to: routes.adminCategories, permission: 'manageCatalog' },
      { key: 'tags', to: routes.adminTags, permission: 'manageCatalog' },
      { key: 'homepage', to: routes.adminHomepage, permission: 'manageHomepage' },
      { key: 'unusedElements', to: routes.adminUnusedElements, permission: 'manageCatalog' },
      { key: 'searchInsights', to: routes.adminSearchInsights, permission: 'viewSearchInsights' },
    ],
  },
  {
    key: 'content',
    items: [
      { key: 'siteContent', to: routes.adminContent, permission: 'manageContent' },
      { key: 'languages', to: routes.adminLanguages, permission: 'manageTranslations' },
      { key: 'messages', to: routes.adminMessages, permission: 'sendMessages' },
      { key: 'programs', to: routes.adminPrograms, permission: 'managePrograms' },
      { key: 'ai', to: routes.adminAi, permission: 'manageAi' },
    ],
  },
  {
    key: 'business',
    items: [
      { key: 'plans', to: routes.adminPlans, permission: 'managePlans' },
      { key: 'billing', to: routes.adminBilling, permission: 'manageBilling' },
      { key: 'payouts', to: routes.adminPayouts, permission: 'managePayouts' },
      { key: 'invoices', to: routes.adminInvoices, permission: 'issueInvoices' },
    ],
  },
  {
    key: 'support',
    items: [
      { key: 'support', to: routes.adminSupport, permission: 'handleSupport' },
      { key: 'licenses', to: routes.adminLicenses, permission: 'manageLicenses' },
    ],
  },
  {
    key: 'team',
    items: [
      { key: 'admins', to: routes.adminAdmins, permission: 'manageAdmins' },
      { key: 'auditLog', to: routes.adminAuditLog, permission: 'viewAuditLog' },
    ],
  },
] as const satisfies readonly {
  key: string;
  items: readonly { key: string; to: string; permission: Permission }[];
}[];

export type AdminNavItem = (typeof adminNavGroups)[number]['items'][number];

// Every link, in sidebar order (used to send each role to its first page).
export const adminNav: readonly AdminNavItem[] = adminNavGroups.flatMap(
  (group): readonly AdminNavItem[] => group.items,
);

// Success messages carried to the next page after a review decision.
export const flashNotices = ['accepted', 'softRejected', 'hardRejected'] as const;
export type FlashNotice = (typeof flashNotices)[number];
