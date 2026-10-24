import { decisionAuditAction, decisionStatus } from '@/features/admin/constants';
import type { Admin, CatalogElement, FlagInput, ReviewInput, UnpublishInput } from '@/features/admin/types';
import { AdminApiError } from './errors';
import { authorize, db, logAction, now, respond } from './mockServer';

const pendingQueue = () =>
  db.elements
    .filter((element) => element.status === 'pending')
    .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));

const findElement = (id: string) => {
  const element = db.elements.find((current) => current.id === id);
  if (!element) throw new AdminApiError('notFound');
  return element;
};

const elementTarget = (element: CatalogElement) => ({ kind: 'element' as const, id: element.id, label: element.title });

// Oldest first: the element waiting longest is reviewed first.
export const fetchReviewQueue = () => respond(pendingQueue);

// null when the element doesn't exist: the page shows "Element not found".
export const fetchElement = (id: string) => respond(() => db.elements.find((element) => element.id === id) ?? null);

export const fetchLiveElements = () =>
  respond(() =>
    db.elements
      .filter((element) => element.status === 'live')
      .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '')),
  );

// Accept, soft reject or hard reject. Returns the next element in the queue so the reviewer can keep going.
export const reviewElement = (actorId: string, elementId: string, input: ReviewInput) =>
  respond(() => {
    const actor = authorize(actorId, 'review');
    const element = findElement(elementId);
    if (element.status !== 'pending') throw new AdminApiError('alreadyReviewed');

    const at = now();
    element.status = decisionStatus[input.decision];
    element.review = { ...input, adminId: actor.id, at };
    if (input.decision === 'accepted') element.publishedAt = at;
    logAction(actor, decisionAuditAction[input.decision], elementTarget(element), {
      reasons: input.reasons,
      note: input.comment || undefined,
    });
    return { element, nextId: pendingQueue()[0]?.id ?? null };
  });

// Marks a pending element as a duplicate or plagiarised. The reviewer still accepts or rejects it.
export const flagElement = (actorId: string, elementId: string, input: FlagInput) =>
  respond(() => {
    const actor = authorize(actorId, 'review');
    const element = findElement(elementId);
    if (element.status !== 'pending') throw new AdminApiError('alreadyReviewed');

    element.flag = { ...input, adminId: actor.id, at: now() };
    logAction(actor, 'elementFlagged', elementTarget(element), { flagKind: input.kind, note: input.note || undefined });
    return element;
  });

// Unpublishes inside another action the admin is already allowed to do (a copyright claim, an item report).
// Does nothing if the element is no longer live.
export const takeElementDown = (actor: Admin, elementId: string, input: UnpublishInput) => {
  const element = findElement(elementId);
  if (element.status !== 'live') return element;
  element.status = 'unpublished';
  element.unpublish = { ...input, adminId: actor.id, at: now() };
  logAction(actor, 'elementUnpublished', elementTarget(element), {
    unpublishReason: input.reason,
    note: input.note || undefined,
  });
  return element;
};

// Takes a live element off the site. The reason is kept so the creator can be told why.
export const unpublishElement = (actorId: string, elementId: string, input: UnpublishInput) =>
  respond(() => {
    const actor = authorize(actorId, 'unpublish');
    if (findElement(elementId).status !== 'live') throw new AdminApiError('notLive');
    return takeElementDown(actor, elementId, input);
  });
