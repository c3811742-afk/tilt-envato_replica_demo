import type { ItemReport, ItemReportKind, ItemReportResolution, Ticket, TicketStatus, TicketTopic, UnpublishReason } from '@/features/admin/types';
import { routes, type SupportTopic } from '@/shared/constants';
import type { Download, SupportRequest } from '@/shared/types';
import { readAccounts, saveAccount, withAlert, type StoredAccount } from '@/shared/utils';
import { takeElementDown } from './elementsApi';
import { AdminApiError } from './errors';
import { authorize, db, findById, logAction, newId, now, respond } from './mockServer';

// ---------- Requests from the customer side ----------
// The contact form on the site keeps each request on the customer's account. Replies and closing are saved there too,
// so the customer sees them on their support page and gets a notification.

const topicFromSite: Record<SupportTopic, TicketTopic> = {
  account: 'account',
  billing: 'billing',
  downloads: 'downloads',
  licensing: 'licenses',
  ai: 'ai',
  other: 'other',
};

const fromSiteRequest = (account: StoredAccount, request: SupportRequest): Ticket => {
  const replies = request.replies ?? [];
  return {
    id: request.id,
    reference: request.reference,
    subject: request.subject,
    requester: { name: account.name, email: account.email, kind: 'customer' },
    topic: topicFromSite[request.topic],
    status: request.status,
    updatedAt: replies.at(-1)?.at ?? request.createdAt,
    messages: [
      { id: `${request.id}-0`, fromSupport: false, authorName: account.name, body: request.message, at: request.createdAt },
      ...replies.map((reply, index) => ({
        id: `${request.id}-${index + 1}`,
        fromSupport: true,
        authorName: reply.by,
        body: reply.message,
        at: reply.at,
      })),
    ],
    source: 'site',
  };
};

const siteRequests = () =>
  readAccounts().flatMap((account) => account.supportRequests.map((request) => ({ account, request })));

export const allTickets = () => [
  ...siteRequests().map(({ account, request }) => fromSiteRequest(account, request)),
  ...db.tickets,
];

// Saves a change to a site request on its account, and returns it as a ticket.
const updateSiteRequest = (id: string, change: (request: SupportRequest) => SupportRequest, notify: boolean) => {
  const found = siteRequests().find(({ request }) => request.id === id);
  if (!found) throw new AdminApiError('notFound');
  const updated = change(found.request);
  let account: StoredAccount = {
    ...found.account,
    supportRequests: found.account.supportRequests.map((request) => (request.id === id ? updated : request)),
  };
  if (notify) account = withAlert(account, 'supportReply', { subject: updated.subject }, routes.support);
  saveAccount(account);
  return fromSiteRequest(account, updated);
};

// Tickets waiting for support first, then most recently updated.
const ticketOrder: Record<TicketStatus, number> = { open: 0, answered: 1, closed: 2 };

export const fetchTickets = () =>
  respond(() =>
    allTickets().sort((a, b) => ticketOrder[a.status] - ticketOrder[b.status] || b.updatedAt.localeCompare(a.updatedAt)),
  );

// null when the ticket doesn't exist: the page shows "Ticket not found".
export const fetchTicket = (id: string) => respond(() => allTickets().find((ticket) => ticket.id === id) ?? null);

// The reply is emailed to the customer or creator (demo: not sent). The ticket then waits for their answer.
export const replyToTicket = (actorId: string, id: string, body: string) =>
  respond(() => {
    const actor = authorize(actorId, 'handleSupport');
    const found = findById(allTickets(), id);
    if (found.status === 'closed') throw new AdminApiError('ticketClosed');

    const at = now();
    if (found.source === 'site') {
      const saved = updateSiteRequest(
        id,
        (request) => ({ ...request, status: 'answered', replies: [...(request.replies ?? []), { message: body.trim(), by: actor.name, at }] }),
        true,
      );
      logAction(actor, 'ticketReplied', { kind: 'ticket', id, label: saved.subject });
      return saved;
    }
    const ticket = findById(db.tickets, id);
    ticket.messages.push({ id: newId(), fromSupport: true, authorName: actor.name, body: body.trim(), at });
    ticket.status = 'answered';
    ticket.updatedAt = at;
    logAction(actor, 'ticketReplied', { kind: 'ticket', id: ticket.id, label: ticket.subject });
    return ticket;
  });

export const setTicketClosed = (actorId: string, id: string, closed: boolean) =>
  respond(() => {
    const actor = authorize(actorId, 'handleSupport');
    if (findById(allTickets(), id).source === 'site') {
      const saved = updateSiteRequest(id, (request) => ({ ...request, status: closed ? 'closed' : 'open' }), false);
      logAction(actor, 'ticketUpdated', { kind: 'ticket', id, label: saved.subject }, { change: closed ? 'closed' : 'reopened' });
      return saved;
    }
    const ticket = findById(db.tickets, id);
    ticket.status = closed ? 'closed' : 'open';
    ticket.updatedAt = now();
    logAction(actor, 'ticketUpdated', { kind: 'ticket', id: ticket.id, label: ticket.subject }, {
      change: closed ? 'closed' : 'reopened',
    });
    return ticket;
  });

// Broken downloads reported on the customer side. The admin's answer is kept on the download itself.
const siteReportId = (accountId: string, download: Download) => `site-${accountId}-${download.id}`;

const siteItemReports = (): ItemReport[] =>
  readAccounts().flatMap((account) =>
    account.downloads.flatMap((download): ItemReport[] =>
      download.reportedBroken
        ? [
            {
              id: siteReportId(account.id, download),
              element: { id: download.itemId, title: download.itemTitle },
              kind: 'brokenFiles',
              reporter: account.email,
              note: download.reportedBroken.reason,
              reportedAt: download.reportedBroken.at,
              status: download.reportedBroken.answer ?? 'open',
              source: 'site',
            },
          ]
        : [],
    ),
  );

const allItemReports = () => [...siteItemReports(), ...db.itemReports];

// Open reports first, then newest first.
export const fetchItemReports = () =>
  respond(() =>
    allItemReports().sort(
      (a, b) => Number(b.status === 'open') - Number(a.status === 'open') || b.reportedAt.localeCompare(a.reportedAt),
    ),
  );

// The unpublish reason the creator is given when a report gets their element removed.
const removalReason: Record<ItemReportKind, UnpublishReason> = {
  brokenFiles: 'brokenFiles',
  infringement: 'copyright',
  wrongCategory: 'contentGuidelines',
  offensive: 'contentGuidelines',
};

// Fixed: the problem was solved. Removed: the element is unpublished. Dismissed: nothing was wrong.
export const resolveItemReport = (actorId: string, id: string, resolution: ItemReportResolution) =>
  respond(() => {
    const actor = authorize(actorId, 'handleSupport');
    const report = findById(allItemReports(), id);
    if (report.status !== 'open') throw new AdminApiError('alreadyClosed');

    report.status = resolution;
    if (report.source === 'site') {
      // Saved on the reporter's download, and they're told the outcome.
      const reporter = readAccounts().find((account) => account.downloads.some((download) => siteReportId(account.id, download) === id));
      if (reporter) {
        const updated: StoredAccount = {
          ...reporter,
          downloads: reporter.downloads.map((download) =>
            siteReportId(reporter.id, download) === id && download.reportedBroken ? { ...download, reportedBroken: { ...download.reportedBroken, answer: resolution } } : download,
          ),
        };
        saveAccount(withAlert(updated, 'reportAnswered', { title: report.element.title, outcome: resolution }));
      }
    }
    else db.itemReports = db.itemReports.map((current) => (current.id === id ? report : current));
    if (resolution === 'removed') {
      takeElementDown(actor, report.element.id, { reason: removalReason[report.kind], note: report.note });
    }
    logAction(actor, 'itemReportResolved', { kind: 'itemReport', id: report.id, label: report.element.title }, {
      change: resolution,
    });
    return report;
  });
