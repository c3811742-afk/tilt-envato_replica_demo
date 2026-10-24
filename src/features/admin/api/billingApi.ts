import type { CancelInput, RefundInput } from '@/features/admin/types';
import { refundable } from '@/features/admin/utils/business';
import { AdminApiError } from './errors';
import { authorize, db, findById, logAction, now, respond } from './mockServer';

const newestFirst = <T extends { at: string }>(list: T[]) => [...list].sort((a, b) => b.at.localeCompare(a.at));

export const fetchTransactions = () => respond(() => newestFirst(db.transactions));

// Full or partial refund, back to the method the customer paid with. Demo: no money moves.
export const refundTransaction = (actorId: string, id: string, input: RefundInput) =>
  respond(() => {
    const actor = authorize(actorId, 'manageBilling');
    const transaction = findById(db.transactions, id);
    if (input.amount <= 0 || input.amount > refundable(transaction)) throw new AdminApiError('refundTooLarge');

    transaction.refunded += input.amount;
    transaction.status = refundable(transaction) === 0 ? 'refunded' : 'partlyRefunded';
    logAction(
      actor,
      'refundIssued',
      { kind: 'transaction', id: transaction.id, label: transaction.customer.name },
      { amount: input.amount, refundReason: input.reason, note: input.note || undefined },
    );
    return transaction;
  });

export const fetchFailedPayments = () => respond(() => newestFirst(db.failedPayments));

// Active first, then by renewal date.
export const fetchSubscriptions = () =>
  respond(() =>
    [...db.subscriptions].sort(
      (a, b) => Number(b.status !== 'canceled') - Number(a.status !== 'canceled') || a.renewsAt.localeCompare(b.renewsAt),
    ),
  );

// Now: access ends at once. At period end: the customer keeps access until the renewal date, then it stops.
export const cancelSubscription = (actorId: string, id: string, input: CancelInput) =>
  respond(() => {
    const actor = authorize(actorId, 'manageBilling');
    const subscription = findById(db.subscriptions, id);
    if (subscription.status === 'canceled') throw new AdminApiError('notActive');

    if (input.timing === 'now') {
      subscription.status = 'canceled';
      subscription.renewsAt = now();
    } else {
      subscription.status = 'canceling';
    }
    logAction(
      actor,
      'subscriptionCanceled',
      { kind: 'subscription', id: subscription.id, label: subscription.customer.name },
      { cancelReason: input.reason, note: input.note || undefined },
    );
    return subscription;
  });
