import type { PayoutMethod } from './creator';
import type { StudioDetailKey, StudioSourceKind, StudioStatus, TrackVersionKind } from '@/shared/constants';
import type { Locale } from '@/shared/theme';
import type { CategoryId, LocalizedText } from './catalog';

// A file the creator uploaded, kept in this browser's file store.
export interface StudioFile {
  id: string;
  name: string;
  size: number; // bytes
  type: string; // MIME type
}

// A font, track or photo inside the element that came from somewhere else.
export interface StudioSource {
  kind: StudioSourceKind;
  name: string;
  license: string; // e.g. "SIL Open Font License", "Bought on …", "My own photo"
}

// The team's review of a submission: the reviewer's reasons (texts in text.admin) and comment.
export interface StudioReview {
  decision: 'accepted' | 'softRejected' | 'hardRejected';
  reasons: string[];
  comment: string;
  at: string; // ISO date
}

// A creator's appeal against a copyright takedown, and the team's answer (with a note when it stays down).
export interface StudioAppeal {
  message: string;
  at: string;
  status: 'open' | 'accepted' | 'rejected';
  note?: string;
  decidedAt?: string;
}

// A creator's element, from first draft to live (and after).
export interface StudioElement {
  id: string;
  creatorId: string; // the creator's account
  creatorName: string;
  status: StudioStatus;
  categoryId: CategoryId;
  language: Locale; // the language the creator wrote in; the other one is translated
  title: LocalizedText;
  description: LocalizedText;
  tags: Record<Locale, string[]>;
  translationReviewed: boolean; // the creator checked the automatic translation
  details: Partial<Record<StudioDetailKey, string>>;
  software: string[];
  bilingual: boolean; // the design has Arabic and English text
  files: StudioFile[]; // what customers download
  previews: StudioFile[]; // images, video or audio shown on the item page
  sources: StudioSource[];
  noSources: boolean; // the creator declared everything is their own
  versions: { kind: TrackVersionKind; file: StudioFile }[]; // music: alternate mixes, edits and loops
  contentIdRegistered: boolean | null; // music: registered with YouTube Content ID (null: not answered yet)
  version: number; // goes up each time the element is sent for review again
  fileVersion: number; // goes up each time the files of a live element are replaced
  review?: StudioReview;
  unpublish?: { reason: string; note: string; at: string };
  appeal?: StudioAppeal; // the creator's appeal against a copyright takedown
  // While a live element is being updated (edited, in review or sent back), the accepted version customers still see.
  liveVersion?: Omit<StudioElement, 'liveVersion'>;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  publishedAt?: string;
}

// Money paid out to a creator.
// A creator's payout request, and what the admin team did with it: approved, then paid or failed; or rejected.
export type StudioPayoutStatus = 'requested' | 'approved' | 'paid' | 'failed' | 'rejected';

export interface StudioPayout {
  id: string;
  creatorId: string;
  amount: number; // EGP
  method: PayoutMethod | ''; // from the creator application ('' when it had none)
  accountEnding?: string; // the last digits of the account or wallet the money goes to
  requestedAt: string;
  status: StudioPayoutStatus;
  note?: string; // why it was rejected or failed (the creator sees it)
  updatedAt?: string;
  paidAt?: string;
}

// How creators are paid, as the admin team sets it (Admin › Payouts › Rules).
export interface PayoutRules {
  creatorShare: number; // percent of subscription revenue shared with creators
  minimumPayout: number; // EGP: creators can request a payout from this balance
  payoutDay: number; // day of the month payouts are sent (1 to 28)
}

// A copyright claim against one of the creator's elements (from a customer's report), and the creator's answer.
export interface StudioClaim {
  id: string;
  reference: string;
  elementId: string;
  elementTitle: string;
  claimant: string;
  details: string;
  createdAt: string;
  response?: { message: string; at: string };
}

// How one element is doing.
export interface StudioElementStats {
  elementId: string;
  views: number;
  downloads: number;
  favorites: number;
  earnings: number; // EGP
}
