import type { AdminRole } from './admin';
import type { FlagKind, RejectReason, UnpublishReason } from './element';
import type { DeprecateReason, LocalizedText } from './catalog';
import type { CancelReason, RefundReason } from './billing';
import type { ReportKind } from './finance';
import type { RevokeReason } from './licensing';
import type { ApplicationRejectReason, IdRejectReason } from './users';
import type { SuspensionReason } from '@/shared/constants';

export type AuditAction =
  | 'elementAccepted'
  | 'elementSoftRejected'
  | 'elementHardRejected'
  | 'elementFlagged'
  | 'elementUnpublished'
  | 'elementDeprecated'
  | 'adminCreated'
  | 'adminRoleChanged'
  | 'categoryCreated'
  | 'categoryUpdated'
  | 'tagRenamed'
  | 'tagsMerged'
  | 'tagBanned'
  | 'tagUnbanned'
  | 'homepageUpdated'
  | 'searchReportClosed'
  | 'contentSaved'
  | 'contentDeleted'
  | 'languageAdded'
  | 'translationUpdated'
  | 'messageSent'
  | 'messageScheduled'
  | 'messageCanceled'
  | 'programSaved'
  | 'planSaved'
  | 'promoCodeSaved'
  | 'promoCodeDisabled'
  | 'refundIssued'
  | 'subscriptionCanceled'
  | 'payoutRulesSaved'
  | 'payoutUpdated'
  | 'reportExported'
  | 'invoiceIssued'
  | 'licenseRevoked'
  | 'claimUpdated'
  | 'ticketReplied'
  | 'ticketUpdated'
  | 'itemReportResolved'
  | 'aiSettingsSaved'
  | 'userSuspended'
  | 'userBanned'
  | 'userReactivated'
  | 'appealDecided'
  | 'applicationDecided'
  | 'identityDecided'
  | 'downloadAlertDismissed';

export type AuditTargetKind =
  | 'element'
  | 'admin'
  | 'category'
  | 'tag'
  | 'homepage'
  | 'searchReport'
  | 'content'
  | 'language'
  | 'message'
  | 'program'
  | 'plan'
  | 'promoCode'
  | 'transaction'
  | 'subscription'
  | 'payout'
  | 'payoutRules'
  | 'report'
  | 'invoice'
  | 'license'
  | 'claim'
  | 'ticket'
  | 'itemReport'
  | 'ai'
  | 'user'
  | 'application'
  | 'identityCheck';

export interface AuditTarget {
  kind: AuditTargetKind;
  id: string;
  label: string; // the name or title at the time of the action
  labels?: LocalizedText; // for things named in both languages (categories, FAQs...): shown in the page's language
}

// What changed, for actions that cover several kinds of change (e.g. a category moved, hidden or renamed).
export type AuditChange =
  | 'details'
  | 'moved'
  | 'hidden'
  | 'shown'
  | 'attributes'
  | 'added'
  | 'removed'
  | 'resolved'
  | 'dismissed'
  | 'published'
  | 'draft'
  | 'approved'
  | 'rejected'
  | 'paid'
  | 'failed'
  | 'investigating'
  | 'takenDown'
  | 'fixed'
  | 'closed'
  | 'reopened';

// Which part of a page was changed (the homepage tabs, the site content tabs, the message types).
export type AuditArea =
  | 'featured'
  | 'occasions'
  | 'freeElements'
  | 'banners'
  | 'faqs'
  | 'legal'
  | 'help'
  | 'learn'
  | 'releaseNotes'
  | 'announcements'
  | 'newsletters'
  | 'aiTools'
  | 'aiCosts'
  | 'aiRules';

export interface AuditDetails {
  reasons?: RejectReason[];
  unpublishReason?: UnpublishReason;
  deprecateReason?: DeprecateReason;
  flagKind?: FlagKind;
  role?: AdminRole;
  previousRole?: AdminRole;
  change?: AuditChange;
  area?: AuditArea;
  from?: string; // old name (renames and merges)
  to?: string; // new name
  recipients?: number;
  term?: string; // the search a report was about
  textKey?: string; // the translated text, e.g. 'admin.nav.tags'
  amount?: number; // EGP: refunds, payouts, invoices
  refundReason?: RefundReason;
  cancelReason?: CancelReason;
  revokeReason?: RevokeReason;
  reportKind?: ReportKind;
  suspensionReason?: SuspensionReason;
  applicationReason?: ApplicationRejectReason;
  idReason?: IdRejectReason;
  note?: string;
}

export interface AuditEntry {
  id: string;
  at: string;
  actorId: string;
  actorName: string; // kept so the entry still reads correctly if the admin changes later
  action: AuditAction;
  target: AuditTarget;
  details: AuditDetails;
}
