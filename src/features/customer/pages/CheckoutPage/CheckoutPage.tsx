import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { AsyncContent, Button, EmptyState, Page } from '@/shared/components';
import { checkoutParamKeys, routes } from '@/shared/constants';
import { useAsync, useLocale } from '@/shared/hooks';
import type { Subscription } from '@/shared/types';
import { api, isPlanDuration } from '@/shared/utils';
import { CheckoutForm } from './CheckoutForm';
import { CheckoutResult } from './CheckoutResult';

// "A registered user can subscribe to one of the pricing plans": reached from "Subscribe" on the pricing page.
export const CheckoutPage = () => {
  const { text } = useLocale();
  const [params] = useSearchParams();
  const plans = useAsync(api.getPlans, []);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const planId = params.get(checkoutParamKeys.plan);
  const months = Number(params.get(checkoutParamKeys.months));

  return (
    <Page title={text.checkout.title}>
      <AsyncContent state={plans}>
        {(data) => {
          const plan = data.find((candidate) => candidate.id === planId);
          // A plan or length that doesn't exist (e.g. an edited link) sends the user back to the plans.
          if (!plan || !isPlanDuration(months)) {
            return (
              <EmptyState
                title={text.checkout.invalidPlanTitle}
                message={text.checkout.invalidPlanMessage}
                action={<Button to={routes.pricing}>{text.common.viewPlans}</Button>}
              />
            );
          }
          return subscription ? (
            <CheckoutResult plan={plan} subscription={subscription} onPaid={setSubscription} />
          ) : (
            <CheckoutForm plan={plan} duration={months} onSubscribed={setSubscription} />
          );
        }}
      </AsyncContent>
    </Page>
  );
};
