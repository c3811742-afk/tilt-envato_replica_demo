import type { Permission } from '@/features/admin/constants';
import {
  mockConfig,
  seedAdmins,
  seedBlockedGenerations,
  seedClaims,
  seedFailedPayments,
  seedInvoices,
  seedItemReports,
  seedLicenses,
  seedPayoutRules,
  seedPayouts,
  seedSubscriptions,
  seedTickets,
  seedTransactions,
  seedAnnouncements,
  seedAuditLog,
  seedCategories,
  seedElements,
  seedExtraTags,
  seedLanguages,
  seedNewsletters,
  seedNoClickSearches,
  seedSearchReports,
  seedCreatorApplications,
  seedIdentityChecks,
  seedUserDownloads,
  seedUsers,
} from '@/features/admin/mocks';
import type { Admin, AuditAction, AuditDetails, AuditTarget, ClaimStatus, ItemReportStatus, ReportStatus } from '@/features/admin/types';
import { hasPermission } from '@/features/admin/utils/permissions';
import { mockItems } from '@/shared/mocks';
import { editedTags } from '@/shared/utils';
import { AdminApiError } from './errors';

export const newId = () => crypto.randomUUID();
export const now = () => new Date().toISOString();

// Every tag used by an element or a site item, once, plus the extra seed tags. Usage is counted when tags are fetched.
const seedTags = () => {
  const names = new Set([...seedElements.flatMap((element) => element.tags), ...mockItems.flatMap((item) => editedTags(item.tags))]);
  return [
    ...[...names].map((name) => ({ id: newId(), name, banned: false })),
    ...seedExtraTags.map((tag) => ({ id: newId(), ...tag })),
  ];
};

// In-memory "database". Changes last until the page is reloaded.
export const db = {
  admins: structuredClone(seedAdmins),
  elements: structuredClone(seedElements),
  auditLog: structuredClone(seedAuditLog),
  categories: structuredClone(seedCategories),
  tags: seedTags(),
  noClickSearches: structuredClone(seedNoClickSearches),
  searchReports: structuredClone(seedSearchReports),
  languages: structuredClone(seedLanguages),
  announcements: structuredClone(seedAnnouncements),
  newsletters: structuredClone(seedNewsletters),
  transactions: structuredClone(seedTransactions),
  failedPayments: structuredClone(seedFailedPayments),
  subscriptions: structuredClone(seedSubscriptions),
  payoutRules: structuredClone(seedPayoutRules),
  payouts: structuredClone(seedPayouts),
  invoices: structuredClone(seedInvoices),
  licenses: structuredClone(seedLicenses),
  claims: structuredClone(seedClaims),
  tickets: structuredClone(seedTickets),
  itemReports: structuredClone(seedItemReports),
  blockedGenerations: structuredClone(seedBlockedGenerations),
  users: structuredClone(seedUsers),
  userDownloads: structuredClone(seedUserDownloads),
  siteClaimDecisions: {} as Record<string, { status: ClaimStatus; note?: string }>, // decisions on copyright reports from the site
  siteReportStatus: {} as Record<string, ItemReportStatus>,
  siteSearchReportStatus: {} as Record<string, ReportStatus>, // answers to search reports from the site // answers to broken-download reports from the site
  dismissedAlerts: {} as Record<string, string>, // user id -> when an admin last dismissed their download alert
  creatorApplications: structuredClone(seedCreatorApplications),
  identityChecks: structuredClone(seedIdentityChecks),
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Simulates a network call: waits, sometimes fails (see mockConfig), then runs `handle`.
// Returns a copy, so the page can't change the stored data by accident.
export const respond = async <T>(handle: () => T): Promise<T> => {
  await wait(mockConfig.delayMs);
  if (Math.random() < mockConfig.failureRate) throw new Error('Mock network error');
  return structuredClone(handle());
};

// The admin making the call, refused if their role doesn't allow the action.
export const authorize = (actorId: string, permission: Permission): Admin => {
  const actor = db.admins.find((admin) => admin.id === actorId);
  if (!actor || !hasPermission(actor.role, permission)) throw new AdminApiError('notAllowed');
  return actor;
};

const changeListeners = new Set<() => void>();

// Runs `listener` after every admin action (e.g. to count again what is waiting). Returns the unsubscribe function.
export const onAdminChange = (listener: () => void) => {
  changeListeners.add(listener);
  return () => {
    changeListeners.delete(listener);
  };
};

// Every admin action goes through here, so nothing is missing from the audit log.
export const logAction = (actor: Admin, action: AuditAction, target: AuditTarget, details: AuditDetails = {}) => {
  db.auditLog.unshift({ id: newId(), at: now(), actorId: actor.id, actorName: actor.name, action, target, details });
  // After the response is sent, so listeners see the saved change.
  setTimeout(() => changeListeners.forEach((listener) => listener()));
};

// The item with this id, or a "not found" error.
export const findById = <T extends { id: string }>(list: T[], id: string): T => {
  const item = list.find((current) => current.id === id);
  if (!item) throw new AdminApiError('notFound');
  return item;
};
