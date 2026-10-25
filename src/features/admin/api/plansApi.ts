import { planSubscribers } from '@/features/admin/mocks';
import type { Plan, PlanInput, PromoCode, PromoCodeInput } from '@/features/admin/types';
import { sameText } from '@/features/admin/utils/lists';
import { texts } from '@/shared/constants';
import type { Plan as SitePlan } from '@/shared/types';
import { getPlanPrice, planStore, promoCodeStore, readAccounts } from '@/shared/utils';
import { AdminApiError } from './errors';
import { authorize, findById, logAction, newId, respond } from './mockServer';

// ---------- Plans ----------
// The site's plans. Saving writes them where the pricing page and checkout read them.

const toAdminPlan = (plan: SitePlan): Plan => ({
  id: plan.id,
  name: { en: texts.en.pricing.plans[plan.id].name, ar: texts.ar.pricing.plans[plan.id].name },
  monthlyPrice: plan.monthlyPrice,
  yearlyPrice: plan.monthlyPrice === null ? null : getPlanPrice(plan, 12).total,
  downloadLimit: plan.downloadsPerMonth,
  perMember: plan.perMember,
  seats: plan.minMembers,
  aiCredits: plan.credits,
  parallelGenerations: plan.concurrentGenerations,
  active: plan.active !== false,
  subscribers:
    planSubscribers[plan.id] +
    readAccounts().filter((account) => account.subscription?.planId === plan.id && account.subscription.status === 'active').length,
});

export const allPlans = () => planStore.get().map(toAdminPlan);

const planTarget = (plan: Plan) => ({ kind: 'plan' as const, id: plan.id, label: plan.name.en, labels: plan.name });

export const fetchPlans = () => respond(allPlans);

// Price changes apply from each subscriber's next renewal; new buyers pay the new price right away.
export const savePlan = (actorId: string, input: PlanInput, id: string) =>
  respond((): Plan => {
    const actor = authorize(actorId, 'managePlans');
    const plans = planStore.get();
    const plan = findById(plans, id);
    const saved: SitePlan = {
      ...plan,
      monthlyPrice: input.monthlyPrice,
      downloadsPerMonth: input.downloadLimit,
      minMembers: plan.perMember ? input.seats : 1,
      credits: input.aiCredits,
      // The smallest credit tier is the plan's own credits.
      creditTiers: plan.creditTiers.map((tier, index) => (index === 0 ? { ...tier, credits: input.aiCredits } : tier)),
      concurrentGenerations: input.parallelGenerations,
      active: input.active,
    };
    planStore.set(plans.map((current) => (current.id === id ? saved : current)));
    const result = toAdminPlan(saved);
    logAction(actor, 'planSaved', planTarget(result), { change: 'details' });
    return result;
  });

// ---------- Promo codes ----------
// The site's checkout checks these codes, and counts each use.

// Newest first.
export const fetchPromoCodes = () => respond(() => [...promoCodeStore.get()].reverse());

export const createPromoCode = (actorId: string, input: PromoCodeInput) =>
  respond((): PromoCode => {
    const actor = authorize(actorId, 'managePlans');
    const code = input.code.trim().toUpperCase();
    const codes = promoCodeStore.get();
    if (codes.some((promo) => sameText(promo.code, code))) throw new AdminApiError('codeTaken');

    const promo: PromoCode = { ...input, id: newId(), code, uses: 0, active: true };
    promoCodeStore.set([...codes, promo]);
    logAction(actor, 'promoCodeSaved', { kind: 'promoCode', id: promo.id, label: promo.code }, { change: 'added' });
    return promo;
  });

// A turned-off code stops working at checkout at once. Orders already paid with it keep their discount.
export const disablePromoCode = (actorId: string, id: string) =>
  respond(() => {
    const actor = authorize(actorId, 'managePlans');
    const codes = promoCodeStore.get();
    const promo: PromoCode = { ...findById(codes, id), active: false };
    promoCodeStore.set(codes.map((current) => (current.id === id ? promo : current)));
    logAction(actor, 'promoCodeDisabled', { kind: 'promoCode', id: promo.id, label: promo.code });
    return promo;
  });
