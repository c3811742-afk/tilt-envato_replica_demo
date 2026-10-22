import type { IconName } from '@/shared/assets';

// Prices are whole Egyptian pounds (other currencies are only shown, see region.ts).
export const currency = {
  code: 'EGP',
} as const;

// Prepaid plan lengths in months, and the discount each one gets (0.1 = 10% off the monthly price).
export const planDurations = [1, 3, 12] as const;
export type PlanDuration = (typeof planDurations)[number];

// Selected first on the pricing page: the longest plan has the biggest saving and offers installments.
export const defaultPlanDuration: PlanDuration = 12;

export const planDurationDiscounts: Record<PlanDuration, number> = {
  1: 0,
  3: 0.1,
  12: 0.25,
};

// Most seats a team plan can buy at checkout (the minimum is the plan's own).
export const teamMaxMembers = 30;

// Number of monthly installments shown in the "or EGP X a month" hint (valU-style).
export const installmentMonths = 12;
// Only totals at or above this amount show the installments hint.
export const installmentMinTotal = 1000;

// Payment methods offered at checkout.
export const paymentMethods = ['card', 'meeza', 'wallet', 'instapay', 'fawry', 'installments'] as const;
export type PaymentMethod = (typeof paymentMethods)[number];

// Card payments (Visa, Mastercard, Meeza): the demo accepts any number that passes the checksum.
export const card = {
  numberLength: 16,
  cvcLength: { min: 3, max: 4 },
  demoNumber: '4242 4242 4242 4242', // shown as a hint on the card form
} as const;

// Fawry: the user gets a reference code and pays it in cash or in the myFawry app before it expires.
export const fawry = {
  codeLength: 9,
  payWithinHours: 48,
} as const;

// Paid with a card form. Only these can renew automatically; every other method is prepaid.
export const cardPaymentMethods: readonly PaymentMethod[] = ['card', 'meeza'];

export const paymentMethodIcons: Record<PaymentMethod, IconName> = {
  card: 'card',
  meeza: 'card',
  wallet: 'wallet',
  instapay: 'phone',
  fawry: 'receipt',
  installments: 'calendar',
};
