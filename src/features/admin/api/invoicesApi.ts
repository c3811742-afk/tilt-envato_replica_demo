import { vatRate } from '@/shared/constants';
import type { Invoice, InvoiceInput } from '@/features/admin/types';
import { AdminApiError } from './errors';
import { authorize, db, findById, logAction, newId, now, respond } from './mockServer';

const roundMoney = (value: number) => Math.round(value * 100) / 100;

// A made-up ETA document id. The real Tax Authority returns its own when it accepts a document.
const fakeEtaUuid = () => newId().replaceAll('-', '').slice(0, 20).toUpperCase();

// Demo stand-in for the Tax Authority's check: registration numbers starting with 000 aren't registered.
const etaRejects = (taxId: string) => taxId.startsWith('000');

// The next number in a series (EINV for invoices, ERCT for receipts), e.g. EINV-2026-00042 after EINV-2026-00041.
const nextNumber = (prefix: string) => {
  const year = now().slice(0, 4);
  const last = db.invoices
    .filter((invoice) => invoice.number.startsWith(`${prefix}-${year}-`))
    .reduce((highest, invoice) => Math.max(highest, Number(invoice.number.split('-')[2])), 0);
  return `${prefix}-${year}-${String(last + 1).padStart(5, '0')}`;
};

// Newest first.
export const fetchInvoices = () => respond(() => [...db.invoices].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)));

// Paid payments that don't have an accepted e-invoice or e-receipt yet.
export const fetchUninvoicedTransactions = () =>
  respond(() =>
    db.transactions.filter(
      (transaction) =>
        transaction.status !== 'refunded' &&
        !db.invoices.some((invoice) => invoice.transactionId === transaction.id && invoice.status === 'accepted'),
    ),
  );

// Sends an e-invoice (company, with a tax ID) or an e-receipt (person) to the Tax Authority.
// Demo: nothing is sent. A rejected document stays in the list with the reason, and can be issued again.
export const issueInvoice = (actorId: string, input: InvoiceInput) =>
  respond((): Invoice => {
    const actor = authorize(actorId, 'issueInvoices');
    const transaction = findById(db.transactions, input.transactionId);
    const issued = db.invoices.some((invoice) => invoice.transactionId === transaction.id && invoice.status === 'accepted');
    if (issued) throw new AdminApiError('invoiceExists');

    const isInvoice = input.kind === 'invoice';
    const taxId = isInvoice ? input.taxId.trim() : undefined;
    const rejected = Boolean(taxId && etaRejects(taxId));
    const amount = transaction.amount - transaction.refunded;
    const invoice: Invoice = {
      id: newId(),
      number: nextNumber(isInvoice ? 'EINV' : 'ERCT'),
      kind: input.kind,
      transactionId: transaction.id,
      customerName: transaction.customer.name,
      taxId,
      amount,
      vat: roundMoney(amount * vatRate),
      issuedAt: now(),
      status: rejected ? 'rejected' : 'accepted',
      etaUuid: rejected ? undefined : fakeEtaUuid(),
      rejectReason: rejected ? 'taxIdNotRegistered' : undefined,
    };
    db.invoices.push(invoice);
    logAction(actor, 'invoiceIssued', { kind: 'invoice', id: invoice.id, label: invoice.number }, {
      amount,
      change: rejected ? 'rejected' : 'approved',
    });
    return invoice;
  });
