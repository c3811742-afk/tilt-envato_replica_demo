import { vatRate } from '@/shared/constants';
import type { Invoice, InvoiceInput } from '@/features/admin/types';
import { readAccounts, saveAccount } from '@/shared/utils';
import { allTransactions } from './billingApi';
import { AdminApiError } from './errors';
import { authorize, db, findById, logAction, newId, now, respond } from './mockServer';

const roundMoney = (value: number) => Math.round(value * 100) / 100;

// A made-up ETA document id. The real Tax Authority returns its own when it accepts a document.
const fakeEtaUuid = () => newId().replaceAll('-', '').slice(0, 20).toUpperCase();

// Demo stand-in for the Tax Authority's check: registration numbers starting with 000 aren't registered.
const etaRejects = (taxId: string) => taxId.startsWith('000');

// Documents for payments made on the site are kept on the customer's invoice (they see the number there); the demo's
// own are listed after them.
const siteDocuments = () => readAccounts().flatMap((account) => account.invoices.flatMap((invoice) => invoice.taxDocuments ?? []));
const allDocuments = () => [...siteDocuments(), ...db.invoices];

const hasAcceptedDocument = (transactionId: string) =>
  allDocuments().some((invoice) => invoice.transactionId === transactionId && invoice.status === 'accepted');

// The next number in a series (EINV for invoices, ERCT for receipts), e.g. EINV-2026-00042 after EINV-2026-00041.
const nextNumber = (prefix: string) => {
  const year = now().slice(0, 4);
  const last = allDocuments()
    .filter((invoice) => invoice.number.startsWith(`${prefix}-${year}-`))
    .reduce((highest, invoice) => Math.max(highest, Number(invoice.number.split('-')[2])), 0);
  return `${prefix}-${year}-${String(last + 1).padStart(5, '0')}`;
};

// Newest first.
export const fetchInvoices = () => respond(() => allDocuments().sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)));

// Paid payments, including the ones customers made on the site, that don't have an accepted e-invoice or e-receipt yet.
export const fetchUninvoicedTransactions = () =>
  respond(() =>
    allTransactions().filter((transaction) => transaction.status !== 'refunded' && !hasAcceptedDocument(transaction.id)),
  );

// Sends an e-invoice (company, with a tax ID) or an e-receipt (person) to the Tax Authority.
// Demo: nothing is sent. A rejected document stays in the list with the reason, and can be issued again.
export const issueInvoice = (actorId: string, input: InvoiceInput) =>
  respond((): Invoice => {
    const actor = authorize(actorId, 'issueInvoices');
    const transaction = findById(allTransactions(), input.transactionId);
    if (hasAcceptedDocument(transaction.id)) throw new AdminApiError('invoiceExists');

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
    const customer = transaction.source === 'site' && readAccounts().find((account) => account.invoices.some((current) => current.id === transaction.id));
    if (customer) {
      // On the customer's invoice: an accepted document's tax authority ID replaces the one the invoice had.
      saveAccount({
        ...customer,
        invoices: customer.invoices.map((current) =>
          current.id === transaction.id
            ? { ...current, taxDocuments: [...(current.taxDocuments ?? []), invoice], taxUuid: invoice.etaUuid ?? current.taxUuid }
            : current,
        ),
      });
    } else {
      db.invoices.push(invoice);
    }
    logAction(actor, 'invoiceIssued', { kind: 'invoice', id: invoice.id, label: invoice.number }, {
      amount,
      change: rejected ? 'rejected' : 'approved',
    });
    return invoice;
  });
