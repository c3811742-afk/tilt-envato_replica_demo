export type ElementType =
  | 'photo'
  | 'video'
  | 'videoTemplate'
  | 'music'
  | 'soundEffect'
  | 'graphic'
  | 'font'
  | 'presentation';

export type ElementCategory =
  | 'weddings'
  | 'ramadan'
  | 'restaurants'
  | 'realEstate'
  | 'education'
  | 'business'
  | 'landmarks'
  | 'calligraphy';

export type ElementStatus = 'pending' | 'live' | 'softRejected' | 'hardRejected' | 'unpublished';

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
  submittedAt: string;
  version: number; // 1 for a first submission, higher when resubmitted after a soft reject
  status: ElementStatus;
  similarTo?: { id: string; title: string }; // a live element that looks alike
  flag?: ElementFlag;
  review?: ElementReview;
  publishedAt?: string;
  unpublish?: ElementUnpublish;
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
