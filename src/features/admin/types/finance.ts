import type { TaxDocument } from '@/shared/types';
// How creator earnings are worked out and when they can be paid (shared with the creator studio).
export type { PayoutRules } from '@/shared/types';

export type PayoutMethod = 'bank' | 'instapay' | 'vodafoneCash';
export type PayoutStatus = 'pending' | 'approved' | 'paid' | 'failed' | 'rejected';

export interface Payout {
  id: string;
  creator: { id: string; name: string };
  amount: number; // EGP
  method: PayoutMethod;
  account: string; // shown masked, e.g. •••• 4821
  requestedAt: string;
  status: PayoutStatus;
  note?: string; // why it was rejected or failed
  updatedAt: string;
  source?: 'site'; // requested by a creator in the creator studio (the rest is demo data)
}

export type PayoutDecision = 'approved' | 'rejected' | 'paid' | 'failed';

export type ReportKind = 'subscriptions' | 'revenue' | 'downloads' | 'earnings' | 'payouts';

// One exported report: column keys in order, and one row of values per line.
export interface Report {
  kind: ReportKind;
  month: string; // YYYY-MM
  columns: string[];
  rows: (string | number)[][];
}

export type InvoiceKind = TaxDocument['kind']; // e-invoice for companies (B2B), e-receipt for people (B2C)
export type InvoiceStatus = TaxDocument['status'];

// An e-invoice or e-receipt sent to the Egyptian Tax Authority (ETA). Demo: not connected to the real system.
export type Invoice = TaxDocument;

export interface InvoiceInput {
  transactionId: string;
  kind: InvoiceKind;
  taxId: string;
}
