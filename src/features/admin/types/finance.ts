// How creator earnings are worked out and when they can be paid.
export interface PayoutRules {
  creatorShare: number; // percent of subscription revenue shared with creators
  minimumPayout: number; // EGP: creators can request a payout from this balance
  payoutDay: number; // day of the month payouts are sent (1 to 28)
}

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

export type InvoiceKind = 'invoice' | 'receipt'; // e-invoice for companies (B2B), e-receipt for people (B2C)
export type InvoiceStatus = 'accepted' | 'rejected';

// An e-invoice or e-receipt sent to the Egyptian Tax Authority (ETA). Demo: not connected to the real system.
export interface Invoice {
  id: string;
  number: string;
  kind: InvoiceKind;
  transactionId: string;
  customerName: string;
  taxId?: string; // the company's tax registration number, for e-invoices
  amount: number; // EGP, before VAT
  vat: number; // EGP
  issuedAt: string;
  status: InvoiceStatus;
  etaUuid?: string; // given by the ETA when accepted
  rejectReason?: 'taxIdNotRegistered'; // the Tax Authority's reason; the page shows it in words
}

export interface InvoiceInput {
  transactionId: string;
  kind: InvoiceKind;
  taxId: string;
}
