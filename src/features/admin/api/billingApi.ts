import type { CancelInput, FailedPayment, RefundInput, Subscription, Transaction } from '@/features/admin/types';
import { refundable } from '@/features/admin/utils/business';
import { texts } from '@/shared/constants';
import type { Invoice } from '@/shared/types';
import { readAccounts, saveAccount, type StoredAccount } from '@/shared/utils';
import { AdminApiError } from './errors';
import { authorize, db, findById, logAction, now, respond } from './mockServer';

const newestFirst = <T extends { at: string }>(list: T[]) => [...list].sort((a, b) => b.at.localeCompare(a.at));

// ---------- Payments and plans from the customer side ----------
// Every invoice and plan on the site's accounts in this browser. Refunds and cancellations are saved on the account.

const customerOf = (account: StoredAccount) => ({ id: account.id, name: account.name, email: account.email });

// What was bought, in English like the demo data: "Ultimate", "One-week pass".
const purchaseName = (invoice: Invoice) => {
  const line = invoice.lines[0];
  if (line?.kind === 'pass') return texts.en.pricing.passes[line.passId].name;
  if (line && 'planId' in line) return texts.en.pricing.plans[line.planId].name;
  return invoice.number;
};

const transactionStatus = (invoice: Invoice): Transaction['status'] => {
  const refunded = invoice.refunded ?? 0;
  if (refunded === 0) return 'paid';
  return refunded >= invoice.total ? 'refunded' : 'partlyRefunded';
};

const siteInvoices = () => readAccounts().flatMap((account) => account.invoices.map((invoice) => ({ account, invoice })));

const siteTransactions = (): Transaction[] =>
  siteInvoices()
    .filter(({ invoice }) => invoice.status === 'paid' && invoice.total > 0)
    .map(({ account, invoice }) => ({
      id: invoice.id,
      at: invoice.issuedAt,
      customer: customerOf(account),
      planName: purchaseName(invoice),
      amount: invoice.total,
      refunded: invoice.refunded ?? 0,
      method: invoice.paymentMethod,
      status: transactionStatus(invoice),
      source: 'site',
    }));

export const allTransactions = () => [...siteTransactions(), ...db.transactions];

export const fetchTransactions = () => respond(() => newestFirst(allTransactions()));

// Full or partial refund, back to the method the customer paid with. Demo: no money moves.
// A site payment's refund shows on the customer's invoice in Billing.
export const refundTransaction = (actorId: string, id: string, input: RefundInput) =>
  respond(() => {
    const actor = authorize(actorId, 'manageBilling');
    const found = findById(allTransactions(), id);
    if (input.amount <= 0 || input.amount > refundable(found)) throw new AdminApiError('refundTooLarge');

    const refunded = found.refunded + input.amount;
    const transaction: Transaction = { ...found, refunded, status: refunded >= found.amount ? 'refunded' : 'partlyRefunded' };
    if (found.source === 'site') {
      const site = siteInvoices().find(({ invoice }) => invoice.id === id);
      if (!site) throw new AdminApiError('notFound');
      saveAccount({
        ...site.account,
        invoices: site.account.invoices.map((invoice) => (invoice.id === id ? { ...invoice, refunded } : invoice)),
      });
    } else {
      db.transactions = db.transactions.map((current) => (current.id === id ? transaction : current));
    }
    logAction(
      actor,
      'refundIssued',
      { kind: 'transaction', id: transaction.id, label: transaction.customer.name },
      { amount: input.amount, refundReason: input.reason, note: input.note || undefined },
    );
    return transaction;
  });

const siteFailedPayments = (): FailedPayment[] =>
  siteInvoices()
    .filter(({ invoice }) => invoice.status === 'failed')
    .map(({ account, invoice }) => ({
      id: invoice.id,
      at: invoice.issuedAt,
      customer: customerOf(account),
      planName: purchaseName(invoice),
      amount: invoice.total,
      method: invoice.paymentMethod,
      reason: invoice.paymentMethod === 'fawry' ? 'fawryNotPaid' : 'declined',
      attempts: 1,
      source: 'site',
    }));

export const fetchFailedPayments = () => respond(() => newestFirst([...siteFailedPayments(), ...db.failedPayments]));

const siteSubscriptions = (): Subscription[] =>
  readAccounts().flatMap((account): Subscription[] => {
    const subscription = account.subscription;
    if (!subscription) return [];
    const ended = new Date(subscription.endsAt).getTime() <= Date.now();
    return [
      {
        id: `site-${account.id}`,
        customer: customerOf(account),
        planName: texts.en.pricing.plans[subscription.planId].name,
        period: subscription.duration === 12 ? 'yearly' : 'monthly',
        status: ended ? 'canceled' : subscription.canceledAt ? 'canceling' : 'active',
        startedAt: subscription.startedAt,
        renewsAt: subscription.endsAt,
        source: 'site',
      },
    ];
  });

const allSubscriptions = () => [...siteSubscriptions(), ...db.subscriptions];

// Active first, then by renewal date.
export const fetchSubscriptions = () =>
  respond(() =>
    allSubscriptions().sort(
      (a, b) => Number(b.status !== 'canceled') - Number(a.status !== 'canceled') || a.renewsAt.localeCompare(b.renewsAt),
    ),
  );

// Now: access ends at once. At period end: the customer keeps access until the renewal date, then it stops.
// A site plan is changed on the customer's account, so their plan page shows it.
export const cancelSubscription = (actorId: string, id: string, input: CancelInput) =>
  respond(() => {
    const actor = authorize(actorId, 'manageBilling');
    const found = findById(allSubscriptions(), id);
    if (found.status === 'canceled') throw new AdminApiError('notActive');

    const at = now();
    const subscription: Subscription =
      input.timing === 'now' ? { ...found, status: 'canceled', renewsAt: at } : { ...found, status: 'canceling' };
    if (found.source === 'site') {
      const account = readAccounts().find((current) => `site-${current.id}` === id);
      if (!account?.subscription) throw new AdminApiError('notFound');
      saveAccount({
        ...account,
        subscription: {
          ...account.subscription,
          autoRenew: false,
          canceledAt: at,
          ...(input.timing === 'now' && { endsAt: at }),
        },
      });
    } else {
      db.subscriptions = db.subscriptions.map((current) => (current.id === id ? subscription : current));
    }
    logAction(
      actor,
      'subscriptionCanceled',
      { kind: 'subscription', id: subscription.id, label: subscription.customer.name },
      { cancelReason: input.reason, note: input.note || undefined },
    );
    return subscription;
  });
