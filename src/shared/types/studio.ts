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
  // While a live element is being updated (edited, in review or sent back), the accepted version customers still see.
  liveVersion?: Omit<StudioElement, 'liveVersion'>;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  publishedAt?: string;
}

// Money paid out to a creator.
export interface StudioPayout {
  id: string;
  creatorId: string;
  amount: number; // EGP
  method: string; // the payout method from the creator application
  requestedAt: string;
  status: 'requested' | 'paid';
  paidAt?: string;
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
