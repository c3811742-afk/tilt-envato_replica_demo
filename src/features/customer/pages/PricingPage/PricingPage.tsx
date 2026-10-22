import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AsyncContent, Badge, Card, Grid, Icon, Page, SegmentedControl, Stack, Text } from '@/shared/components';
import {
  checkoutPath,
  defaultPlanDuration,
  paymentMethodIcons,
  paymentMethods,
  planDurationDiscounts,
  planDurations,
  type PlanDuration,
} from '@/shared/constants';
import { useAsync, useLocale, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { activeSubscription, api, fillText, formatPercent } from '@/shared/utils';
import { PlanCard } from '@/features/customer/components';

export const PricingPage = () => {
  const { text, locale } = useLocale();
  const { session } = useSession();
  const plans = useAsync(api.getPlans, []);
  const [duration, setDuration] = useState<PlanDuration>(defaultPlanDuration);
  const navigate = useNavigate();
  const currentPlanId = activeSubscription(session)?.planId;

  return (
    <Page title={text.pricing.title} subtitle={text.pricing.subtitle} gap={vars.spacing[6]}>
      <SegmentedControl
        label={text.pricing.durationLabel}
        value={String(duration)}
        onChange={(value) => setDuration(Number(value) as PlanDuration)}
        options={planDurations.map((months) => {
          const discount = planDurationDiscounts[months];
          return {
            value: String(months),
            label: text.pricing.durations[`month${months}`],
            extra: discount > 0 && (
              <Badge variant="free">{fillText(text.pricing.save, { percent: formatPercent(discount, locale) })}</Badge>
            ),
          };
        })}
      />

      <AsyncContent state={plans}>
        {(data) => (
          <Grid stretch gap={vars.spacing[5]}>
            {data.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                duration={duration}
                current={plan.id === currentPlanId}
                onSubscribe={() => navigate(checkoutPath(plan.id, duration))}
              />
            ))}
          </Grid>
        )}
      </AsyncContent>

      <Stack as="section">
        <Text as="h2" variant="h3">
          {text.pricing.paymentTitle}
        </Text>
        <Stack as="ul" direction="row" wrap gap={vars.spacing[3]}>
          {paymentMethods.map((method) => (
            <Card key={method} as="li" padding={vars.spacing[3]}>
              <Stack direction="row" align="center" gap={vars.spacing[2]}>
                <Icon name={paymentMethodIcons[method]} />
                <Text as="span" variant="title">
                  {text.pricing.paymentMethods[method]}
                </Text>
              </Stack>
            </Card>
          ))}
        </Stack>
        <Text variant="bodySm" color={vars.colors.textMuted}>
          {text.pricing.prepaidNote}
        </Text>
      </Stack>
    </Page>
  );
};
