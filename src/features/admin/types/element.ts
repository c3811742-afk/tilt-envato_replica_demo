import type { CategoryId } from '@/shared/types';
import type { DeprecateReason } from './catalog';

export type ElementType =
  | 'photo'
  | 'video'
  | 'videoTemplate'
  | 'music'
  | 'soundEffect'
  | 'graphic'
  | 'font'
  | 'presentation';

// Elements are filed under the site's categories (video templates, music, fonts...).
export type ElementCategory = CategoryId;

export type ElementStatus = 'pending' | 'live' | 'softRejected' | 'hardRejected' | 'unpublished' | 'deprecated';

export type SoftRejectReason = 'lowQualityPreview' | 'missingFiles' | 'wrongCategory' | 'weakTitle' | 'missingDeclarations';
export type HardRejectReason = 'belowQuality' | 'copyright' | 'duplicate' | 'contentGuidelines';
export type RejectReason = SoftRejectReason | HardRejectReason;

export type ReviewDecision = 'accepted' | 'softRejected' | 'hardRejected';
export type RejectDecision = Exclude<ReviewDecision, 'accepted'>;
export type FlagKind = 'duplicate' | 'plagiarised';
export type UnpublishReason = 'copyright' | 'contentGuidelines' | 'brokenFiles' | 'creatorRequest' | 'outdated';
export type GuidelineCheck = 'religiousValues' | 'noExplicit' | 'arabicText' | 'mapsAndFlags' | 'noHate';
export type SourceKind = 'font' | 'music' | 'photo';

export interface ElementFile {
  name: string;
  sizeBytes: number;
}

// A font, track or photo the creator took from somewhere else, with its license.
export interface SourceDeclaration {
  kind: SourceKind;
  name: string;
  license: string;
}

export interface ElementReview {
  decision: ReviewDecision;
  reasons: RejectReason[];
  comment: string;
  adminId: string;
  at: string;
}

export interface ElementFlag {
  kind: FlagKind;
  originalLink: string;
  note: string;
  adminId: string;
  at: string;
}

export interface ElementUnpublish {
  reason: UnpublishReason;
  note: string;
  adminId: string;
  at: string;
}

export interface ElementDeprecation {
  reason: DeprecateReason;
  note: string;
  adminId: string;
  at: string;
}

// An element submitted by a creator, at any stage: waiting for review, live, rejected or unpublished.
export interface CatalogElement {
  id: string;
  title: string;
  description: string;
  tags: string[];
  type: ElementType;
  category: ElementCategory;
  software: string[];
  bilingual: boolean;
  creator: { id: string; name: string };
  files: ElementFile[];
  sources: SourceDeclaration[];
  previewUrl?: string; // no preview yet: the page shows a placeholder
  previewKind?: 'image' | 'video' | 'audio'; // a creator's preview file; without it the element's type decides
  submittedAt: string;
  version: number; // 1 for a first submission, higher when resubmitted after a soft reject
  status: ElementStatus;
  similarTo?: { id: string; title: string }; // a live element that looks alike
  flag?: ElementFlag;
  review?: ElementReview;
  publishedAt?: string;
  unpublish?: ElementUnpublish;
  deprecation?: ElementDeprecation; // old element taken out of search; existing licenses stay valid
  downloads?: number; // all time, live elements only
  lastDownloadedAt?: string;
  source?: 'demo' | 'site' | 'creator'; // site: an item in the customer library (taking it down removes it from the site); creator: submitted through the creator studio
}

export interface ReviewInput {
  decision: ReviewDecision;
  reasons: RejectReason[];
  comment: string;
}

export interface FlagInput {
  kind: FlagKind;
  originalLink: string;
  note: string;
}

export interface UnpublishInput {
  reason: UnpublishReason;
  note: string;
}
