import {
  occasionReminderWeeks,
  routes,
  studioLimits,
  studioOccasions,
  type StudioDetailKey,
  type TrackVersionKind,
} from '@/shared/constants';
import { mockItems } from '@/shared/mocks';
import type { Locale } from '@/shared/theme';
import type { CategoryId, Creator, Item, StudioClaim, StudioElement, StudioFile, StudioPayout, StudioReview, StudioSource } from '@/shared/types';
import { call, findById, randomDigits, readAccounts, saveAccount, signedInAccount, toSessionAccount, withAlert, writeAccounts, type StoredAccount } from './accountStore';
import { ApiError } from './apiError';
import { creatorApplicationDetails, creatorApplicationStatus, latestCreatorApplication } from './creatorApi';
import { fileStore } from './fileStore';
import { readApplications, saveApplications } from './resourcesApi';
import { earningsByMonth, earningsOf, studioActivity, studioBalance, studioItem, translateDraft, type StudioDay } from './studio';
import { readStudioClaims, readStudioElements, readStudioPayouts, saveStudioElement, writeStudioClaims, writeStudioElements, writeStudioPayouts } from './studioStore';

const now = () => new Date().toISOString();
const dayMs = 24 * 60 * 60 * 1000;

// ---------- Who is a creator ----------

// An account whose latest creator application the team approved.
export const isApprovedCreator = (accountId: string) => {
  const receipt = latestCreatorApplication(accountId);
  return receipt !== null && creatorApplicationStatus(receipt.id).status === 'approved';
};

const approvedCreator = () => {
  const account = signedInAccount();
  if (!isApprovedCreator(account.id)) throw new ApiError('notCreator');
  return account;
};

// A creator as customers see them, from what they wrote in their application.
const creatorProfile = (account: StoredAccount): Creator => {
  const receipt = latestCreatorApplication(account.id);
  const details = receipt ? creatorApplicationDetails(receipt.id) : null;
  const decidedAt = readApplications().find((application) => application.reference === receipt?.id)?.decision?.at;
  const about = details?.about ?? '';
  return {
    id: account.id,
    name: details?.name || account.name,
    city: { en: account.billingAddress?.city ?? '', ar: account.billingAddress?.city ?? '' },
    country: 'EG',
    bio: { en: about, ar: about },
    joinedAt: decidedAt ?? receipt?.submittedAt ?? account.termsAcceptedAt,
    accent: 'royalBlue',
  };
};

// ---------- Activity ----------

// Downloads of each element by accounts in this browser (paid downloads only, like a plan's limit).
const realDownloads = () => {
  const byItem = new Map<string, string[]>();
  for (const account of readAccounts()) {
    for (const download of account.downloads) byItem.set(download.itemId, [...(byItem.get(download.itemId) ?? []), download.requestedAt]);
  }
  return byItem;
};

const favoritesCount = (elementId: string) => readAccounts().filter((account) => account.favoriteIds.includes(elementId)).length;

const activityOf = (element: StudioElement, downloads = realDownloads()) => studioActivity(element, downloads.get(element.id) ?? []);

// The version customers see: the element itself when live, or the accepted version while an update is edited or
// reviewed. Nothing when it is disabled, taken down or was never accepted.
export const publishedVersion = (element: StudioElement): StudioElement | null => {
  if (!['live', 'pending', 'softRejected'].includes(element.status)) return null;
  return element.liveVersion ?? (element.status === 'live' ? element : null);
};

const publishedElements = () => readStudioElements().flatMap((element) => publishedVersion(element) ?? []);

// Live elements, as library items and creators, for the customer side.
export const studioLibraryItems = (): Item[] => {
  const downloads = realDownloads();
  return publishedElements().flatMap((element) => {
    const account = findById(element.creatorId);
    if (!account) return [];
    const total = activityOf(element, downloads).reduce((sum, day) => sum + day.downloads, 0);
    return [studioItem(element, creatorProfile(account), total)];
  });
};

export const studioCreators = (): Creator[] => {
  const ids = new Set(publishedElements().map((element) => element.creatorId));
  return [...ids].flatMap((id) => {
    const account = findById(id);
    return account ? [creatorProfile(account)] : [];
  });
};

// Every item customers can find: the library and creators' live elements.
export const libraryItems = (): Item[] => [...mockItems, ...studioLibraryItems()];

// ---------- What a submission needs ----------

export type StudioMissing = 'title' | 'description' | 'tags' | 'files' | 'previews' | 'sources' | 'contentId';

// What still has to be filled in before an element can be sent for review (empty: ready).
export const missingForReview = (element: StudioElement): StudioMissing[] => {
  const own = element.language;
  return [
    !element.title[own].trim() && 'title',
    !element.description[own].trim() && 'description',
    element.tags[own].length === 0 && 'tags',
    element.files.length === 0 && 'files',
    element.previews.length === 0 && 'previews',
    !element.noSources && element.sources.length === 0 && 'sources',
    element.categoryId === 'music' && element.contentIdRegistered === null && 'contentId',
  ].filter((missing): missing is StudioMissing => Boolean(missing));
};

// Which statuses the creator can edit (live elements go back to review when updated; disabled ones are turned on first).
export const isEditableElement = (element: StudioElement) => ['draft', 'softRejected', 'live'].includes(element.status);

// The first change to a live element keeps the accepted version live until the update is accepted.
const editing = (element: StudioElement): StudioElement =>
  element.status === 'live' && !element.liveVersion ? { ...element, liveVersion: element } : element;

const liveFileIds = (element: StudioElement) => new Set(element.liveVersion ? allFiles(element.liveVersion).map((file) => file.id) : []);

const mine = (id: string) => {
  const account = approvedCreator();
  const element = readStudioElements().find((candidate) => candidate.id === id && candidate.creatorId === account.id);
  if (!element) throw new ApiError('elementNotFound');
  return { account, element };
};

const storeFiles = async (files: File[], maxBytes: number): Promise<StudioFile[]> => {
  if (files.some((file) => file.size > maxBytes)) throw new ApiError('uploadTooLarge');
  return Promise.all(
    files.map(async (file) => {
      const id = crypto.randomUUID();
      await fileStore.put(id, file);
      return { id, name: file.name, size: file.size, type: file.type };
    }),
  );
};

const removeFiles = (files: StudioFile[]) =>
  // A file left behind in the browser's store only wastes space; the change itself still goes through.
  Promise.all(files.map((file) => fileStore.remove(file.id).catch((error: unknown) => console.error(error))));

const allFiles = (element: Pick<StudioElement, 'files' | 'previews' | 'versions'>) => [
  ...element.files,
  ...element.previews,
  ...element.versions.map((version) => version.file),
];

// The files of one version of an element that another version doesn't use (safe to delete).
const unusedFiles = (from: StudioElement, kept: StudioElement) => {
  const keptIds = new Set(allFiles(kept).map((file) => file.id));
  return allFiles(from).filter((file) => !keptIds.has(file.id));
};

// A good first guess at the category from the file: audio is music, video is stock video, images are photos, fonts are fonts.
const guessCategory = (file: File): CategoryId => {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (['ttf', 'otf', 'woff', 'woff2'].includes(extension)) return 'fonts';
  if (['aep', 'prproj', 'mogrt', 'drp'].includes(extension)) return 'videoTemplates';
  if (['ppt', 'pptx', 'key'].includes(extension)) return 'presentationTemplates';
  if (['psd', 'ai', 'eps', 'svg', 'fig'].includes(extension)) return 'graphics';
  if (file.type.startsWith('audio/')) return 'music';
  if (file.type.startsWith('video/')) return 'stockVideo';
  if (file.type.startsWith('image/')) return 'photos';
  return 'graphics';
};

const blankElement = (account: StoredAccount, categoryId: CategoryId, language: Locale, title: string): StudioElement => ({
  id: `studio-${crypto.randomUUID().slice(0, 8)}`,
  creatorId: account.id,
  creatorName: creatorProfile(account).name,
  status: 'draft',
  categoryId,
  language,
  title: { en: language === 'en' ? title : '', ar: language === 'ar' ? title : '' },
  description: { en: '', ar: '' },
  tags: { en: [], ar: [] },
  translationReviewed: false,
  details: {},
  software: [],
  bilingual: false,
  files: [],
  previews: [],
  sources: [],
  noSources: false,
  versions: [],
  contentIdRegistered: null,
  version: 1,
  fileVersion: 1,
  createdAt: now(),
  updatedAt: now(),
});

// What the editor can change on an element.
export interface StudioChanges {
  categoryId?: CategoryId;
  language?: Locale;
  title?: Partial<Record<Locale, string>>;
  description?: Partial<Record<Locale, string>>;
  tags?: Partial<Record<Locale, string[]>>;
  translationReviewed?: boolean;
  details?: Partial<Record<StudioDetailKey, string>>;
  software?: string[];
  bilingual?: boolean;
  sources?: StudioSource[];
  noSources?: boolean;
  contentIdRegistered?: boolean | null;
}

const applyChanges = (element: StudioElement, changes: StudioChanges): StudioElement => ({
  ...element,
  ...changes,
  title: { ...element.title, ...changes.title },
  description: { ...element.description, ...changes.description },
  tags: { ...element.tags, ...changes.tags },
  details: changes.categoryId && changes.categoryId !== element.categoryId ? {} : { ...element.details, ...changes.details },
  software: changes.categoryId && changes.categoryId !== element.categoryId ? [] : (changes.software ?? element.software),
  updatedAt: now(),
});

const session = () => toSessionAccount(signedInAccount());

export const studioApi = {
  myElements: () => call(() => readStudioElements().filter((element) => element.creatorId === approvedCreator().id)),

  element: (id: string) => call(() => mine(id).element),

  // One draft per file, with a category guessed from the file (several items at once).
  uploadDrafts: (files: File[], language: Locale) =>
    call(async () => {
      const account = approvedCreator();
      if (!files.length) throw new ApiError('nothingToConfirm');
      const drafts: StudioElement[] = [];
      for (const file of files) {
        const [stored] = await storeFiles([file], studioLimits.fileMaxBytes);
        const title = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
        drafts.push({ ...blankElement(account, guessCategory(file), language, title), files: [stored] });
      }
      writeStudioElements([...drafts, ...readStudioElements()]);
      return drafts.map((draft) => draft.id);
    }),

  // Saves changes as they are (a draft can be incomplete).
  save: (id: string, changes: StudioChanges) =>
    call(() => {
      const { element } = mine(id);
      if (!isEditableElement(element)) throw new ApiError('elementLocked');
      return saveStudioElement(applyChanges(editing(element), changes));
    }),

  // Files customers download, preview files, or (music) alternate versions and loops.
  addFiles: (id: string, slot: 'files' | 'previews', files: File[]) =>
    call(async () => {
      const { element } = mine(id);
      if (!isEditableElement(element)) throw new ApiError('elementLocked');
      const stored = await storeFiles(files, slot === 'files' ? studioLimits.fileMaxBytes : studioLimits.previewMaxBytes);
      return saveStudioElement({ ...editing(element), [slot]: [...element[slot], ...stored], updatedAt: now() });
    }),

  addVersion: (id: string, kind: TrackVersionKind, file: File) =>
    call(async () => {
      const { element } = mine(id);
      if (!isEditableElement(element)) throw new ApiError('elementLocked');
      const [stored] = await storeFiles([file], studioLimits.fileMaxBytes);
      return saveStudioElement({ ...editing(element), versions: [...element.versions, { kind, file: stored }], updatedAt: now() });
    }),

  removeFile: (id: string, fileId: string) =>
    call(async () => {
      const { element } = mine(id);
      if (!isEditableElement(element)) throw new ApiError('elementLocked');
      const updating = editing(element);
      // A file the live version still uses is kept until the update is accepted.
      const kept = liveFileIds(updating);
      const gone = allFiles(element).filter((file) => file.id === fileId && !kept.has(file.id));
      await removeFiles(gone);
      return saveStudioElement({
        ...updating,
        files: element.files.filter((file) => file.id !== fileId),
        previews: element.previews.filter((file) => file.id !== fileId),
        versions: element.versions.filter((version) => version.file.id !== fileId),
        updatedAt: now(),
      });
    }),

  // Fills the other language from the creator's own (a draft for them to review and correct).
  translate: (id: string) =>
    call(() => {
      const { element } = mine(id);
      if (!isEditableElement(element)) throw new ApiError('elementLocked');
      const from = element.language;
      const to: Locale = from === 'en' ? 'ar' : 'en';
      return saveStudioElement({
        ...editing(element),
        title: { ...element.title, [to]: translateDraft(element.title[from], from, to) },
        description: { ...element.description, [to]: translateDraft(element.description[from], from, to) },
        tags: { ...element.tags, [to]: element.tags[from].map((tag) => translateDraft(tag, from, to)) },
        translationReviewed: false,
        updatedAt: now(),
      });
    }),

  // Sends a draft, a fixed soft-rejected element, or an update to a live element to the review team.
  submit: (id: string) =>
    call(() => {
      const { element } = mine(id);
      if (!isEditableElement(element)) throw new ApiError('elementLocked');
      if (missingForReview(element).length) throw new ApiError('elementIncomplete');
      const resubmitted = element.status !== 'draft';
      return saveStudioElement({
        ...editing(element),
        status: 'pending',
        version: resubmitted ? element.version + 1 : element.version,
        submittedAt: now(),
        updatedAt: now(),
      });
    }),

  // A new version of a live element's files. Everyone who licensed it is told a new version is ready.
  replaceFiles: (id: string, files: File[]) =>
    call(async () => {
      const { element } = mine(id);
      if (element.status !== 'live') throw new ApiError('elementLocked');
      const stored = await storeFiles(files, studioLimits.fileMaxBytes);
      const replaced = new Map([...element.files, ...(element.liveVersion?.files ?? [])].map((file) => [file.id, file]));
      await removeFiles([...replaced.values()]);
      const fileVersion = element.fileVersion + 1;
      // An update in progress gets the new files too, so accepting it doesn't bring the old ones back.
      const liveVersion = element.liveVersion && { ...element.liveVersion, files: stored, fileVersion };
      const updated = saveStudioElement({ ...element, files: stored, fileVersion, liveVersion, updatedAt: now() });
      const title = updated.title[updated.language];
      writeAccounts(
        readAccounts().map((account) =>
          account.downloads.some((download) => download.itemId === id)
            ? withAlert(account, 'elementUpdated', { title, version: String(updated.fileVersion) }, routes.downloads)
            : account,
        ),
      );
      return updated;
    }),

  // Takes a live element off the site for now (or puts it back). Licenses already given stay valid.
  setDisabled: (id: string, disabled: boolean) =>
    call(() => {
      const { element } = mine(id);
      if (disabled ? element.status !== 'live' : element.status !== 'disabled') throw new ApiError('elementLocked');
      return saveStudioElement({ ...element, status: disabled ? 'disabled' : 'live', updatedAt: now() });
    }),

  // Deletes an element and its files. Licenses customers already have stay valid.
  remove: (id: string) =>
    call(async () => {
      const { element } = mine(id);
      await removeFiles([...allFiles(element), ...(element.liveVersion ? unusedFiles(element.liveVersion, element) : [])]);
      writeStudioElements(readStudioElements().filter((candidate) => candidate.id !== id));
      return id;
    }),

  // ---------- Earnings and payouts ----------

  earnings: () =>
    call(() => {
      const account = approvedCreator();
      const downloads = realDownloads();
      const elements = readStudioElements().filter((element) => element.creatorId === account.id && element.publishedAt);
      const perElement = elements.map((element) => {
        const days = activityOf(element, downloads);
        const total = days.reduce((sum, day) => sum + day.downloads, 0);
        return { element, downloads: total, earnings: earningsOf(total) };
      });
      const allDays: StudioDay[] = elements.flatMap((element) => activityOf(element, downloads));
      const payouts = readStudioPayouts()
        .filter((payout) => payout.creatorId === account.id)
        .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
      return { perElement, perMonth: earningsByMonth(allDays), balance: studioBalance(allDays, payouts), payouts };
    }),

  // Asks for the available balance to be paid out (from the minimum up).
  requestPayout: () =>
    call(async () => {
      const account = approvedCreator();
      const { balance } = await studioApi.earnings();
      if (!balance.canRequest) throw new ApiError('payoutBelowMinimum');
      const payout: StudioPayout = { id: crypto.randomUUID(), creatorId: account.id, amount: balance.available, method: '', requestedAt: now(), status: 'requested' };
      writeStudioPayouts([payout, ...readStudioPayouts()]);
      return payout;
    }),

  // ---------- Analytics ----------

  analytics: () =>
    call(() => {
      const account = approvedCreator();
      const downloads = realDownloads();
      return readStudioElements()
        .filter((element) => element.creatorId === account.id && element.publishedAt)
        .map((element) => {
          const days = activityOf(element, downloads);
          const views = days.reduce((sum, day) => sum + day.views, 0);
          const total = days.reduce((sum, day) => sum + day.downloads, 0);
          // Searches that led customers to the element: the words they used that it is tagged with, shared out by views.
          const terms = [...new Set([...element.tags.en, ...element.tags.ar])].map((term, index, all) => ({
            term,
            searches: Math.round((views * 0.6) / (index + 1) / Math.max(1, all.length / 3)),
          }));
          return { element, views, downloads: total, favorites: favoritesCount(element.id), earnings: earningsOf(total), terms };
        });
    }),

  // ---------- Copyright claims ----------

  claims: () =>
    call(() => {
      const account = approvedCreator();
      const elementIds = new Set(readStudioElements().filter((element) => element.creatorId === account.id).map((element) => element.id));
      return readStudioClaims().filter((claim) => elementIds.has(claim.elementId));
    }),

  respondToClaim: (claimId: string, message: string) =>
    call(() => {
      const account = approvedCreator();
      const claims = readStudioClaims();
      const claim = claims.find((candidate) => candidate.id === claimId);
      const element = claim && readStudioElements().find((candidate) => candidate.id === claim.elementId);
      if (!claim || element?.creatorId !== account.id) throw new ApiError('elementNotFound');
      if (message.trim().length < studioLimits.claimResponseMinLength) throw new ApiError('nothingToConfirm');
      writeStudioClaims(claims.map((candidate) => (candidate.id === claimId ? { ...candidate, response: { message: message.trim(), at: now() } } : candidate)));
      return claimId;
    }),
};

// ---------- Events from the rest of the site ----------

const alertCreator = (element: StudioElement, kind: Parameters<typeof withAlert>[1], params: Record<string, string>) => {
  const creator = findById(element.creatorId);
  if (creator) saveAccount(withAlert(creator, kind, { title: element.title[element.language], ...params }, routes.creatorElements));
};

// The admin team's decision on a submitted element.
export const applyStudioReview = (elementId: string, review: StudioReview) => {
  const element = readStudioElements().find((candidate) => candidate.id === elementId);
  if (!element) return;
  const { liveVersion } = element;
  if (review.decision === 'accepted') {
    // An accepted update replaces the live version; files only the old version used are deleted.
    if (liveVersion) void removeFiles(unusedFiles(liveVersion, element));
    saveStudioElement({ ...element, status: 'live', review, liveVersion: undefined, publishedAt: element.publishedAt ?? review.at });
  } else if (review.decision === 'hardRejected' && liveVersion) {
    // An update that can't be accepted is dropped: the live version stays as it was.
    void removeFiles(unusedFiles(element, liveVersion));
    saveStudioElement({ ...liveVersion, review, updatedAt: now() });
  } else {
    saveStudioElement({ ...element, status: review.decision, review });
  }
  alertCreator(element, review.decision === 'accepted' ? 'elementAccepted' : 'elementRejected', { comment: review.comment });
};

// The admin team took a live element down, with a reason the creator is told.
export const applyStudioUnpublish = (elementId: string, reason: string, note: string) => {
  const element = readStudioElements().find((candidate) => candidate.id === elementId);
  if (!element) return;
  saveStudioElement({ ...element, status: 'unpublished', unpublish: { reason, note, at: now() } });
  alertCreator(element, 'elementUnpublished', { reason, note });
};

// A customer reported copyright infringement on a creator's element: the creator gets a claim to answer.
export const recordStudioClaim = (itemId: string, claimant: string, details: string) => {
  const element = readStudioElements().find((candidate) => candidate.id === itemId);
  if (!element) return;
  const claim: StudioClaim = {
    id: crypto.randomUUID(),
    reference: `CR-${randomDigits(6)}`,
    elementId: element.id,
    elementTitle: element.title[element.language],
    claimant,
    details,
    createdAt: now(),
  };
  writeStudioClaims([claim, ...readStudioClaims()]);
  alertCreator(element, 'copyrightClaim', { reference: claim.reference });
};

// A customer said a download of the creator's element doesn't work: the creator is told and can upload a fix.
export const reportStudioBrokenFile = (itemId: string) => {
  const element = readStudioElements().find((candidate) => candidate.id === itemId);
  if (element) alertCreator(element, 'brokenFileReported', {});
};

// Reminders 6 to 8 weeks before each occasion to upload content for it (once per occasion and year).
export const withOccasionReminders = (account: StoredAccount, today: Date = new Date()): StoredAccount => {
  if (!isApprovedCreator(account.id)) return account;
  return studioOccasions.reduce((current, occasion) => {
    const weeksLeft = (new Date(occasion.date).getTime() - today.getTime()) / (7 * dayMs);
    const sent = current.alerts.some((alert) => alert.kind === 'occasionReminder' && alert.params.occasion === occasion.key && alert.params.date === occasion.date);
    if (sent || weeksLeft > occasionReminderWeeks.earliest || weeksLeft < occasionReminderWeeks.latest) return current;
    return withAlert(current, 'occasionReminder', { occasion: occasion.key, date: occasion.date }, routes.creatorUpload);
  }, account);
};

// ---------- Demo ----------

export const studioDemo = {
  // The team approves the signed-in user's latest creator application (the admin does this in Admin › Creators).
  approveMyApplication: () =>
    call(() => {
      const account = signedInAccount();
      const receipt = latestCreatorApplication(account.id);
      if (!receipt) throw new ApiError('nothingToConfirm');
      saveApplications(
        readApplications().map((application) =>
          application.reference === receipt.id ? { ...application, status: 'approved' as const, decision: { note: '', adminName: 'TILT', at: now() } } : application,
        ),
      );
      return toSessionAccount(saveAccount(withAlert(account, 'creatorApproved', {}, routes.creatorDashboard)));
    }),

  // Moves the creator's live elements back in time, so their earnings and analytics have a few months of history.
  backdate: (days: number) =>
    call(() => {
      const account = approvedCreator();
      writeStudioElements(
        readStudioElements().map((element) =>
          element.creatorId === account.id && element.publishedAt
            ? { ...element, publishedAt: new Date(new Date(element.publishedAt).getTime() - days * dayMs).toISOString() }
            : element,
        ),
      );
      return session();
    }),

  // The finance team pays the creator's requested payouts.
  payRequested: () =>
    call(() => {
      const account = approvedCreator();
      const payouts = readStudioPayouts();
      const due = payouts.filter((payout) => payout.creatorId === account.id && payout.status === 'requested');
      if (!due.length) throw new ApiError('nothingToConfirm');
      writeStudioPayouts(payouts.map((payout) => (due.includes(payout) ? { ...payout, status: 'paid' as const, paidAt: now() } : payout)));
      const amount = due.reduce((sum, payout) => sum + payout.amount, 0);
      return toSessionAccount(saveAccount(withAlert(signedInAccount(), 'payoutPaid', { amount: String(amount) }, routes.creatorEarnings)));
    }),

  // A change to the creator policy: every approved creator is told.
  policyUpdate: () =>
    call(() => {
      writeAccounts(readAccounts().map((account) => (isApprovedCreator(account.id) ? withAlert(account, 'policyUpdate', {}, routes.licenseTerms) : account)));
      return session();
    }),
};
