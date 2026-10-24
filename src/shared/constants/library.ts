// Downloads, licenses, favorites, collections and follows.

// Where the licensed item will be used: asked with the project name and printed on the license.
export const licenseUses = ['socialMedia', 'youtube', 'clientWork', 'website', 'print', 'filmTv', 'other'] as const;
export type LicenseUse = (typeof licenseUses)[number];

// Why a download didn't work: once reported, it doesn't count against the plan's download limit.
export const brokenDownloadReasons = ['wontOpen', 'missingFiles', 'notAsDescribed', 'other'] as const;
export type BrokenDownloadReason = (typeof brokenDownloadReasons)[number];

// Why a license can be revoked (the reason is shown to the subscriber and on the license check page).
export const revokeReasons = ['rightsDispute', 'paymentReversed', 'termsBreach'] as const;
export type RevokeReason = (typeof revokeReasons)[number];

// Account notifications, newest first in the Notifications page. Their text is in text.alerts.
// supportReply, announcement and the creator application decisions are sent by the admin team.
export const alertKinds = [
  'renewalReminder',
  'paymentFailed',
  'itemRemoved',
  'licenseRevoked',
  'creatorPublished',
  'teamInvite',
  'teamRemoved',
  'supportReply',
  'announcement',
  'creatorApproved',
  'creatorRejected',
  'reportAnswered',
  // Creators
  'elementAccepted',
  'elementRejected',
  'elementUnpublished',
  'brokenFileReported',
  'copyrightClaim',
  'payoutPaid',
  'policyUpdate',
  'occasionReminder',
  // Customers who licensed an element whose files were replaced
  'elementUpdated',
] as const;
export type AlertKind = (typeof alertKinds)[number];

// A YouTube channel link: youtube.com/@handle, /channel/ID, /c/name or /user/name.
export const youtubeChannelPattern = /^(https?:\/\/)?(www\.|m\.)?youtube\.com\/(@[\w.-]{3,}|channel\/UC[\w-]{20,}|c\/[\w.-]+|user\/[\w.-]+)\/?$/i;

// Your own reference files in a collection: the kinds accepted and the largest file.
export const uploadKinds = ['image', 'video', 'audio'] as const;
export type UploadKind = (typeof uploadKinds)[number];
export const uploadMaxBytes = 25 * 1024 * 1024;

// Filters inside a collection.
export const collectionSources = ['library', 'upload'] as const;
export type CollectionSource = (typeof collectionSources)[number];
export const collectionDownloadStates = ['downloaded', 'notDownloaded'] as const;
export type CollectionDownloadState = (typeof collectionDownloadStates)[number];

// Collections can be nested this many levels deep (a collection inside a collection inside a collection).
export const collectionMaxDepth = 3;
export const collectionNameMaxLength = 60;

// Importing previous work: a list of item links or ids, one per line (or a .txt / .csv file of them).
export const importFileTypes = '.txt,.csv,text/plain,text/csv';
