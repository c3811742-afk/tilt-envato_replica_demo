import { collectionMaxDepth, uploadKinds, uploadMaxBytes, youtubeChannelPattern, type BrokenDownloadReason, type LicenseUse, type UploadKind } from '@/shared/constants';
import { mockItems, mockLicenses } from '@/shared/mocks';
import type { Download, Item, LicenseRecord, PassPurchase, Subscription, Team, TeamSession, UserCollection } from '@/shared/types';
import {
  call,
  planAccess,
  readAccounts,
  readTeams,
  teamOf,
  readCatalogEvents,
  readLicenses,
  saveAccount,
  saveTeam,
  signedInAccount,
  toSessionAccount,
  updateSignedIn,
  writeLicenses,
  type StoredAccount,
} from './accountStore';
import { ApiError } from './apiError';
import { fileStore } from './fileStore';
import { originalTitle } from './itemText';
import { createLicenseCode } from './license';
import { creditAllowance } from './ai';
import { collectionWithDescendants, downloadAllowance, itemIdFromLink } from './library';

// Downloads and licenses, favorites, collections, follows and YouTube channels (the demo keeps them in this browser).

const freeItemIds = new Set(mockItems.filter((item) => item.tier === 'free').map((item) => item.id));

interface UsageSource {
  user: Pick<StoredAccount, 'downloads' | 'generations'>;
  subscription: Subscription | null;
  pass: PassPurchase | null;
  team?: TeamSession | null;
}

// What counts against the plan: the user's own use, or the whole team's on a team plan.
export const planUsage = ({ user, team }: UsageSource) =>
  team?.usesTeamPlan ? { downloads: team.downloads, generations: team.generations } : { downloads: user.downloads, generations: user.generations };

// How many downloads the signed-in user (or their team) has left, for showing it before a download.
export const accountAllowance = (source: UsageSource) => downloadAllowance(planUsage(source).downloads, source.subscription, source.pass, freeItemIds);

// The AI credits the signed-in user (or their team) has this month.
export const accountCredits = (source: UsageSource) => creditAllowance(planUsage(source).generations, source.subscription);

export interface LicenseRequest {
  item: Item;
  projectName: string;
  use: LicenseUse;
}

// Issues a license and records the download, if the user's plan or pass allows it (free items always do).
const issueLicense = (account: StoredAccount, { item, projectName, use }: LicenseRequest): { account: StoredAccount; license: LicenseRecord } => {
  if (account.suspension) throw new ApiError('accountSuspended');
  if (readCatalogEvents().removedItemIds[item.id]) throw new ApiError('itemRemoved');
  const access = planAccess(account);
  const team = access.viaTeam ? teamOf(account.id) : null;
  if (!freeItemIds.has(item.id)) {
    const used = access.pool.flatMap((member) => member.downloads);
    const allowance = downloadAllowance(used, access.subscription, account.pass, freeItemIds);
    if (!allowance.source) throw new ApiError('noDownloadAccess');
    if (allowance.remaining === 0) throw new ApiError('downloadLimitReached');
  }
  const license: LicenseRecord = {
    code: createLicenseCode(),
    itemId: item.id,
    itemTitle: originalTitle(item),
    creatorName: item.creator.name,
    // On a team plan the team holds the license. Certificates show the name in Arabic too when the user gave one.
    licenseeName: team ? team.name : account.profile?.arabicName ? `${account.name} / ${account.profile.arabicName}` : account.name,
    projectName: projectName.trim(),
    use,
    issuedAt: new Date().toISOString(),
    ownerId: account.id,
    teamId: team?.id,
  };
  writeLicenses([license, ...readLicenses()]);
  const download: Download = {
    id: crypto.randomUUID(),
    itemId: item.id,
    itemTitle: license.itemTitle,
    projectName: license.projectName,
    use,
    licenseCode: license.code,
    requestedAt: license.issuedAt,
  };
  return {
    license,
    account: { ...account, downloads: [download, ...account.downloads], licensing: { ...account.licensing, lastProjectName: license.projectName } },
  };
};

// All of a collection's descendants (its sub-collections, theirs, and so on).
const descendantIds = (collections: UserCollection[], id: string) => collectionWithDescendants(collections, id).slice(1);

// How deep a collection sits (1 = top level).
const depthOf = (collections: UserCollection[], id: string | null): number => {
  if (!id) return 0;
  const collection = collections.find((candidate) => candidate.id === id);
  return collection ? 1 + depthOf(collections, collection.parentId) : 0;
};

// How many levels a collection has under it (0 = none).
const heightOf = (collections: UserCollection[], id: string): number =>
  Math.max(0, ...collections.filter((collection) => collection.parentId === id).map((child) => 1 + heightOf(collections, child.id)));

// Where collections live: the user's own, or their team's shared ones (every member can view and add to those).
type CollectionScope = { kind: 'own'; collections: UserCollection[] } | { kind: 'team'; team: Team; collections: UserCollection[] };

const ownScope = (account: StoredAccount): CollectionScope => ({ kind: 'own', collections: account.collections });

const teamScope = (account: StoredAccount): CollectionScope => {
  const team = teamOf(account.id);
  if (!team) throw new ApiError('notInTeam');
  return { kind: 'team', team, collections: team.collections };
};

// The scope that holds a collection.
const scopeOf = (account: StoredAccount, collectionId: string): CollectionScope => {
  if (account.collections.some((collection) => collection.id === collectionId)) return ownScope(account);
  const team = teamOf(account.id);
  if (team?.collections.some((collection) => collection.id === collectionId)) return { kind: 'team', team, collections: team.collections };
  throw new ApiError('collectionNotFound');
};

// Saves a scope's new list of collections and returns the signed-in account for the session.
const saveScope = (scope: CollectionScope, collections: UserCollection[]) => {
  if (scope.kind === 'own') saveAccount({ ...signedInAccount(), collections });
  else saveTeam({ ...scope.team, collections });
  return toSessionAccount(signedInAccount());
};

const updateCollection = (id: string, change: (collection: UserCollection) => UserCollection) => {
  const scope = scopeOf(signedInAccount(), id);
  return saveScope(
    scope,
    scope.collections.map((collection) => (collection.id === id ? change(collection) : collection)),
  );
};

const newCollection = (name: string, parentId: string | null, itemIds: string[]): UserCollection => ({
  id: crypto.randomUUID(),
  name: name.trim(),
  parentId,
  pinned: false,
  shareId: null,
  itemIds,
  uploads: [],
  createdAt: new Date().toISOString(),
});

const uploadKindOf = (mime: string): UploadKind | undefined => uploadKinds.find((kind) => mime.startsWith(`${kind}/`));

export const libraryApi = {
  // Licenses an item for a project and records the download.
  license: (request: LicenseRequest) =>
    call(() => {
      const { account, license } = issueLicense(signedInAccount(), request);
      return { account: toSessionAccount(saveAccount(account)), license };
    }),

  // Licenses every library item in a collection for one project (stops at the plan's limit).
  licenseCollection: ({ collectionId, projectName, use }: { collectionId: string; projectName: string; use: LicenseUse }) =>
    call(() => {
      let account = signedInAccount();
      const collection = scopeOf(account, collectionId).collections.find((candidate) => candidate.id === collectionId);
      if (!collection) throw new ApiError('collectionNotFound');
      const items = collection.itemIds.map((id) => mockItems.find((item) => item.id === id)).filter((item): item is Item => item !== undefined);
      const licenses: LicenseRecord[] = [];
      for (const item of items) {
        const result = issueLicense(account, { item, projectName, use });
        account = result.account;
        licenses.push(result.license);
      }
      return { account: toSessionAccount(saveAccount(account)), licenses, items };
    }),

  // The user's licenses as the license server has them (revoked ones, items removed from the library).
  myLicenses: () =>
    call(() => {
      const account = signedInAccount();
      const removed = readCatalogEvents().removedItemIds;
      return readLicenses()
        .filter((license) => license.ownerId === account.id)
        .map((license) => ({ ...license, itemRemoved: license.itemRemoved ?? removed[license.itemId] }));
    }),

  // A real code from the demo data, offered on the license check page to try it.
  sampleLicenseCode: mockLicenses[0].code,

  // Anyone can check a license by its code. null when no license has this code.
  checkLicense: (code: string) =>
    call(() => {
      const normalized = code.trim().toUpperCase().replace(/[^0-9A-F]/g, '').replace(/(.{4})(?=.)/g, '$1-');
      const license = readLicenses().find((candidate) => candidate.code === normalized);
      if (!license) return null;
      return { ...license, itemRemoved: license.itemRemoved ?? readCatalogEvents().removedItemIds[license.itemId] };
    }),

  // A download that didn't work: once reported, it doesn't count against the plan's limit.
  reportBroken: (downloadId: string, reason: BrokenDownloadReason) =>
    call(() =>
      updateSignedIn((account) => ({
        downloads: account.downloads.map((download) =>
          download.id === downloadId ? { ...download, reportedBroken: { reason, at: new Date().toISOString() } } : download,
        ),
      })),
    ),

  addYoutubeChannel: (url: string) =>
    call(() => {
      const trimmed = url.trim();
      const match = trimmed.match(youtubeChannelPattern);
      if (!match) throw new ApiError('invalidChannel');
      return updateSignedIn((account) => {
        const name = match[3].replace(/^(channel|c|user)\//, '');
        if (account.youtubeChannels.some((channel) => channel.name.toLowerCase() === name.toLowerCase())) throw new ApiError('channelAdded');
        return { youtubeChannels: [...account.youtubeChannels, { id: crypto.randomUUID(), url: trimmed, name, addedAt: new Date().toISOString() }] };
      });
    }),

  removeYoutubeChannel: (id: string) =>
    call(() => updateSignedIn((account) => ({ youtubeChannels: account.youtubeChannels.filter((channel) => channel.id !== id) }))),

  toggleFavorite: (itemId: string) =>
    call(() =>
      updateSignedIn((account) => ({
        favoriteIds: account.favoriteIds.includes(itemId) ? account.favoriteIds.filter((id) => id !== itemId) : [itemId, ...account.favoriteIds],
      })),
    ),

  toggleFollow: (creatorId: string) =>
    call(() =>
      updateSignedIn((account) => ({
        following: account.following.includes(creatorId) ? account.following.filter((id) => id !== creatorId) : [...account.following, creatorId],
      })),
    ),

  // A new collection: inside another one when `parentId` is given, or among the team's shared ones with `team`.
  // Returns the account and the new collection's id.
  createCollection: ({ name, parentId = null, itemId, team = false }: { name: string; parentId?: string | null; itemId?: string; team?: boolean }) =>
    call(() => {
      const account = signedInAccount();
      const scope = parentId ? scopeOf(account, parentId) : team ? teamScope(account) : ownScope(account);
      if (depthOf(scope.collections, parentId) >= collectionMaxDepth) throw new ApiError('collectionTooDeep');
      const collection = newCollection(name, parentId, itemId ? [itemId] : []);
      return { account: saveScope(scope, [...scope.collections, collection]), id: collection.id };
    }),

  renameCollection: (id: string, name: string) => call(() => updateCollection(id, (collection) => ({ ...collection, name: name.trim() }))),

  // Moves a collection (and everything in it) into another one of the same owner, or to the top level with null.
  moveCollection: (id: string, parentId: string | null) =>
    call(() => {
      const scope = scopeOf(signedInAccount(), id);
      const { collections } = scope;
      if (parentId && !collections.some((collection) => collection.id === parentId)) throw new ApiError('collectionNotFound');
      if (parentId && (parentId === id || descendantIds(collections, id).includes(parentId))) throw new ApiError('collectionTooDeep');
      if (depthOf(collections, parentId) + 1 + heightOf(collections, id) > collectionMaxDepth) throw new ApiError('collectionTooDeep');
      return saveScope(
        scope,
        collections.map((collection) => (collection.id === id ? { ...collection, parentId } : collection)),
      );
    }),

  // Deletes collections with everything inside them, including uploaded files.
  deleteCollections: (ids: string[]) =>
    call(async () => {
      for (const id of ids) {
        const account = signedInAccount();
        // An id inside an already deleted collection went with it.
        if (![...account.collections, ...(teamOf(account.id)?.collections ?? [])].some((collection) => collection.id === id)) continue;
        const scope = scopeOf(account, id);
        const doomed = new Set(collectionWithDescendants(scope.collections, id));
        const uploads = scope.collections.filter((collection) => doomed.has(collection.id)).flatMap((collection) => collection.uploads);
        // A file that can't be removed from the browser's store only wastes space; the collection is still deleted.
        await Promise.all(uploads.map((upload) => fileStore.remove(upload.id).catch((error: unknown) => console.error(error))));
        saveScope(
          scope,
          scope.collections.filter((collection) => !doomed.has(collection.id)),
        );
      }
      return toSessionAccount(signedInAccount());
    }),

  setPinned: (id: string, pinned: boolean) => call(() => updateCollection(id, (collection) => ({ ...collection, pinned }))),

  // Turns the share link on (a new link each time) or off.
  setShared: (id: string, shared: boolean) =>
    call(() => updateCollection(id, (collection) => ({ ...collection, shareId: shared ? crypto.randomUUID().slice(0, 12) : null }))),

  // Adds an item to a collection, or removes it when it's already in.
  toggleInCollection: (collectionId: string, itemId: string) =>
    call(() =>
      updateCollection(collectionId, (collection) => ({
        ...collection,
        itemIds: collection.itemIds.includes(itemId) ? collection.itemIds.filter((id) => id !== itemId) : [itemId, ...collection.itemIds],
      })),
    ),

  removeFromCollection: (collectionId: string, { itemIds = [], uploadIds = [] }: { itemIds?: string[]; uploadIds?: string[] }) =>
    call(async () => {
      // As above: a file left behind in the browser's store doesn't stop the removal.
      await Promise.all(uploadIds.map((id) => fileStore.remove(id).catch((error: unknown) => console.error(error))));
      return updateCollection(collectionId, (collection) => ({
        ...collection,
        itemIds: collection.itemIds.filter((id) => !itemIds.includes(id)),
        uploads: collection.uploads.filter((upload) => !uploadIds.includes(upload.id)),
      }));
    }),

  // Adds one of the user's own files (image, video or audio) to a collection.
  uploadToCollection: (collectionId: string, file: File) =>
    call(async () => {
      const kind = uploadKindOf(file.type);
      if (!kind) throw new ApiError('unsupportedFile');
      if (file.size > uploadMaxBytes) throw new ApiError('uploadTooLarge');
      const id = crypto.randomUUID();
      await fileStore.put(id, file);
      return updateCollection(collectionId, (collection) => ({
        ...collection,
        uploads: [{ id, name: file.name, kind, mime: file.type, size: file.size, addedAt: new Date().toISOString() }, ...collection.uploads],
      }));
    }),

  // A collection someone shared: anyone with the link can see it. A team's collection is shown under the team's name.
  sharedCollection: (shareId: string) =>
    call(() => {
      const owners = [
        ...readAccounts().map((account) => ({ name: account.name, collections: account.collections })),
        ...readTeams().map((team) => ({ name: team.name, collections: team.collections })),
      ];
      for (const owner of owners) {
        const collection = owner.collections.find((candidate) => candidate.shareId === shareId);
        if (collection) {
          const children = owner.collections.filter((candidate) => candidate.parentId === collection.id);
          const items = collection.itemIds.map((id) => mockItems.find((item) => item.id === id)).filter((item): item is Item => item !== undefined);
          return { collection, children, items, ownerName: owner.name };
        }
      }
      return null;
    }),

  // Migrating previous work: item links or ids (one per line) go into a new collection. Unknown lines are counted.
  importItems: ({ lines, name }: { lines: string[]; name: string }) =>
    call(() => {
      const wanted = lines.map(itemIdFromLink).filter(Boolean);
      const found = [...new Set(wanted)].filter((id) => mockItems.some((item) => item.id === id));
      const account = signedInAccount();
      const collection = newCollection(name, null, found);
      return {
        account: toSessionAccount(saveAccount({ ...account, collections: [...account.collections, collection] })),
        id: collection.id,
        imported: found.length,
        skipped: wanted.length - found.length,
      };
    }),
};
