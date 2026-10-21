import type { BadgeTone } from '@/features/admin/components/Badge';
import type {
  AuditAction,
  ElementStatus,
  ElementType,
  FlagKind,
  GuidelineCheck,
  HardRejectReason,
  ReviewDecision,
  SoftRejectReason,
  UnpublishReason,
} from '@/features/admin/types';

export const elementTypes: readonly ElementType[] = [
  'photo',
  'video',
  'videoTemplate',
  'music',
  'soundEffect',
  'graphic',
  'font',
  'presentation',
];

export const softRejectReasons: readonly SoftRejectReason[] = [
  'lowQualityPreview',
  'missingFiles',
  'wrongCategory',
  'weakTitle',
  'missingDeclarations',
];

export const hardRejectReasons: readonly HardRejectReason[] = ['belowQuality', 'copyright', 'duplicate', 'contentGuidelines'];

export const unpublishReasons: readonly UnpublishReason[] = [
  'copyright',
  'contentGuidelines',
  'brokenFiles',
  'creatorRequest',
  'outdated',
];

export const flagKinds: readonly FlagKind[] = ['duplicate', 'plagiarised'];

// Content guidelines for Egyptian and Arab audiences: every item must be ticked before accepting.
export const guidelineChecks: readonly GuidelineCheck[] = [
  'religiousValues',
  'noExplicit',
  'arabicText',
  'mapsAndFlags',
  'noHate',
];

export const auditActions: readonly AuditAction[] = [
  'elementAccepted',
  'elementSoftRejected',
  'elementHardRejected',
  'elementFlagged',
  'elementUnpublished',
  'adminCreated',
  'adminRoleChanged',
];

export const decisionStatus: Record<ReviewDecision, ElementStatus> = {
  accepted: 'live',
  softRejected: 'softRejected',
  hardRejected: 'hardRejected',
};

export const decisionAuditAction: Record<ReviewDecision, AuditAction> = {
  accepted: 'elementAccepted',
  softRejected: 'elementSoftRejected',
  hardRejected: 'elementHardRejected',
};

export const statusTone: Record<ElementStatus, BadgeTone> = {
  pending: 'info',
  live: 'success',
  softRejected: 'warning',
  hardRejected: 'danger',
  unpublished: 'neutral',
};

export const auditActionTone: Record<AuditAction, BadgeTone> = {
  elementAccepted: 'success',
  elementSoftRejected: 'warning',
  elementHardRejected: 'danger',
  elementFlagged: 'danger',
  elementUnpublished: 'neutral',
  adminCreated: 'primary',
  adminRoleChanged: 'primary',
};
