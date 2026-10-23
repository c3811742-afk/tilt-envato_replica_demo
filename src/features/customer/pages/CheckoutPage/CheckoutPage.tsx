import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { AsyncContent, Button, EmptyState, Page } from '@/shared/components';
import { checkoutParamKeys, routes } from '@/shared/constants';
import { useAsync, useLocale } from '@/shared/hooks';
import type { Plan, ProjectPass } from '@/shared/types';
import { api, isPlanDuration, type SessionAccount } from '@/shared/utils';
import { CheckoutForm } from './CheckoutForm';
import { CheckoutResult } from './CheckoutResult';
import type { Purchase } from './purchase';

// Checkout for a plan ("Subscribe" on the pricing page) or a project pass ("Buy pass").
export const CheckoutPage = () => {
  const { text } = useLocale();
  const [params] = useSearchParams();
  const catalog = useAsync(async () => ({ plans: await api.getPlans(), passes: await api.getPasses() }), []);
  const [paid, setPaid] = useState<SessionAccount | null>(null);

  const purchaseFrom = ({ plans, passes }: { plans: Plan[]; passes: ProjectPass[] }): Purchase | null => {
    const pass = passes.find((candidate) => candidate.id === params.get(checkoutParamKeys.pass));
    if (pass) return { kind: 'pass', pass };
    const plan = plans.find((candidate) => candidate.id === params.get(checkoutParamKeys.plan));
    const months = Number(params.get(checkoutParamKeys.months));
    // Enterprise has no listed price: it is bought through sales, not here.
    if (!plan || plan.monthlyPrice === null || !isPlanDuration(months)) return null;
    const credits = Number(params.get(checkoutParamKeys.credits));
    return { kind: 'plan', plan, duration: months, creditTier: plan.creditTiers.find((tier) => tier.credits === credits) ?? plan.creditTiers[0] };
  };

  return (
    <Page title={text.checkout.title}>
      <AsyncContent state={catalog}>
        {(data) => {
          const purchase = purchaseFrom(data);
          // A plan or pass that doesn't exist (e.g. an edited link) sends the user back to the plans.
          if (!purchase) {
            return (
              <EmptyState
                title={text.checkout.invalidPlanTitle}
                message={text.checkout.invalidPlanMessage}
                action={<Button to={routes.pricing}>{text.common.viewPlans}</Button>}
              />
            );
          }
          return paid ? <CheckoutResult purchase={purchase} account={paid} onPaid={setPaid} /> : <CheckoutForm purchase={purchase} onPaid={setPaid} />;
        }}
      </AsyncContent>
    </Page>
  );
};
