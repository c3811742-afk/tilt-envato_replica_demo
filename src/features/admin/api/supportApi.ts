import type { ItemReportKind, ItemReportResolution, TicketStatus, UnpublishReason } from '@/features/admin/types';
import { takeElementDown } from './elementsApi';
import { AdminApiError } from './errors';
import { authorize, db, findById, logAction, newId, now, respond } from './mockServer';

// Tickets waiting for support first, then most recently updated.
const ticketOrder: Record<TicketStatus, number> = { open: 0, answered: 1, closed: 2 };

export const fetchTickets = () =>
  respond(() =>
    [...db.tickets].sort((a, b) => ticketOrder[a.status] - ticketOrder[b.status] || b.updatedAt.localeCompare(a.updatedAt)),
  );

// null when the ticket doesn't exist: the page shows "Ticket not found".
export const fetchTicket = (id: string) => respond(() => db.tickets.find((ticket) => ticket.id === id) ?? null);

// The reply is emailed to the customer or creator (demo: not sent). The ticket then waits for their answer.
export const replyToTicket = (actorId: string, id: string, body: string) =>
  respond(() => {
    const actor = authorize(actorId, 'handleSupport');
    const ticket = findById(db.tickets, id);
    if (ticket.status === 'closed') throw new AdminApiError('ticketClosed');

    const at = now();
    ticket.messages.push({ id: newId(), fromSupport: true, authorName: actor.name, body: body.trim(), at });
    ticket.status = 'answered';
    ticket.updatedAt = at;
    logAction(actor, 'ticketReplied', { kind: 'ticket', id: ticket.id, label: ticket.subject });
    return ticket;
  });

export const setTicketClosed = (actorId: string, id: string, closed: boolean) =>
  respond(() => {
    const actor = authorize(actorId, 'handleSupport');
    const ticket = findById(db.tickets, id);
    ticket.status = closed ? 'closed' : 'open';
    ticket.updatedAt = now();
    logAction(actor, 'ticketUpdated', { kind: 'ticket', id: ticket.id, label: ticket.subject }, {
      change: closed ? 'closed' : 'reopened',
    });
    return ticket;
  });

// Open reports first, then newest first.
export const fetchItemReports = () =>
  respond(() =>
    [...db.itemReports].sort(
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
    const report = findById(db.itemReports, id);
    if (report.status !== 'open') throw new AdminApiError('alreadyClosed');

    report.status = resolution;
    if (resolution === 'removed') {
      takeElementDown(actor, report.element.id, { reason: removalReason[report.kind], note: report.note });
    }
    logAction(actor, 'itemReportResolved', { kind: 'itemReport', id: report.id, label: report.element.title }, {
      change: resolution,
    });
    return report;
  });
