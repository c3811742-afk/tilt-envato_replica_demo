import type { Plan, PlanInput, PromoCode, PromoCodeInput } from '@/features/admin/types';
import { sameText } from '@/features/admin/utils/lists';
import { trimLocalized } from '@/features/admin/utils/validation';
import { AdminApiError } from './errors';
import { authorize, db, findById, logAction, newId, respond } from './mockServer';

const planTarget = (plan: Plan) => ({ kind: 'plan' as const, id: plan.id, label: plan.name.en, labels: plan.name });

export const fetchPlans = () => respond(() => db.plans);

// Adds a plan, or updates it when an id is given. Price changes apply from each subscriber's next renewal.
export const savePlan = (actorId: string, input: PlanInput, id?: string) =>
  respond((): Plan => {
    const actor = authorize(actorId, 'managePlans');
    const values = { ...input, name: trimLocalized(input.name) };
    const plan = id ? Object.assign(findById(db.plans, id), values) : { id: newId(), subscribers: 0, ...values };
    if (!id) db.plans.push(plan);
    logAction(actor, 'planSaved', planTarget(plan), { change: id ? 'details' : 'added' });
    return plan;
  });

// Newest first.
export const fetchPromoCodes = () => respond(() => [...db.promoCodes].reverse());

export const createPromoCode = (actorId: string, input: PromoCodeInput) =>
  respond((): PromoCode => {
    const actor = authorize(actorId, 'managePlans');
    const code = input.code.trim().toUpperCase();
    if (db.promoCodes.some((promo) => sameText(promo.code, code))) throw new AdminApiError('codeTaken');

    const promo: PromoCode = { ...input, id: newId(), code, uses: 0, active: true };
    db.promoCodes.push(promo);
    logAction(actor, 'promoCodeSaved', { kind: 'promoCode', id: promo.id, label: promo.code }, { change: 'added' });
    return promo;
  });

// A disabled code stops working at once. Orders already paid with it keep their discount.
export const disablePromoCode = (actorId: string, id: string) =>
  respond(() => {
    const actor = authorize(actorId, 'managePlans');
    const promo = findById(db.promoCodes, id);
    promo.active = false;
    logAction(actor, 'promoCodeDisabled', { kind: 'promoCode', id: promo.id, label: promo.code });
    return promo;
  });
