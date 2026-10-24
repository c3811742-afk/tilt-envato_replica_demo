
import type {
  CancelReason,
  ClaimStatus,
  ContentRuleKey,
  InvoiceKind,
  InvoiceStatus,
  ItemReportKind,
  ItemReportStatus,
  LicenseStatus,
  PayoutStatus,
  RefundReason,
  ReportKind,
  SubscriptionStatus,
  TicketStatus,
  TransactionStatus,
} from '@/features/admin/types';
import { type BadgeVariant } from '@/shared/components';

export const refundReasons: readonly RefundReason[] = ['duplicate', 'notAsDescribed', 'accidental', 'goodwill'];
export const cancelReasons: readonly CancelReason[] = ['customerRequest', 'paymentIssue', 'fraud', 'other'];
export { revokeReasons } from '@/shared/constants';
export const reportKinds: readonly ReportKind[] = ['subscriptions', 'revenue', 'downloads', 'earnings', 'payouts'];
// The reports finance exports from the payouts page.
export const payoutReportKinds: readonly ReportKind[] = ['earnings', 'payouts'];
export const transactionStatuses: readonly TransactionStatus[] = ['paid', 'partlyRefunded', 'refunded'];
export const payoutStatuses: readonly PayoutStatus[] = ['pending', 'approved', 'paid', 'failed', 'rejected'];
export const ticketStatuses: readonly TicketStatus[] = ['open', 'answered', 'closed'];
export const invoiceKinds: readonly InvoiceKind[] = ['receipt', 'invoice'];

export const contentRuleKeys: readonly ContentRuleKey[] = [
  'explicit',
  'religiousFigures',
  'realPeople',
  'hate',
  'violence',
  'brands',
];

export const planTabs = ['plans', 'promoCodes'] as const;
export const billingTabs = ['transactions', 'failedPayments', 'subscriptions'] as const;
export const payoutTabs = ['requests', 'rules', 'reports'] as const;
export const licenseTabs = ['lookup', 'claims'] as const;
export const supportTabs = ['tickets', 'itemReports'] as const;
export const aiTabs = ['tools', 'costs', 'rules'] as const;

export const transactionStatusTone: Record<TransactionStatus, BadgeVariant> = {
  paid: 'success',
  partlyRefunded: 'warning',
  refunded: 'neutral',
};
export const subscriptionStatusTone: Record<SubscriptionStatus, BadgeVariant> = {
  active: 'success',
  canceling: 'warning',
  canceled: 'neutral',
};
export const payoutStatusTone: Record<PayoutStatus, BadgeVariant> = {
  pending: 'info',
  approved: 'info',
  paid: 'success',
  failed: 'danger',
  rejected: 'neutral',
};
export const invoiceStatusTone: Record<InvoiceStatus, BadgeVariant> = { accepted: 'success', rejected: 'danger' };
export const licenseStatusTone: Record<LicenseStatus, BadgeVariant> = { valid: 'success', revoked: 'danger' };
export const claimStatusTone: Record<ClaimStatus, BadgeVariant> = {
  new: 'info',
  investigating: 'warning',
  takenDown: 'danger',
  rejected: 'neutral',
};
export const ticketStatusTone: Record<TicketStatus, BadgeVariant> = {
  open: 'warning',
  answered: 'info',
  closed: 'neutral',
};
export const itemReportStatusTone: Record<ItemReportStatus, BadgeVariant> = {
  open: 'warning',
  fixed: 'success',
  removed: 'danger',
  dismissed: 'neutral',
};
export const itemReportKindTone: Record<ItemReportKind, BadgeVariant> = {
  brokenFiles: 'warning',
  infringement: 'danger',
  wrongCategory: 'info',
  offensive: 'danger',
};
