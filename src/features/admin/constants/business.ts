import type { BadgeTone } from '@/features/admin/components/Badge';
import type {
  CancelReason,
  ClaimStatus,
  ContentRuleKey,
  DiscountType,
  GenerationType,
  InvoiceKind,
  InvoiceStatus,
  ItemReportKind,
  ItemReportStatus,
  LicenseScope,
  LicenseStatus,
  PayoutStatus,
  RefundReason,
  ReportKind,
  RevokeReason,
  SubscriptionStatus,
  TicketStatus,
  TransactionStatus,
} from '@/features/admin/types';

// The currency every amount in the admin area is in.
export const currency = 'EGP';

// Egyptian VAT, added to e-invoices and e-receipts.
export const vatRate = 0.14;

export const licenseScopes: readonly LicenseScope[] = ['personal', 'commercial', 'team', 'enterprise'];
export const discountTypes: readonly DiscountType[] = ['percent', 'fixed'];
export const refundReasons: readonly RefundReason[] = ['duplicate', 'notAsDescribed', 'accidental', 'goodwill'];
export const cancelReasons: readonly CancelReason[] = ['customerRequest', 'paymentIssue', 'fraud', 'other'];
export const revokeReasons: readonly RevokeReason[] = ['fraud', 'chargeback', 'stolenAccount', 'termsBreach'];
export const reportKinds: readonly ReportKind[] = ['subscriptions', 'revenue', 'downloads', 'earnings', 'payouts'];
// The reports finance exports from the payouts page.
export const payoutReportKinds: readonly ReportKind[] = ['earnings', 'payouts'];
export const transactionStatuses: readonly TransactionStatus[] = ['paid', 'partlyRefunded', 'refunded'];
export const payoutStatuses: readonly PayoutStatus[] = ['pending', 'approved', 'paid', 'failed', 'rejected'];
export const ticketStatuses: readonly TicketStatus[] = ['open', 'answered', 'closed'];
export const invoiceKinds: readonly InvoiceKind[] = ['receipt', 'invoice'];

export const generationTypes: readonly GenerationType[] = [
  'imageStandard',
  'imageHd',
  'backgroundRemoval',
  'copy',
  'voiceMinute',
  'upscale',
];
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

export const transactionStatusTone: Record<TransactionStatus, BadgeTone> = {
  paid: 'success',
  partlyRefunded: 'warning',
  refunded: 'neutral',
};
export const subscriptionStatusTone: Record<SubscriptionStatus, BadgeTone> = {
  active: 'success',
  canceling: 'warning',
  canceled: 'neutral',
};
export const payoutStatusTone: Record<PayoutStatus, BadgeTone> = {
  pending: 'info',
  approved: 'primary',
  paid: 'success',
  failed: 'danger',
  rejected: 'neutral',
};
export const invoiceStatusTone: Record<InvoiceStatus, BadgeTone> = { accepted: 'success', rejected: 'danger' };
export const licenseStatusTone: Record<LicenseStatus, BadgeTone> = { valid: 'success', revoked: 'danger' };
export const claimStatusTone: Record<ClaimStatus, BadgeTone> = {
  new: 'info',
  investigating: 'warning',
  takenDown: 'danger',
  rejected: 'neutral',
};
export const ticketStatusTone: Record<TicketStatus, BadgeTone> = {
  open: 'warning',
  answered: 'info',
  closed: 'neutral',
};
export const itemReportStatusTone: Record<ItemReportStatus, BadgeTone> = {
  open: 'warning',
  fixed: 'success',
  removed: 'danger',
  dismissed: 'neutral',
};
export const itemReportKindTone: Record<ItemReportKind, BadgeTone> = {
  brokenFiles: 'warning',
  infringement: 'danger',
  wrongCategory: 'info',
  offensive: 'danger',
};
