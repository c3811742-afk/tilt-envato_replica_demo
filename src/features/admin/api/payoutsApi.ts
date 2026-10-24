import { seedDownloadsByType, seedEarnings } from '@/features/admin/mocks';
import type { PayoutDecision, PayoutRules, PayoutStatus, Report, ReportKind } from '@/features/admin/types';
import { AdminApiError } from './errors';
import { authorize, db, findById, logAction, now, respond } from './mockServer';

export const fetchPayoutRules = () => respond(() => db.payoutRules);

// New rules apply to earnings from the next payout on.
export const savePayoutRules = (actorId: string, rules: PayoutRules) =>
  respond(() => {
    const actor = authorize(actorId, 'managePayouts');
    db.payoutRules = { ...rules };
    logAction(actor, 'payoutRulesSaved', { kind: 'payoutRules', id: 'rules', label: `${rules.creatorShare}%` }, {
      amount: rules.minimumPayout,
    });
    return db.payoutRules;
  });

// Requests waiting for a decision first, then newest first.
export const fetchPayouts = () =>
  respond(() =>
    [...db.payouts].sort(
      (a, b) =>
        Number(b.status === 'pending') - Number(a.status === 'pending') || b.requestedAt.localeCompare(a.requestedAt),
    ),
  );

// What each decision needs the payout to be in first: approve or reject a request, then mark it paid or failed.
const allowedFrom: Record<PayoutDecision, PayoutStatus> = {
  approved: 'pending',
  rejected: 'pending',
  paid: 'approved',
  failed: 'approved',
};

export const decidePayout = (actorId: string, id: string, decision: PayoutDecision, note = '') =>
  respond(() => {
    const actor = authorize(actorId, 'managePayouts');
    const payout = findById(db.payouts, id);
    if (payout.status !== allowedFrom[decision]) throw new AdminApiError('payoutChanged');

    payout.status = decision;
    payout.note = note.trim() || undefined;
    payout.updatedAt = now();
    logAction(actor, 'payoutUpdated', { kind: 'payout', id: payout.id, label: payout.creator.name }, {
      change: decision,
      amount: payout.amount,
      note: payout.note,
    });
    return payout;
  });

const inMonth = (iso: string, month: string) => iso.startsWith(month);

// Column keys and rows for each report. The page turns the keys into headers in the admin's language.
const buildReport: Record<ReportKind, (month: string) => Pick<Report, 'columns' | 'rows'>> = {
  subscriptions: () => ({
    columns: ['plan', 'subscribers', 'monthlyPrice', 'mrr'],
    rows: db.plans.map((plan) => [plan.name.en, plan.subscribers, plan.monthlyPrice, plan.subscribers * plan.monthlyPrice]),
  }),
  revenue: (month) => ({
    columns: ['date', 'customer', 'plan', 'method', 'amount', 'refunded'],
    rows: db.transactions
      .filter((transaction) => inMonth(transaction.at, month))
      .map((transaction) => [
        transaction.at.slice(0, 10),
        transaction.customer.name,
        transaction.planName,
        transaction.method,
        transaction.amount,
        transaction.refunded,
      ]),
  }),
  downloads: (month) => ({
    columns: ['type', 'downloads'],
    rows: seedDownloadsByType.filter((row) => row.month === month).map((row) => [row.type, row.downloads]),
  }),
  earnings: (month) => ({
    columns: ['creator', 'downloads', 'earnings'],
    rows: seedEarnings.filter((row) => row.month === month).map((row) => [row.creator, row.downloads, row.earnings]),
  }),
  payouts: (month) => ({
    columns: ['date', 'creator', 'method', 'amount', 'status'],
    rows: db.payouts
      .filter((payout) => inMonth(payout.requestedAt, month))
      .map((payout) => [payout.requestedAt.slice(0, 10), payout.creator.name, payout.method, payout.amount, payout.status]),
  }),
};

// Builds a report for a month (YYYY-MM). Every export is logged, since reports hold customer and earnings data.
export const exportReport = (actorId: string, kind: ReportKind, month: string) =>
  respond((): Report => {
    const actor = authorize(actorId, 'exportReports');
    const report = { kind, month, ...buildReport[kind](month) };
    logAction(actor, 'reportExported', { kind: 'report', id: `${kind}-${month}`, label: month }, { reportKind: kind });
    return report;
  });
