import type { AdminRole } from '@/features/admin/types';

export const adminRoles: readonly AdminRole[] = ['superAdmin', 'reviewer', 'content', 'finance', 'support'];

// Which roles can do what. Checked by the pages (to show or hide) and by the mock API (to allow or refuse).
export const permissions = {
  viewDashboard: ['superAdmin', 'reviewer', 'content', 'finance', 'support'],
  exportReports: ['superAdmin', 'finance'],
  review: ['superAdmin', 'reviewer'],
  unpublish: ['superAdmin', 'reviewer', 'content'],
  manageAdmins: ['superAdmin'],
  viewAuditLog: ['superAdmin'],
  manageCatalog: ['superAdmin', 'content'], // categories, attributes, tags, unused elements
  manageHomepage: ['superAdmin', 'content'],
  viewSearchInsights: ['superAdmin', 'content'],
  manageContent: ['superAdmin', 'content'], // FAQs, legal pages, articles, release notes
  manageTranslations: ['superAdmin', 'content'],
  addLanguages: ['superAdmin'],
  sendMessages: ['superAdmin', 'content'],
  managePrograms: ['superAdmin', 'content'],
  managePlans: ['superAdmin', 'finance'], // plans, AI credits in plans, promo codes
  manageBilling: ['superAdmin', 'finance'], // transactions, refunds, cancellations
  managePayouts: ['superAdmin', 'finance'], // revenue share, payout requests
  issueInvoices: ['superAdmin', 'finance'],
  manageLicenses: ['superAdmin', 'support'], // license lookup, revoking, copyright claims
  handleSupport: ['superAdmin', 'support'], // tickets and item reports
  manageAi: ['superAdmin', 'content'],
} as const satisfies Record<string, readonly AdminRole[]>;

export type Permission = keyof typeof permissions;
