import { mockPasses, mockPlans } from '@/shared/mocks';
import type { Download, PassPurchase, Subscription, UserCollection } from '@/shared/types';
import { isSubscriptionActive } from './session';

export interface DownloadAllowance {
  source: 'plan' | 'pass' | null; // what the downloads come from (null: no plan or pass)
  limit: number | null; // downloads in the period; null: unlimited
  used: number;
  remaining: number | null; // null: unlimited
  resetsAt: string | null; // ISO date the count starts again (plans count per month)
}

const counts = (download: Download, since: Date) => !download.reportedBroken && new Date(download.requestedAt) >= since;

// The start of the current month of a plan: plans count downloads and AI credits per month, from the day they started.
export const monthStart = (subscription: Pick<Subscription, 'startedAt'>, now: Date) => {
  const start = new Date(subscription.startedAt);
  const months = (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth() - (now.getDate() < start.getDate() ? 1 : 0);
  const current = new Date(start);
  current.setMonth(start.getMonth() + Math.max(0, months));
  return current;
};

// How many downloads the user has left. A plan comes first; a project pass is used when there's no plan.
// Free items of the month and downloads reported as broken don't count.
export const downloadAllowance = (
  downloads: Download[],
  subscription: Subscription | null,
  pass: PassPurchase | null,
  freeItemIds: ReadonlySet<string>,
  now: Date = new Date(),
): DownloadAllowance => {
  const paid = downloads.filter((download) => !freeItemIds.has(download.itemId));
  if (subscription && isSubscriptionActive(subscription, now)) {
    const plan = mockPlans.find((candidate) => candidate.id === subscription.planId);
    const since = monthStart(subscription, now);
    const used = paid.filter((download) => counts(download, since)).length;
    const limit = plan?.downloadsPerMonth == null ? null : plan.downloadsPerMonth * (plan.perMember ? subscription.members : 1);
    const resets = new Date(since);
    resets.setMonth(resets.getMonth() + 1);
    return { source: 'plan', limit, used, remaining: limit === null ? null : Math.max(0, limit - used), resetsAt: resets.toISOString() };
  }
  if (pass && new Date(pass.endsAt) > now && mockPasses.some((candidate) => candidate.id === pass.passId)) {
    const used = paid.filter((download) => counts(download, new Date(pass.startedAt))).length;
    return { source: 'pass', limit: pass.downloads, used, remaining: Math.max(0, pass.downloads - used), resetsAt: null };
  }
  return { source: null, limit: 0, used: 0, remaining: 0, resetsAt: null };
};

// The id written in a link or a list: "…/item/oud-dreams", "#/item/oud-dreams?x=1" or just "oud-dreams".
export const itemIdFromLink = (line: string) => {
  const trimmed = line.trim();
  const match = trimmed.match(/item\/([\w-]+)/);
  return (match ? match[1] : trimmed.split(/[?\s,;]/)[0]).toLowerCase();
};

// Collections in display order: each one followed by the collections inside it, with how deep it sits (0 = top level).
// Pinned collections come first at every level.
export const collectionTree = (collections: UserCollection[], parentId: string | null = null, depth = 0): { collection: UserCollection; depth: number }[] =>
  collections
    .filter((collection) => collection.parentId === parentId)
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || a.name.localeCompare(b.name))
    .flatMap((collection) => [{ collection, depth }, ...collectionTree(collections, collection.id, depth + 1)]);

// A collection and every collection inside it, at any depth.
export const collectionWithDescendants = (collections: UserCollection[], id: string): string[] => [
  id,
  ...collections.filter((collection) => collection.parentId === id).flatMap((child) => collectionWithDescendants(collections, child.id)),
];
