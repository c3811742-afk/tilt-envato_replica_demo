import { generatePath } from 'react-router';
import type { Permission } from '@/features/admin/constants';
import type { AdminSearchGroup, AdminSearchResult } from '@/features/admin/types';
import { hasPermission } from '@/features/admin/utils/permissions';
import { routes } from '@/shared/constants';
import { articleStore, faqStore, matchesText, promoCodeStore } from '@/shared/utils';
import { allTransactions } from './billingApi';
import { allCategories } from './catalogApi';
import { allElements } from './elementsApi';
import { allLicenses } from './licensesApi';
import { db, respond } from './mockServer';
import { allTickets } from './supportApi';
import { allApplications, allUsers } from './usersApi';

const perGroup = 5; // the best few; the page they link to has the rest

const withTab = (path: string, tab: string) => `${path}?${new URLSearchParams({ tab })}`;

// One kind of thing the admin can find, who can see it, and how to turn each match into a result.
interface SearchSource {
  group: AdminSearchGroup;
  permissions: Permission[]; // any of these
  find: (query: string) => Omit<AdminSearchResult, 'group'>[];
}

const sources: SearchSource[] = [
  {
    group: 'people',
    permissions: ['manageUsers'],
    find: (query) =>
      allUsers()
        .filter((user) => matchesText(query, ...[user.name, user.email]))
        .map((user) => ({ id: user.id, title: user.name, detail: user.email, to: generatePath(routes.adminUser, { userId: user.id }) })),
  },
  {
    group: 'elements',
    permissions: ['review', 'unpublish'],
    find: (query) =>
      allElements()
        .filter((element) => matchesText(query, ...[element.title, element.creator.name, ...element.tags]))
        .map((element) => ({
          id: element.id,
          title: element.title,
          detail: element.creator.name,
          to: generatePath(routes.adminReviewElement, { elementId: element.id }),
        })),
  },
  {
    group: 'categories',
    permissions: ['manageCatalog'],
    find: (query) =>
      allCategories()
        .filter((category) => matchesText(query, ...[category.name.en, category.name.ar]))
        .map((category) => ({
          id: category.id,
          title: category.name.en,
          titles: category.name,
          to: generatePath(routes.adminCategory, { categoryId: category.id }),
        })),
  },
  {
    group: 'tags',
    permissions: ['manageCatalog'],
    find: (query) => db.tags.filter((tag) => matchesText(query, ...[tag.name])).map((tag) => ({ id: tag.id, title: tag.name, to: routes.adminTags })),
  },
  {
    group: 'tickets',
    permissions: ['handleSupport'],
    find: (query) =>
      allTickets()
        .filter((ticket) => matchesText(query, ...[ticket.subject, ticket.requester.name, ticket.requester.email, ticket.reference ?? '']))
        .map((ticket) => ({
          id: ticket.id,
          title: ticket.subject,
          detail: ticket.requester.name,
          to: generatePath(routes.adminTicket, { ticketId: ticket.id }),
        })),
  },
  {
    group: 'licenses',
    permissions: ['manageLicenses'],
    find: (query) =>
      allLicenses()
        .filter((license) => matchesText(query, ...[license.code, license.element.title, license.customer.name, license.customer.email]))
        .map((license) => ({ id: license.id, title: license.code, detail: license.element.title, to: routes.adminLicenses })),
  },
  {
    group: 'payments',
    permissions: ['manageBilling'],
    find: (query) =>
      allTransactions()
        .filter((transaction) => matchesText(query, ...[transaction.id, transaction.customer.name, transaction.customer.email]))
        .map((transaction) => ({
          id: transaction.id,
          title: transaction.customer.name,
          detail: transaction.planName,
          to: routes.adminBilling,
        })),
  },
  {
    group: 'invoices',
    permissions: ['issueInvoices'],
    find: (query) =>
      db.invoices
        .filter((invoice) => matchesText(query, ...[invoice.number, invoice.customerName]))
        .map((invoice) => ({ id: invoice.id, title: invoice.number, detail: invoice.customerName, to: routes.adminInvoices })),
  },
  {
    group: 'promoCodes',
    permissions: ['managePlans'],
    find: (query) =>
      promoCodeStore
        .get()
        .filter((promo) => matchesText(query, ...[promo.code]))
        .map((promo) => ({ id: promo.id, title: promo.code, to: withTab(routes.adminPlans, 'promoCodes') })),
  },
  {
    group: 'applications',
    permissions: ['reviewCreators'],
    find: (query) =>
      allApplications()
        .filter((application) => matchesText(query, ...[application.id, application.name, application.email]))
        .map((application) => ({ id: application.id, title: application.name, detail: application.id, to: routes.adminCreators })),
  },
  {
    group: 'content',
    permissions: ['manageContent'],
    find: (query) => [
      ...faqStore
        .get()
        .filter((faq) => matchesText(query, ...[faq.question.en, faq.question.ar]))
        .map((faq) => ({ id: faq.id, title: faq.question.en, titles: faq.question, to: withTab(routes.adminContent, 'faqs') })),
      ...articleStore
        .get()
        .filter((article) => matchesText(query, ...[article.title.en, article.title.ar]))
        .map((article) => ({
          id: article.id,
          title: article.title.en,
          titles: article.title,
          to: withTab(routes.adminContent, article.kind === 'releaseNote' ? 'releaseNotes' : article.kind),
        })),
    ],
  },
  {
    group: 'admins',
    permissions: ['manageAdmins'],
    find: (query) =>
      db.admins
        .filter((admin) => matchesText(query, ...[admin.name, admin.email]))
        .map((admin) => ({ id: admin.id, title: admin.name, detail: admin.email, to: routes.adminAdmins })),
  },
];

export interface AdminSearchResults {
  groups: { group: AdminSearchGroup; results: AdminSearchResult[]; total: number }[];
}

// Everything matching the search that this admin's role can see, a few per kind. Empty groups are left out.
export const searchEverything = (actorId: string, query: string) =>
  respond((): AdminSearchResults => {
    const actor = db.admins.find((admin) => admin.id === actorId);
    if (!actor || !query.trim()) return { groups: [] };
    const groups = sources
      .filter((source) => source.permissions.some((permission) => hasPermission(actor.role, permission)))
      .map((source) => {
        const found = source.find(query);
        return { group: source.group, total: found.length, results: found.slice(0, perGroup).map((result) => ({ ...result, group: source.group })) };
      })
      .filter((group) => group.total > 0);
    return { groups };
  });
