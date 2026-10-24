import type { PlanId, PromoCode } from '@/shared/types';
import type { LocalizedText } from './catalog';

// A plan on the site, as the admin sees it. Prices and limits are saved where the pricing page and checkout read them.
export interface Plan {
  id: PlanId;
  name: LocalizedText; // the site's plan name
  monthlyPrice: number | null; // EGP incl. VAT (per seat on per-seat plans); null: price on request
  yearlyPrice: number | null; // what a year costs, with the site's yearly discount
  downloadLimit: number | null; // per month (per seat); null: unlimited
  perMember: boolean; // priced per seat (Teams, Enterprise)
  seats: number; // the fewest seats a per-seat plan can be bought with; 1 otherwise
  aiCredits: number; // per month
  parallelGenerations: number; // AI generations that can run at the same time
  active: boolean; // false: no longer sold; current subscribers keep it
  subscribers: number;
}

export type PlanInput = Pick<Plan, 'monthlyPrice' | 'downloadLimit' | 'seats' | 'aiCredits' | 'parallelGenerations' | 'active'>;

// Promo codes are the site's own: what the admin creates works at checkout.
export type { PromoCode };
export type PromoCodeInput = Omit<PromoCode, 'id' | 'uses' | 'active'>;

export interface Customer {
  id: string; // a site account's id, or a demo customer's
  name: string;
  email: string;
}

// The site's payment methods.
export type { PaymentMethod } from '@/shared/constants';
import type { PaymentMethod } from '@/shared/constants';
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
  source?: 'demo' | 'site'; // site: a payment made on the customer side in this browser
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
  source?: 'demo' | 'site';
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
  source?: 'demo' | 'site'; // site: a plan bought on the customer side in this browser
}

export type CancelTiming = 'now' | 'periodEnd';
export type CancelReason = 'customerRequest' | 'paymentIssue' | 'fraud' | 'other';

export interface CancelInput {
  timing: CancelTiming;
  reason: CancelReason;
  note: string;
}
