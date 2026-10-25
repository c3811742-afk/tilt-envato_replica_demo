import { seedDownloadsByType, seedEarnings } from '@/features/admin/mocks';
import type { Payout, PayoutDecision, PayoutMethod, PayoutRules, PayoutStatus, Report, ReportKind } from '@/features/admin/types';
import { AdminApiError } from './errors';
import { authorize, db, findById, logAction, now, respond } from './mockServer';
import { allPlans } from './plansApi';
import { allTransactions } from './billingApi';
import { typeOfCategory } from './elementsApi';
import { mockItems } from '@/shared/mocks';
import type { PayoutMethod as CreatorPayoutMethod, StudioPayout, StudioPayoutStatus } from '@/shared/types';
import { applyStudioPayoutDecision, findAccountById, payoutRulesStore, readAccounts, readStudioPayouts } from '@/shared/utils';

// Downloads customers made on the site in a month, with the item each one was for.
const siteDownloads = (month: string) =>
  readAccounts()
    .flatMap((account) => account.downloads)
    .filter((download) => download.requestedAt.startsWith(month))
    .flatMap((download) => {
      const item = mockItems.find((candidate) => candidate.id === download.itemId);
      return item ? [{ download, item }] : [];
    });

// Adds site counts to the seed rows with the same key (a type, a creator), and adds rows for new keys.
const addCounts = (rows: [string, number][], counts: Map<string, number>) => {
  const merged = new Map(rows);
  counts.forEach((count, key) => merged.set(key, (merged.get(key) ?? 0) + count));
  return [...merged];
};

const countBy = <T>(list: T[], key: (entry: T) => string) =>
  list.reduce((counts, entry) => counts.set(key(entry), (counts.get(key(entry)) ?? 0) + 1), new Map<string, number>());

// Creators earn the creator share of the month's site revenue, split by how often their items were downloaded
// (the rule in the creator agreement). Rounded to whole pounds.
const siteEarnings = (month: string) => {
  const downloads = siteDownloads(month);
  const revenue = allTransactions()
    .filter((transaction) => transaction.source === 'site' && transaction.at.startsWith(month))
    .reduce((total, transaction) => total + transaction.amount - transaction.refunded, 0);
  const pool = (revenue * payoutRulesStore.get().creatorShare) / 100;
  const byCreator = countBy(downloads, ({ item }) => item.creator.name);
  return [...byCreator].map(([creator, count]): [string, number, number] => [creator, count, Math.round((pool * count) / downloads.length)]);
};

// Saved where the creator studio reads them: the minimum payout and the payout day show to creators right away.
export const fetchPayoutRules = () => respond(() => payoutRulesStore.get());

// New rules apply to earnings from the next payout on.
export const savePayoutRules = (actorId: string, rules: PayoutRules) =>
  respond(() => {
    const actor = authorize(actorId, 'managePayouts');
    payoutRulesStore.set({ ...rules });
    logAction(actor, 'payoutRulesSaved', { kind: 'payoutRules', id: 'rules', label: `${rules.creatorShare}%` }, {
      amount: rules.minimumPayout,
    });
    return payoutRulesStore.get();
  });

// ---------- Creators' payout requests ----------
// Requests creators made in the creator studio, alongside the demo ones. Decisions are saved on the creator's
// request and they are told.

const creatorMethod: Record<CreatorPayoutMethod, PayoutMethod> = { bankTransfer: 'bank', instapay: 'instapay', vodafoneCash: 'vodafoneCash' };
const studioStatus: Record<StudioPayoutStatus, PayoutStatus> = { requested: 'pending', approved: 'approved', paid: 'paid', failed: 'failed', rejected: 'rejected' };

const fromStudio = (payout: StudioPayout): Payout => ({
  id: payout.id,
  creator: { id: payout.creatorId, name: findAccountById(payout.creatorId)?.name ?? '' },
  amount: payout.amount,
  method: payout.method ? creatorMethod[payout.method] : 'bank',
  account: payout.accountEnding ? `•••• ${payout.accountEnding}` : '',
  requestedAt: payout.requestedAt,
  status: studioStatus[payout.status],
  note: payout.note,
  updatedAt: payout.updatedAt ?? payout.requestedAt,
  source: 'site',
});

export const allPayouts = () => [...readStudioPayouts().map(fromStudio), ...db.payouts];

// Requests waiting for a decision first, then newest first.
export const fetchPayouts = () =>
  respond(() =>
    allPayouts().sort(
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
    const payout = findById(allPayouts(), id);
    if (payout.status !== allowedFrom[decision]) throw new AdminApiError('payoutChanged');

    if (payout.source === 'site') {
      const saved = applyStudioPayoutDecision(id, decision, note);
      if (!saved) throw new AdminApiError('notFound');
      Object.assign(payout, fromStudio(saved));
    } else {
      payout.status = decision;
      payout.note = note.trim() || undefined;
      payout.updatedAt = now();
    }
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
    rows: allPlans().map((plan) => [plan.name.en, plan.subscribers, plan.monthlyPrice ?? 0, plan.subscribers * (plan.monthlyPrice ?? 0)]),
  }),
  revenue: (month) => ({
    columns: ['date', 'customer', 'plan', 'method', 'amount', 'refunded'],
    rows: allTransactions()
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
    rows: addCounts(
      seedDownloadsByType.filter((row) => row.month === month).map((row): [string, number] => [row.type, row.downloads]),
      countBy(siteDownloads(month), ({ item }) => typeOfCategory[item.categoryId]),
    ),
  }),
  earnings: (month) => ({
    columns: ['creator', 'downloads', 'earnings'],
    rows: (() => {
      const rows = new Map(seedEarnings.filter((row) => row.month === month).map((row) => [row.creator, [row.downloads, row.earnings]]));
      siteEarnings(month).forEach(([creator, downloads, earnings]) => {
        const [seedDownloads, seedEarned] = rows.get(creator) ?? [0, 0];
        rows.set(creator, [seedDownloads + downloads, seedEarned + earnings]);
      });
      return [...rows].map(([creator, [downloads, earnings]]) => [creator, downloads, earnings]);
    })(),
  }),
  payouts: (month) => ({
    columns: ['date', 'creator', 'method', 'amount', 'status'],
    rows: allPayouts()
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
