import { decisionAuditAction, decisionStatus } from '@/features/admin/constants';
import type { Admin, CatalogElement, ElementType, FlagInput, ReviewInput, UnpublishInput } from '@/features/admin/types';

import { mockItems } from '@/shared/mocks';
import type { CategoryId, Item, StudioElement } from '@/shared/types';
import {
  applyStudioReview,
  applyStudioUnpublish,
  editedTags,
  originalTitle,
  readCatalogEvents,
  readStudioElements,
  removeItemFromLibrary,
} from '@/shared/utils';
import { AdminApiError } from './errors';
import { authorize, db, logAction, now, respond } from './mockServer';

// ---------- Items in the customer library ----------
// The site's catalog shown as live elements, so taking one down really removes it from the site.

export const typeOfCategory: Record<CategoryId, ElementType> = {
  videoTemplates: 'videoTemplate',
  stockVideo: 'video',
  music: 'music',
  soundEffects: 'soundEffect',
  fonts: 'font',
  graphics: 'graphic',
  graphicTemplates: 'graphic',
  photos: 'photo',
  presentationTemplates: 'presentation',
  webTemplates: 'graphic',
};

const fromSite = (item: Item): CatalogElement => ({
  id: item.id,
  title: originalTitle(item),
  description: item.description[item.originalLanguage],
  tags: editedTags(item.tags),
  type: typeOfCategory[item.categoryId],
  category: item.categoryId,
  software: item.formats,
  bilingual: item.bilingual,
  creator: { id: item.creator.id, name: item.creator.name },
  files: [{ name: `${item.id}.zip`, sizeBytes: item.fileSize }],
  sources: [],
  previewUrl: item.image,
  submittedAt: item.createdAt,
  publishedAt: item.createdAt,
  version: 1,
  status: 'live',
  downloads: item.downloads,
  source: 'site',
});

// ---------- Elements creators submitted through the creator studio ----------
// They live in the creator side's store; the admin reviews and unpublishes them here, and the creator is told.

// A live element shows its accepted version until an update is sent for review.
const fromStudio = (current: StudioElement): CatalogElement => {
  const element = current.status === 'live' && current.liveVersion ? current.liveVersion : current;
  return {
    id: element.id,
    title: element.title[element.language],
    description: element.description[element.language],
    tags: editedTags(element.tags[element.language]),
    type: typeOfCategory[element.categoryId],
    category: element.categoryId,
    software: element.software,
    bilingual: element.bilingual,
    creator: { id: element.creatorId, name: element.creatorName },
    files: element.files.map((file) => ({ name: file.name, sizeBytes: file.size })),
    sources: element.sources,
    submittedAt: element.submittedAt ?? element.createdAt,
    publishedAt: element.publishedAt,
    version: element.version,
    status: element.status === 'disabled' ? 'unpublished' : (element.status as CatalogElement['status']),
    source: 'creator',
  };
};

// Elements customers can see: the site's library and creators' submissions (the rest is the admin's demo data).
const onSite = (element: CatalogElement) => element.source === 'site' || element.source === 'creator';

// A reviewer's flag on a site or creator element (those are built fresh on each read, so the flag is kept apart).
const withFlag = (element: CatalogElement): CatalogElement => (db.elementFlags[element.id] ? { ...element, flag: db.elementFlags[element.id] } : element);

// Drafts are the creator's own until they submit them.
const studioElements = () => readStudioElements().filter((element) => element.status !== 'draft').map(fromStudio).map(withFlag);

// Site items still in the library, creators' submissions, then every demo element.
export const allElements = () => {
  const removed = readCatalogEvents().removedItemIds;
  return [...mockItems.filter((item) => !removed[item.id]).map(fromSite).map(withFlag), ...studioElements(), ...db.elements];
};

export const pendingQueue = () =>
  [...studioElements(), ...db.elements]
    .filter((element) => element.status === 'pending')
    .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));

const findElement = (id: string) => {
  const element = allElements().find((current) => current.id === id);
  if (!element) throw new AdminApiError('notFound');
  return element;
};

const elementTarget = (element: CatalogElement) => ({ kind: 'element' as const, id: element.id, label: element.title });

// Oldest first: the element waiting longest is reviewed first.
export const fetchReviewQueue = () => respond(pendingQueue);

// null when the element doesn't exist: the page shows "Element not found".
export const fetchElement = (id: string) => respond(() => allElements().find((element) => element.id === id) ?? null);

const liveElements = () =>
  allElements()
    .filter((element) => element.status === 'live')
    .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));

export const fetchLiveElements = () => respond(liveElements);

// Live elements customers can actually see on the site (the site's library and creators' elements), for choosing
// what the homepage shows. The demo's own elements exist only in the admin.
export const fetchSiteElements = () => respond(() => liveElements().filter(onSite));

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
    // A creator's submission: the decision is saved on their element and they are told.
    if (element.source === 'creator') applyStudioReview(element.id, { decision: input.decision, reasons: input.reasons, comment: input.comment, at });
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
    if (onSite(element)) db.elementFlags[element.id] = element.flag;
    logAction(actor, 'elementFlagged', elementTarget(element), { flagKind: input.kind, note: input.note || undefined });
    return element;
  });

// Unpublishes inside another action the admin is already allowed to do (a copyright claim, an item report).
// Does nothing if the element is no longer live.
export const takeElementDown = (actor: Admin, elementId: string, input: UnpublishInput) => {
  const element = findElement(elementId);
  if (element.status !== 'live') return element;
  // A site item leaves the customer library; everyone who downloaded it is told.
  if (element.source === 'site') removeItemFromLibrary(element.id);
  // A creator's element leaves the library too, and the creator is told why.
  if (element.source === 'creator') applyStudioUnpublish(element.id, input.reason, input.note);
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
