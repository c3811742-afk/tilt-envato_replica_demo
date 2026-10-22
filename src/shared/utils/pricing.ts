import { installmentMinTotal, installmentMonths, planDurationDiscounts, planDurations, type PlanDuration } from '@/shared/constants';
import type { Plan } from '@/shared/types';

export interface PlanPrice {
  perMonth: number; // EGP a month after the duration discount
  total: number; // EGP for the whole prepaid period
  savings: number; // EGP saved compared with paying month by month
  discount: number; // 0.25 = 25% off
}

// Price of a plan prepaid for `duration` months (per member for the team plan).
export const getPlanPrice = (plan: Plan, duration: PlanDuration): PlanPrice => {
  const discount = planDurationDiscounts[duration];
  const perMonth = Math.round(plan.monthlyPrice * (1 - discount));
  const total = perMonth * duration;
  return { perMonth, total, savings: plan.monthlyPrice * duration - total, discount };
};

// What the whole subscription costs: the plan price for the period, times the seats on a per-member plan.
export const getSubscriptionTotal = (plan: Plan, duration: PlanDuration, members: number) =>
  getPlanPrice(plan, duration).total * (plan.perMember ? members : 1);

export const isPlanDuration = (value: number): value is PlanDuration => (planDurations as readonly number[]).includes(value);

// Monthly installment for a total, or null when the total is too small to offer installments.
export const getInstallment = (total: number) =>
  total >= installmentMinTotal ? Math.ceil(total / installmentMonths) : null;
