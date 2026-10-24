import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AsyncContent, Badge, Button, Card, FaqAccordion, Grid, Icon, Page, Section, SegmentedControl, Stack, Table, Text, TextLink } from '@/shared/components';
import {
  accountPath,
  checkoutPassPath,
  checkoutPath,
  defaultPlanDuration,
  paymentMethodIcons,
  paymentMethods,
  planChangePath,
  planDurationDiscounts,
  planDurations,
  vatRate,
  type PlanDuration,
} from '@/shared/constants';
import { useAsync, useLocale, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { CreditTier, Plan, ProjectPass } from '@/shared/types';
import { activePass, activeSubscription, api, fillText, formatDate, formatNumber, formatPercent, getPlanPrice } from '@/shared/utils';
import { PlanCard } from '@/features/customer/components';

export const PricingPage = () => {
  const { text, locale } = useLocale();
  const { session } = useSession();
  const navigate = useNavigate();
  const plans = useAsync(api.getPlans, []);
  const passes = useAsync(api.getPasses, []);
  const [duration, setDuration] = useState<PlanDuration>(defaultPlanDuration);
  const [creditTiers, setCreditTiers] = useState<Partial<Record<Plan['id'], CreditTier>>>({});
  const subscription = activeSubscription(session);
  const student = session.status === 'signedIn' && session.user.student !== null;

  const choose = (plan: Plan) => {
    const tier = creditTiers[plan.id];
    // With a plan already, a switch is a plan change (prorated) in the account, not a new checkout.
    navigate(subscription ? planChangePath(plan.id) : checkoutPath(plan.id, duration, tier?.credits));
  };

  return (
    <Page title={text.pricing.title} subtitle={text.pricing.subtitle} gap={vars.spacing[8]}>
      <Stack gap={vars.spacing[4]}>
        <SegmentedControl
          label={text.pricing.durationLabel}
          value={String(duration)}
          onChange={(value) => setDuration(Number(value) as PlanDuration)}
          options={planDurations.map((months) => {
            const discount = planDurationDiscounts[months];
            return {
              value: String(months),
              label: text.pricing.durations[`month${months}`],
              extra: discount > 0 && <Badge variant="free">{fillText(text.pricing.save, { percent: formatPercent(discount, locale) })}</Badge>,
            };
          })}
        />
        <Text variant="bodySm" color={vars.colors.textMuted}>
          {fillText(text.pricing.vatIncluded, { rate: formatPercent(vatRate, locale) })}
        </Text>
      </Stack>

      <AsyncContent state={plans}>
        {(data) => (
          <Stack gap={vars.spacing[8]}>
            <Stack gap={vars.spacing[4]}>
              <Grid stretch gap={vars.spacing[5]}>
                {data.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    duration={duration}
                    current={plan.id === subscription?.planId}
                    hasPlan={subscription !== null}
                    student={student}
                    creditTier={creditTiers[plan.id]}
                    onCreditTierChange={(tier) => setCreditTiers((current) => ({ ...current, [plan.id]: tier }))}
                    onSubscribe={choose}
                  />
                ))}
              </Grid>
              <StudentNote plans={data} student={student} duration={duration} />
            </Stack>
            <CompareTable plans={data} duration={duration} />
          </Stack>
        )}
      </AsyncContent>

      <Section title={text.pricing.passesTitle} subtitle={text.pricing.passesSubtitle}>
        <AsyncContent state={passes}>
          {(data) => (
            <Grid stretch gap={vars.spacing[5]}>
              {data.map((pass) => (
                <PassCard key={pass.id} pass={pass} />
              ))}
            </Grid>
          )}
        </AsyncContent>
      </Section>

      <Section title={text.pricing.faqTitle}>
        <FaqAccordion entries={text.pricing.faq} />
      </Section>

      <Section title={text.pricing.paymentTitle}>
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
      </Section>
    </Page>
  );
};

// A project pass: price, what it includes, and "Buy pass" (or until when the user's pass is active).
const PassCard = ({ pass }: { pass: ProjectPass }) => {
  const { text, locale, price } = useLocale();
  const { session } = useSession();
  const copy = text.pricing.passes[pass.id];
  const running = activePass(session);
  const current = running?.passId === pass.id ? running : null;
  return (
    <Card as="li" gap={vars.spacing[3]}>
      <Text as="h3" variant="h4">
        {copy.name}
      </Text>
      <Text as="span" variant="h2">
        {price(pass.price)}
      </Text>
      <Text color={vars.colors.textMuted}>
        {fillText(copy.description, { downloads: formatNumber(pass.downloads, locale), days: formatNumber(pass.days, locale) })}
      </Text>
      {current ? (
        <Badge variant="free">{fillText(text.pricing.passActive, { date: formatDate(current.endsAt, locale) })}</Badge>
      ) : (
        <Button variant="outline" to={checkoutPassPath(pass.id)}>
          {text.pricing.buyPass}
        </Button>
      )}
    </Card>
  );
};

// The student price line under the plans: how much students pay, and how to get it.
const StudentNote = ({ plans, student, duration }: { plans: Plan[]; student: boolean; duration: PlanDuration }) => {
  const { text, price } = useLocale();
  const plan = plans.find((candidate) => candidate.studentPrice);
  if (!plan || student) return null;
  return (
    <Stack direction="row" wrap align="center" gap={vars.spacing[3]}>
      <Icon name="graduation" size={vars.sizes.icon.sm} />
      <Text as="span" variant="bodySm">
        {fillText(text.pricing.studentPrice, { price: price(getPlanPrice(plan, duration, { student: true }).perMonth) })}
      </Text>
      <TextLink to={accountPath('plan')} variant="bodySm">
        {text.pricing.verifyStudent}
      </TextLink>
    </Stack>
  );
};

// Every plan side by side: price, downloads, AI credits and models, seats, student price, support.
const CompareTable = ({ plans, duration }: { plans: Plan[]; duration: PlanDuration }) => {
  const { text, locale, price } = useLocale();
  const values = text.pricing.compareValues;
  const count = (value: number) => formatNumber(value, locale);
  const perPlan = (plan: Plan, value: number) => fillText(plan.perMember ? values.perSeatMonth : values.perMonth, { count: count(value) });

  const rows: { key: keyof typeof text.pricing.compare; value: (plan: Plan) => string }[] = [
    {
      key: 'price',
      value: (plan) =>
        plan.monthlyPrice === null
          ? text.pricing.priceOnRequest
          : `${price(getPlanPrice(plan, duration).perMonth)} ${plan.perMember ? text.pricing.perMemberMonth : text.pricing.perMonth}`,
    },
    { key: 'downloads', value: (plan) => (plan.downloadsPerMonth === null ? values.unlimited : perPlan(plan, plan.downloadsPerMonth)) },
    { key: 'license', value: () => values.included },
    {
      key: 'aiCredits',
      value: (plan) =>
        plan.creditTiers.length > 1
          ? fillText(values.tiers, { min: count(plan.creditTiers[0].credits), max: count(plan.creditTiers[plan.creditTiers.length - 1].credits) })
          : perPlan(plan, plan.credits),
    },
    { key: 'concurrent', value: (plan) => count(plan.concurrentGenerations) },
    { key: 'models', value: (plan) => plan.models.map((model) => text.ai.models[model]).join(', ') },
    { key: 'seats', value: (plan) => (plan.minMembers > 1 ? fillText(values.seatsFrom, { count: count(plan.minMembers) }) : count(1)) },
    { key: 'studentPrice', value: (plan) => (plan.studentPrice ? values.included : values.notIncluded) },
    { key: 'support', value: (plan) => values.support[plan.id] },
  ];

  return (
    <Section title={text.pricing.compareTitle}>
      <Table
        label={text.pricing.compareTitle}
        rowHeaders
        columns={[{ key: 'feature', label: text.pricing.compareFeature }, ...plans.map((plan) => ({ key: plan.id, label: text.pricing.plans[plan.id].name }))]}
        rows={rows.map((row) => ({
          key: row.key,
          cells: { feature: text.pricing.compare[row.key], ...Object.fromEntries(plans.map((plan) => [plan.id, row.value(plan)])) },
        }))}
      />
    </Section>
  );
};
