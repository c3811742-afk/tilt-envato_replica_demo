import type { PlanDuration } from '@/shared/constants';
import type { CreditTier, Plan, ProjectPass } from '@/shared/types';
import { getSubscriptionTotal } from '@/shared/utils';

// What is being bought at checkout: a plan (with its billing, and the credit tier on Ultimate) or a project pass.
export type Purchase =
  | { kind: 'plan'; plan: Plan; duration: PlanDuration; creditTier?: CreditTier }
  | { kind: 'pass'; pass: ProjectPass };

// The price before a promo code or account credit.
export const purchaseSubtotal = (purchase: Purchase, members: number, student: boolean) =>
  purchase.kind === 'plan'
    ? getSubscriptionTotal(purchase.plan, purchase.duration, members, { student, creditTier: purchase.creditTier })
    : purchase.pass.price;
