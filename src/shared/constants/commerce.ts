import type { IconName } from '@/shared/assets';

// Prices are whole Egyptian pounds and include VAT (other currencies are only shown, see region.ts).
export const currency = {
  code: 'EGP',
} as const;

// VAT included in every price (0.14 = 14%). Invoices show the amount before VAT and the VAT on top.
export const vatRate = 0.14;

// Plans are paid monthly or yearly (in months). Yearly costs less per month.
export const planDurations = [1, 12] as const;
export type PlanDuration = (typeof planDurations)[number];
export const defaultPlanDuration: PlanDuration = 12;

export const planDurationDiscounts: Record<PlanDuration, number> = {
  1: 0,
  12: 0.2,
};

// Students who verify a university email pay this much less on plans that offer a student price.
export const studentDiscount = 0.5;
// University email addresses end with one of these (e.g. name@cu.edu.eg).
export const universityEmailEndings: readonly string[] = ['.edu.eg', '.edu', '.ac.uk', '.edu.sa', '.ac.ae'];

// Most seats a Teams plan can have.
export const teamMaxMembers = 30;

// Monthly installments offered for a yearly plan (valU-style).
export const installmentMonths = 12;

// Payment methods offered at checkout. Installments are only for yearly plans.
export const paymentMethods = ['card', 'meeza', 'wallet', 'instapay', 'fawry', 'installments'] as const;
export type PaymentMethod = (typeof paymentMethods)[number];

// Methods that can be saved to the account and charged again (renewals, upgrades, added seats).
export const savedPaymentKinds = ['card', 'meeza', 'wallet', 'instapay'] as const satisfies readonly PaymentMethod[];
export type SavedPaymentKind = (typeof savedPaymentKinds)[number];

// Card payments (Visa, Mastercard, Meeza): the demo accepts any number that passes the checksum.
// The "declined" number shows what happens when a payment fails.
export const card = {
  numberLength: 16,
  cvcLength: { min: 3, max: 4 },
  demoNumber: '4242 4242 4242 4242', // shown as a hint on the card form
  declinedNumber: '4000 0000 0000 0002',
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

// A plan's renewal reminder is sent this many days before it renews.
export const renewalReminderDays = 7;

// The seller printed on e-invoices (demo registration number).
export const seller = {
  taxRegistrationNumber: '100-234-567',
} as const;

// Team sizes on the Enterprise "Contact sales" form.
export const salesTeamSizes = ['small', 'medium', 'large'] as const;
export type SalesTeamSize = (typeof salesTeamSizes)[number];
