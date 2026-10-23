import { installmentMonths, planDurationDiscounts, planDurations, studentDiscount, vatRate, type PlanDuration } from '@/shared/constants';
import type { CreditTier, Plan, Subscription } from '@/shared/types';

export interface PriceOptions {
  student?: boolean; // a verified student (only on plans with a student price)
  creditTier?: CreditTier; // Ultimate: the chosen monthly credits
}

export interface PlanPrice {
  perMonth: number; // EGP a month incl. VAT, after the yearly and student discounts
  total: number; // EGP for the whole prepaid period
  savings: number; // EGP saved compared with paying month by month at the full price
  discount: number; // the yearly discount (0.2 = 20% off)
}

// A plan's monthly price before the yearly discount: the plan, the credit tier, and the student price.
const baseMonthlyPrice = (plan: Plan, { student, creditTier }: PriceOptions) => {
  const monthly = (plan.monthlyPrice ?? 0) + (creditTier?.extraMonthlyPrice ?? 0);
  return student && plan.studentPrice ? monthly * (1 - studentDiscount) : monthly;
};

// Price of a plan prepaid for `duration` months (per seat on Teams).
export const getPlanPrice = (plan: Plan, duration: PlanDuration, options: PriceOptions = {}): PlanPrice => {
  const discount = planDurationDiscounts[duration];
  const fullMonthly = (plan.monthlyPrice ?? 0) + (options.creditTier?.extraMonthlyPrice ?? 0);
  const perMonth = Math.round(baseMonthlyPrice(plan, options) * (1 - discount));
  const total = perMonth * duration;
  return { perMonth, total, savings: fullMonthly * duration - total, discount };
};

// What the whole subscription costs for one period: the plan price, times the seats on a per-seat plan.
export const getSubscriptionTotal = (plan: Plan, duration: PlanDuration, members: number, options: PriceOptions = {}) =>
  getPlanPrice(plan, duration, options).total * (plan.perMember ? Math.max(members, plan.minMembers) : 1);

export const isPlanDuration = (value: number): value is PlanDuration => (planDurations as readonly number[]).includes(value);

// The VAT included in a price (prices include VAT): 114 EGP at 14% includes 14 EGP of VAT.
export const vatIncluded = (total: number) => Math.round((total - total / (1 + vatRate)) * 100) / 100;

export interface PaymentBreakdown {
  discount: number; // taken off by the promo code
  balanceUsed: number; // account credit (from an earlier downgrade) used on this payment
  total: number; // what is paid
  vat: number; // VAT included in the total
}

// A payment after the promo code (a share off) and then the account credit.
export const paymentBreakdown = (subtotal: number, promoRate = 0, balance = 0): PaymentBreakdown => {
  const discount = Math.round(subtotal * promoRate);
  const balanceUsed = Math.min(Math.max(balance, 0), subtotal - discount);
  const total = subtotal - discount - balanceUsed;
  return { discount, balanceUsed, total, vat: vatIncluded(total) };
};

// The monthly installment for a yearly plan, or null when the plan isn't yearly.
export const getInstallment = (total: number, duration: PlanDuration) =>
  duration === installmentMonths ? Math.ceil(total / installmentMonths) : null;

const dayMs = 24 * 60 * 60 * 1000;

// The share of the current period still to come (1 at the start, 0 at the end).
export const periodRemaining = (subscription: Pick<Subscription, 'startedAt' | 'endsAt'>, now: Date = new Date()) => {
  const start = new Date(subscription.startedAt).getTime();
  const end = new Date(subscription.endsAt).getTime();
  return Math.min(1, Math.max(0, (end - now.getTime()) / Math.max(end - start, dayMs)));
};

export interface Proration {
  credit: number; // unused part of what was paid for the current plan
  charge: number; // the new plan for the rest of the period
  net: number; // charged now (negative: credit kept for the next payment)
}

// Changing plan mid-period: the unused part of the old plan is credited, the rest of the period is charged at the new price.
export const prorate = (current: Subscription, newTotal: number, now: Date = new Date()): Proration => {
  const remaining = periodRemaining(current, now);
  const credit = Math.round((current.paid ?? current.total) * remaining);
  const charge = Math.round(newTotal * remaining);
  return { credit, charge, net: charge - credit };
};

// Days left until a date (rounded up; 0 when it has passed).
export const daysUntil = (date: string, now: Date = new Date()) => Math.max(0, Math.ceil((new Date(date).getTime() - now.getTime()) / dayMs));
