import type { Permission } from '@/features/admin/constants';
import {
  mockConfig,
  seedAdmins,
  seedAiTools,
  seedBlockedGenerations,
  seedClaims,
  seedContentRules,
  seedFailedPayments,
  seedGenerationCosts,
  seedInvoices,
  seedItemReports,
  seedLicenses,
  seedPayoutRules,
  seedPayouts,
  seedPlans,
  seedPromoCodes,
  seedSubscriptions,
  seedTickets,
  seedTransactions,
  seedAnnouncements,
  seedArticles,
  seedAuditLog,
  seedBanners,
  seedCategories,
  seedCollections,
  seedElements,
  seedExtraTags,
  seedFaqs,
  seedFeatured,
  seedFreeElements,
  seedLanguages,
  seedLegalPages,
  seedNewsletters,
  seedNoClickSearches,
  seedOccasions,
  seedPrograms,
  seedSearchReports,
} from '@/features/admin/mocks';
import type { Admin, AuditAction, AuditDetails, AuditTarget } from '@/features/admin/types';
import { hasPermission } from '@/features/admin/utils/permissions';
import { AdminApiError } from './errors';

export const newId = () => crypto.randomUUID();
export const now = () => new Date().toISOString();

// Every tag used by an element, once, plus the extra seed tags. Usage is counted when tags are fetched.
const seedTags = () => {
  const names = new Set(seedElements.flatMap((element) => element.tags));
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
  collections: structuredClone(seedCollections),
  featured: structuredClone(seedFeatured),
  occasions: structuredClone(seedOccasions),
  freeElements: structuredClone(seedFreeElements),
  banners: structuredClone(seedBanners),
  noClickSearches: structuredClone(seedNoClickSearches),
  searchReports: structuredClone(seedSearchReports),
  faqs: structuredClone(seedFaqs),
  legalPages: structuredClone(seedLegalPages),
  articles: structuredClone(seedArticles),
  languages: structuredClone(seedLanguages),
  translationEdits: {} as Record<string, Record<string, string>>, // language code -> text key -> corrected text
  announcements: structuredClone(seedAnnouncements),
  newsletters: structuredClone(seedNewsletters),
  programs: structuredClone(seedPrograms),
  plans: structuredClone(seedPlans),
  promoCodes: structuredClone(seedPromoCodes),
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
  aiTools: structuredClone(seedAiTools),
  generationCosts: structuredClone(seedGenerationCosts),
  contentRules: structuredClone(seedContentRules),
  blockedGenerations: structuredClone(seedBlockedGenerations),
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

// Every admin action goes through here, so nothing is missing from the audit log.
export const logAction = (actor: Admin, action: AuditAction, target: AuditTarget, details: AuditDetails = {}) => {
  db.auditLog.unshift({ id: newId(), at: now(), actorId: actor.id, actorName: actor.name, action, target, details });
};

// The item with this id, or a "not found" error.
export const findById = <T extends { id: string }>(list: T[], id: string): T => {
  const item = list.find((current) => current.id === id);
  if (!item) throw new AdminApiError('notFound');
  return item;
};
