import {
  card,
  cardPaymentMethods,
  fawry,
  universityEmailEndings,
  type PaymentMethod,
  type PlanDuration,
  type SavedPaymentKind,
} from '@/shared/constants';
import { mockPasses, mockPlans, mockPromoCodes } from '@/shared/mocks';
import type { BillingAddress, Invoice, InvoiceLine, PassId, PlanId, SavedPaymentMethod, Subscription } from '@/shared/types';
import {
  call,
  checkCode,
  issueCode,
  minutesFromNow,
  periodFrom,
  randomDigits,
  saveAccount,
  signedInAccount,
  teamOf,
  toSessionAccount,
  updateSignedIn,
  withAlert,
  type StoredAccount,
} from './accountStore';
import { ApiError } from './apiError';
import { ensureTeam, seatsInUse } from './teamApi';
import { getSubscriptionTotal, paymentBreakdown, prorate, vatIncluded } from './pricing';
import { isSubscriptionActive } from './session';
import { keepDigits, validateCardNumber } from './validation';

// Plans, passes and payments for the demo: nothing is charged; card numbers are only checked and masked.

// How the user pays at checkout: a saved method, or new details (saved to the account when they ask).
export interface PaymentChoice {
  method: PaymentMethod;
  savedMethodId?: string;
  cardNumber?: string; // new card (only its last 4 digits are kept)
  holder?: string;
  expiry?: string;
  phone?: string; // wallet
  address?: string; // InstaPay
  save?: boolean; // keep the new method on the account
}

export interface SubscribeRequest {
  planId: PlanId;
  duration: PlanDuration;
  members: number;
  credits?: number; // Ultimate: the chosen credit tier
  payment: PaymentChoice;
  autoRenew: boolean;
  promoCode?: string;
  billingAddress: BillingAddress;
}

export interface PassRequest {
  passId: PassId;
  payment: PaymentChoice;
  promoCode?: string;
  billingAddress: BillingAddress;
}

export interface PlanChangeRequest {
  planId: PlanId;
  duration: PlanDuration;
  members: number;
  credits?: number;
  confirmedNet: number; // what the user saw and confirmed: the change is refused if the price changed since
}

export interface PaymentMethodRequest {
  kind: SavedPaymentKind;
  cardNumber?: string;
  holder?: string;
  expiry?: string;
  phone?: string;
  address?: string;
  makeDefault?: boolean;
}

export interface SalesRequest {
  name: string;
  company: string;
  email: string;
  phone: string;
  teamSize: string;
  message: string;
}

const findPlan = (planId: PlanId) => {
  const plan = mockPlans.find((candidate) => candidate.id === planId);
  if (!plan || plan.monthlyPrice === null) throw new ApiError('planUnavailable');
  return plan;
};

const creditTierOf = (planId: PlanId, credits?: number) => findPlan(planId).creditTiers.find((tier) => tier.credits === credits);

const isStudent = (account: StoredAccount) => account.student !== null;

// The total for a plan as this account would pay it (student price, credit tier, seats).
const planTotal = (account: StoredAccount, planId: PlanId, duration: PlanDuration, members: number, credits?: number) => {
  const plan = findPlan(planId);
  return getSubscriptionTotal(plan, duration, members, { student: isStudent(account), creditTier: creditTierOf(planId, credits) });
};

// AI credits a month for a plan: the tier on Ultimate, per seat on Teams.
const monthlyCredits = (planId: PlanId, members: number, credits?: number) => {
  const plan = findPlan(planId);
  const tier = creditTierOf(planId, credits);
  return (tier?.credits ?? plan.credits) * (plan.perMember ? members : 1);
};

const promoRate = (code?: string) => {
  if (!code?.trim()) return 0;
  const rate = mockPromoCodes[code.trim().toUpperCase()];
  if (rate === undefined) throw new ApiError('invalidPromo');
  return rate;
};

const cardBrandSummary = (number: string) => `•••• ${keepDigits(number, card.numberLength).slice(-4)}`;

// A saved method from new payment details.
const toSavedMethod = (kind: SavedPaymentKind, details: Omit<PaymentMethodRequest, 'kind'>, isDefault: boolean): SavedPaymentMethod => ({
  id: crypto.randomUUID(),
  kind,
  summary:
    kind === 'card' || kind === 'meeza'
      ? cardBrandSummary(details.cardNumber ?? '')
      : kind === 'wallet'
        ? (details.phone ?? '').trim()
        : (details.address ?? '').trim(),
  holder: details.holder?.trim(),
  expiry: details.expiry,
  isDefault,
  addedAt: new Date().toISOString(),
});

// Charges a payment: the demo's "declined" card number fails, and the user is told by a notification.
const charge = (account: StoredAccount, payment: PaymentChoice): StoredAccount => {
  const declined = payment.cardNumber && keepDigits(payment.cardNumber, card.numberLength) === keepDigits(card.declinedNumber, card.numberLength);
  if (declined) {
    saveAccount(withAlert(account, 'paymentFailed', { method: payment.method }));
    throw new ApiError('paymentDeclined');
  }
  if (payment.cardNumber && validateCardNumber(payment.cardNumber)) throw new ApiError('paymentDeclined');
  return account;
};

// Saves new payment details to the account when the user asked to.
const rememberMethod = (account: StoredAccount, payment: PaymentChoice): { account: StoredAccount; savedMethodId?: string } => {
  if (payment.savedMethodId) return { account, savedMethodId: payment.savedMethodId };
  const kind = payment.method as SavedPaymentKind;
  if (!payment.save || !['card', 'meeza', 'wallet', 'instapay'].includes(kind)) return { account };
  const method = toSavedMethod(kind, payment, account.paymentMethods.length === 0);
  return { account: { ...account, paymentMethods: [...account.paymentMethods, method] }, savedMethodId: method.id };
};

// An invoice for a payment. Promo codes and account credit are lines that lower the total.
const makeInvoice = (account: StoredAccount, lines: InvoiceLine[], paymentMethod: PaymentMethod, status: Invoice['status']): Invoice => {
  const total = Math.max(0, lines.reduce((sum, line) => sum + line.amount, 0));
  const issuedAt = new Date();
  return {
    id: crypto.randomUUID(),
    number: `INV-${issuedAt.getFullYear()}-${randomDigits(6)}`,
    issuedAt: issuedAt.toISOString(),
    lines,
    total,
    vat: vatIncluded(total),
    paymentMethod,
    status,
    taxUuid: crypto.randomUUID().replace(/-/g, '').toUpperCase(),
    buyerName: account.name,
    buyerArabicName: account.profile?.arabicName,
    billingAddress: account.billingAddress,
  };
};

// Lines that lower a payment: a promo code, then account credit from an earlier downgrade.
const reductions = (account: StoredAccount, subtotal: number, promoCode?: string): InvoiceLine[] => {
  const { discount, balanceUsed } = paymentBreakdown(subtotal, promoRate(promoCode), account.balance);
  return [
    ...(discount ? [{ kind: 'discount' as const, code: (promoCode ?? '').trim().toUpperCase(), amount: -discount }] : []),
    ...(balanceUsed ? [{ kind: 'balance' as const, amount: -balanceUsed }] : []),
  ];
};

const usedBalance = (lines: InvoiceLine[]) => -lines.filter((line) => line.kind === 'balance').reduce((sum, line) => sum + line.amount, 0);

const activePlan = (account: StoredAccount) => {
  if (!account.subscription || !isSubscriptionActive(account.subscription)) throw new ApiError('noActivePlan');
  return account.subscription;
};

// The method a renewal or change is charged to: the subscription's, else the default saved method.
const chargeableMethod = (account: StoredAccount, subscription: Subscription) =>
  account.paymentMethods.find((method) => method.id === subscription.savedMethodId) ??
  account.paymentMethods.find((method) => method.isDefault) ??
  null;

export const billingApi = {
  // Checks a promo code: the share it takes off the first payment.
  checkPromo: (code: string) => call(() => promoRate(code)),

  // Starts a plan. Fawry payments stay pending (with a pending invoice) until the code is paid.
  subscribe: ({ planId, duration, members, credits, payment, autoRenew, promoCode, billingAddress }: SubscribeRequest) =>
    call(() => {
      const plan = findPlan(planId);
      const seats = plan.perMember ? Math.max(members, plan.minMembers) : 1;
      const base = { ...signedInAccount(), billingAddress };
      const subtotal = planTotal(base, planId, duration, seats, credits);
      const lines: InvoiceLine[] = [{ kind: 'plan', planId, duration, members: seats, credits, amount: subtotal }, ...reductions(base, subtotal, promoCode)];
      const charged = charge(base, payment);
      const { account, savedMethodId } = rememberMethod(charged, payment);
      const pending = payment.method === 'fawry';
      const invoice = makeInvoice(account, lines, payment.method, pending ? 'pending' : 'paid');
      const subscription: Subscription = {
        planId,
        duration,
        members: seats,
        credits: monthlyCredits(planId, seats, credits),
        paymentMethod: payment.method,
        savedMethodId,
        autoRenew: autoRenew && cardPaymentMethods.includes(payment.method),
        total: subtotal,
        paid: invoice.total,
        status: pending ? 'pendingPayment' : 'active',
        ...periodFrom(new Date(), duration),
        ...(pending && { fawryCode: randomDigits(fawry.codeLength), payBy: minutesFromNow(fawry.payWithinHours * 60) }),
      };
      const saved = saveAccount({ ...account, subscription, balance: account.balance - usedBalance(lines), invoices: [invoice, ...account.invoices] });
      // A plan with seats comes with a team the buyer owns.
      if (plan.perMember) ensureTeam(saved);
      return toSessionAccount(saved);
    }),

  // Buys a short project pass.
  buyPass: ({ passId, payment, promoCode, billingAddress }: PassRequest) =>
    call(() => {
      const pass = mockPasses.find((candidate) => candidate.id === passId);
      if (!pass) throw new ApiError('planUnavailable');
      const base = { ...signedInAccount(), billingAddress };
      const lines: InvoiceLine[] = [{ kind: 'pass', passId, amount: pass.price }, ...reductions(base, pass.price, promoCode)];
      const { account } = rememberMethod(charge(base, payment), payment);
      const pending = payment.method === 'fawry';
      const invoice = makeInvoice(account, lines, payment.method, pending ? 'pending' : 'paid');
      return toSessionAccount(
        saveAccount({
          ...account,
          pass: { passId, downloads: pass.downloads, ...periodFrom(new Date(), 0, pass.days) },
          balance: account.balance - usedBalance(lines),
          invoices: [invoice, ...account.invoices],
        }),
      );
    }),

  // Demo only: marks a pending Fawry payment as paid (in production Fawry notifies the server).
  confirmFawryPayment: () =>
    call(() => {
      const account = signedInAccount();
      if (account.subscription?.status !== 'pendingPayment') throw new ApiError('nothingToConfirm');
      // The plan period starts when the payment arrives, not when the code was created.
      const subscription: Subscription = {
        ...account.subscription,
        ...periodFrom(new Date(), account.subscription.duration),
        status: 'active',
        fawryCode: undefined,
        payBy: undefined,
      };
      const invoices = account.invoices.map((invoice, index) => (index === 0 && invoice.status === 'pending' ? { ...invoice, status: 'paid' as const } : invoice));
      return toSessionAccount(saveAccount({ ...account, subscription, invoices }));
    }),

  // What a plan change costs now: the prorated difference for the rest of the period (negative: credit).
  quoteChange: ({ planId, duration, members, credits }: Omit<PlanChangeRequest, 'confirmedNet'>) =>
    call(() => {
      const account = signedInAccount();
      const current = activePlan(account);
      const plan = findPlan(planId);
      const seats = plan.perMember ? Math.max(members, plan.minMembers) : 1;
      return { ...prorate(current, planTotal(account, planId, duration, seats, credits)), newTotal: planTotal(account, planId, duration, seats, credits) };
    }),

  // Upgrades, downgrades, adds seats or changes the credit tier, mid-period. The user must have confirmed the price.
  changePlan: ({ planId, duration, members, credits, confirmedNet }: PlanChangeRequest) =>
    call(() => {
      const account = signedInAccount();
      const current = activePlan(account);
      const plan = findPlan(planId);
      const seats = plan.perMember ? Math.max(members, plan.minMembers) : 1;
      const newTotal = planTotal(account, planId, duration, seats, credits);
      const proration = prorate(current, newTotal);
      if (proration.net !== confirmedNet) throw new ApiError('priceChanged');
      // Fewer seats than the team already uses (members and waiting invites) would leave people without one.
      const team = teamOf(account.id);
      if (plan.perMember && team && seatsInUse(team) > seats) throw new ApiError('seatsInUse');
      const method = chargeableMethod(account, current);
      if (proration.net > 0 && !method) throw new ApiError('noPaymentMethod');

      const line: InvoiceLine =
        planId === current.planId && seats !== current.members
          ? { kind: 'seats', planId, members: seats, amount: proration.net }
          : { kind: 'proration', fromPlanId: current.planId, toPlanId: planId, amount: proration.net };
      const invoices = proration.net > 0 ? [makeInvoice(account, [line], method?.kind ?? current.paymentMethod, 'paid'), ...account.invoices] : account.invoices;
      const subscription: Subscription = {
        ...current,
        planId,
        duration,
        members: seats,
        credits: monthlyCredits(planId, seats, credits),
        total: newTotal,
        // From now on the period counts as paid at the new price (the difference was charged or credited).
        paid: newTotal,
      };
      // A downgrade leaves a credit, used on the next payment.
      const saved = saveAccount({ ...account, subscription, invoices, balance: account.balance + Math.max(0, -proration.net) });
      if (plan.perMember) ensureTeam(saved);
      return toSessionAccount(saved);
    }),

  // Cancels the plan: it keeps working until the end of the period, then ends instead of renewing.
  cancel: () =>
    call(() =>
      updateSignedIn((account) => ({ subscription: { ...activePlan(account), canceledAt: new Date().toISOString(), autoRenew: false } })),
    ),

  // Keeps a canceled plan going: it renews at the end of the period again.
  resume: () =>
    call(() =>
      updateSignedIn((account) => {
        const subscription = activePlan(account);
        return { subscription: { ...subscription, canceledAt: undefined, autoRenew: cardPaymentMethods.includes(subscription.paymentMethod) } };
      }),
    ),

  setAutoRenew: (autoRenew: boolean) =>
    call(() =>
      updateSignedIn((account) => {
        const subscription = activePlan(account);
        if (autoRenew && !chargeableMethod(account, subscription)) throw new ApiError('noPaymentMethod');
        return { subscription: { ...subscription, autoRenew } };
      }),
    ),

  // Renews now for another period, charged to the saved method: from the end of the current period, or today if it ended.
  renew: () =>
    call(() => {
      const account = signedInAccount();
      const current = account.subscription;
      if (!current || current.status !== 'active') throw new ApiError('noActivePlan');
      const method = chargeableMethod(account, current);
      if (!method) throw new ApiError('noPaymentMethod');
      const start = isSubscriptionActive(current) ? new Date(current.endsAt) : new Date();
      const lines: InvoiceLine[] = [{ kind: 'plan', planId: current.planId, duration: current.duration, members: current.members, amount: current.total }, ...reductions(account, current.total)];
      const invoice = makeInvoice(account, lines, method.kind, 'paid');
      const subscription: Subscription = { ...current, ...periodFrom(start, current.duration), paid: invoice.total, canceledAt: undefined };
      return toSessionAccount(saveAccount({ ...account, subscription, balance: account.balance - usedBalance(lines), invoices: [invoice, ...account.invoices] }));
    }),

  addPaymentMethod: ({ kind, makeDefault, ...details }: PaymentMethodRequest) =>
    call(() => {
      if ((kind === 'card' || kind === 'meeza') && validateCardNumber(details.cardNumber ?? '')) throw new ApiError('paymentDeclined');
      return updateSignedIn((account) => {
        const isDefault = makeDefault || account.paymentMethods.length === 0;
        const method = toSavedMethod(kind, details, isDefault);
        const others = isDefault ? account.paymentMethods.map((saved) => ({ ...saved, isDefault: false })) : account.paymentMethods;
        return { paymentMethods: [...others, method] };
      });
    }),

  // Edits what can change on a saved method: the card's name and expiry, the wallet number, the InstaPay address.
  editPaymentMethod: (id: string, changes: Pick<PaymentMethodRequest, 'holder' | 'expiry' | 'phone' | 'address'>) =>
    call(() =>
      updateSignedIn((account) => ({
        paymentMethods: account.paymentMethods.map((method) => {
          if (method.id !== id) return method;
          if (method.kind === 'wallet' && changes.phone) return { ...method, summary: changes.phone.trim() };
          if (method.kind === 'instapay' && changes.address) return { ...method, summary: changes.address.trim() };
          return { ...method, holder: changes.holder?.trim() ?? method.holder, expiry: changes.expiry ?? method.expiry };
        }),
      })),
    ),

  // Removes a saved method. If it was the default, the next one becomes the default.
  removePaymentMethod: (id: string) =>
    call(() =>
      updateSignedIn((account) => {
        const removed = account.paymentMethods.find((method) => method.id === id);
        const remaining = account.paymentMethods.filter((method) => method.id !== id);
        if (removed?.isDefault && remaining.length) remaining[0] = { ...remaining[0], isDefault: true };
        const subscription = account.subscription?.savedMethodId === id ? { ...account.subscription, savedMethodId: undefined } : account.subscription;
        return { paymentMethods: remaining, subscription };
      }),
    ),

  setDefaultPaymentMethod: (id: string) =>
    call(() =>
      updateSignedIn((account) => ({
        paymentMethods: account.paymentMethods.map((method) => ({ ...method, isDefault: method.id === id })),
      })),
    ),

  // Students: sends a code to a university email; confirming it gives the student price.
  requestStudentVerification: (email: string) =>
    call(() => {
      const address = email.trim().toLowerCase();
      if (!universityEmailEndings.some((ending) => address.endsWith(ending))) throw new ApiError('notUniversityEmail');
      issueCode(signedInAccount(), 'verifyStudent', address);
    }),

  verifyStudent: (code: string) =>
    call(() => {
      const account = signedInAccount();
      const pending = checkCode(account, 'verifyStudent', code);
      return toSessionAccount(saveAccount({ ...account, pendingCode: null, student: { email: pending.target ?? '', verifiedAt: new Date().toISOString() } }));
    }),

  // Enterprise: the sales team gets back to the user (the demo keeps nothing).
  contactSales: (request: SalesRequest) => call(() => request),
};
