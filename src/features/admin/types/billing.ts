import type { LocalizedText } from './catalog';

export type LicenseScope = 'personal' | 'commercial' | 'team' | 'enterprise';

// A subscription plan. downloadLimit null means unlimited downloads.
export interface Plan {
  id: string;
  name: LocalizedText;
  monthlyPrice: number; // EGP
  yearlyPrice: number; // EGP
  downloadLimit: number | null; // per month
  seats: number;
  licenseScope: LicenseScope;
  aiCredits: number; // per month
  parallelGenerations: number; // AI generations that can run at the same time
  active: boolean; // inactive plans can't be bought; current subscribers keep them
  subscribers: number;
}

export type PlanInput = Omit<Plan, 'id' | 'subscribers'>;

export type DiscountType = 'percent' | 'fixed';

export interface PromoCode {
  id: string;
  code: string;
  discountType: DiscountType;
  value: number; // percent, or EGP for a fixed discount
  planIds: string[]; // empty: every plan
  expiresAt: string; // YYYY-MM-DD, last day it works
  maxUses: number | null; // null: no limit
  uses: number;
  active: boolean;
}

export type PromoCodeInput = Omit<PromoCode, 'id' | 'uses' | 'active'>;

export interface Customer {
  id: string;
  name: string;
  email: string;
}

export type PaymentMethod = 'card' | 'fawry' | 'wallet' | 'instapay';
export type TransactionStatus = 'paid' | 'partlyRefunded' | 'refunded';

export interface Transaction {
  id: string;
  at: string;
  customer: Customer;
  planName: string;
  amount: number; // EGP
  refunded: number; // EGP refunded so far
  method: PaymentMethod;
  status: TransactionStatus;
}

export type RefundReason = 'duplicate' | 'notAsDescribed' | 'accidental' | 'goodwill';

export interface RefundInput {
  amount: number;
  reason: RefundReason;
  note: string;
}

export type FailureReason = 'declined' | 'insufficientFunds' | 'expiredCard' | 'fawryNotPaid';

export interface FailedPayment {
  id: string;
  at: string;
  customer: Customer;
  planName: string;
  amount: number;
  method: PaymentMethod;
  reason: FailureReason;
  attempts: number;
}

export type SubscriptionStatus = 'active' | 'canceling' | 'canceled';
export type BillingPeriod = 'monthly' | 'yearly';

export interface Subscription {
  id: string;
  customer: Customer;
  planName: string;
  period: BillingPeriod;
  status: SubscriptionStatus; // canceling: still active until renewsAt, then ends
  startedAt: string;
  renewsAt: string;
}

export type CancelTiming = 'now' | 'periodEnd';
export type CancelReason = 'customerRequest' | 'paymentIssue' | 'fraud' | 'other';

export interface CancelInput {
  timing: CancelTiming;
  reason: CancelReason;
  note: string;
}
