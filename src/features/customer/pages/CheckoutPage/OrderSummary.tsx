import { Card, DetailList, Stack, Text } from '@/shared/components';
import { currency, type PlanDuration } from '@/shared/constants';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { Plan } from '@/shared/types';
import { fillText, formatNumber, formatPrice, getPlanPrice, getSubscriptionTotal } from '@/shared/utils';

interface OrderSummaryProps {
  plan: Plan;
  duration: PlanDuration;
  members: number;
  installment: number | null; // monthly installment, when paying in installments
}

// What the user is about to pay: plan, length, seats, discount and total.
export const OrderSummary = ({ plan, duration, members, installment }: OrderSummaryProps) => {
  const { text, locale, currency: shownCurrency, price: showPrice } = useLocale();
  const price = getPlanPrice(plan, duration);
  const seats = plan.perMember ? members : 1;
  const total = getSubscriptionTotal(plan, duration, members);

  const rows = [
    {
      label: fillText(text.checkout.planLine, {
        plan: text.pricing.plans[plan.id].name,
        duration: text.pricing.durations[`month${duration}`],
      }),
      value: `${showPrice(price.perMonth)} ${plan.perMember ? text.pricing.perMemberMonth : text.pricing.perMonth}`,
    },
    ...(plan.perMember
      ? [{ label: text.checkout.members, value: fillText(text.checkout.membersLine, { count: formatNumber(members, locale) }) }]
      : []),
    ...(price.savings > 0 ? [{ label: text.checkout.discount, value: showPrice(-price.savings * seats) }] : []),
    ...(installment ? [{ label: text.checkout.monthlyPayment, value: showPrice(installment) }] : []),
  ];

  return (
    <Card gap={vars.spacing[4]}>
      <Text as="h2" variant="h4">
        {text.checkout.summaryTitle}
      </Text>
      <DetailList rows={rows} />
      <Stack direction="row" justify="space-between" align="baseline" gap={vars.spacing[3]}>
        <Text variant="title">{text.checkout.total}</Text>
        <Text variant="h2">{showPrice(total)}</Text>
      </Stack>
      {/* Payments are in Egyptian pounds: other currencies are shown converted. */}
      {shownCurrency !== currency.code && (
        <Text variant="bodySm" color={vars.colors.textMuted}>
          {fillText(text.checkout.chargedIn, { price: formatPrice(total, locale) })} {text.languageMenu.currencyNote}
        </Text>
      )}
    </Card>
  );
};
