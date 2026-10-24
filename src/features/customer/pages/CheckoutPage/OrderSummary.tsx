import { Card, DetailList, Stack, Text } from '@/shared/components';
import { currency, vatRate } from '@/shared/constants';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { fillText, formatNumber, formatPercent, formatPrice, getPlanPrice, type PaymentBreakdown } from '@/shared/utils';
import type { Purchase } from './purchase';

interface OrderSummaryProps {
  purchase: Purchase;
  members: number;
  student: boolean;
  breakdown: PaymentBreakdown;
  promoCode?: string;
  installment: number | null; // monthly installment, when paying in installments
}

// What the user is about to pay: the plan or pass, seats, discounts, account credit, the total and the VAT in it.
export const OrderSummary = ({ purchase, members, student, breakdown, promoCode, installment }: OrderSummaryProps) => {
  const { text, locale, currency: shownCurrency, price: showPrice } = useLocale();

  const itemRows =
    purchase.kind === 'plan'
      ? (() => {
          const { plan, duration, creditTier } = purchase;
          const price = getPlanPrice(plan, duration, { student, creditTier });
          const seats = plan.perMember ? members : 1;
          return [
            {
              label: fillText(text.checkout.planLine, { plan: text.pricing.plans[plan.id].name, duration: text.pricing.durations[`month${duration}`] }),
              value: `${showPrice(price.perMonth)} ${plan.perMember ? text.pricing.perMemberMonth : text.pricing.perMonth}`,
            },
            ...(plan.perMember ? [{ label: text.checkout.members, value: fillText(text.checkout.membersLine, { count: formatNumber(members, locale) }) }] : []),
            ...(creditTier
              ? [{ label: text.pricing.creditTierLabel, value: fillText(text.checkout.creditsLine, { credits: formatNumber(creditTier.credits, locale) }) }]
              : []),
            ...(student && plan.studentPrice ? [{ label: text.checkout.studentLine, value: text.pricing.compareValues.included }] : []),
            ...(price.savings > 0 ? [{ label: text.checkout.discount, value: showPrice(-price.savings * seats) }] : []),
          ];
        })()
      : [{ label: text.pricing.passes[purchase.pass.id].name, value: showPrice(purchase.pass.price) }];

  const rows = [
    ...itemRows,
    ...(breakdown.discount > 0 && promoCode ? [{ label: fillText(text.checkout.promoLine, { code: promoCode }), value: showPrice(-breakdown.discount) }] : []),
    ...(breakdown.balanceUsed > 0 ? [{ label: text.checkout.balanceLine, value: showPrice(-breakdown.balanceUsed) }] : []),
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
        <Text variant="h2">{showPrice(breakdown.total)}</Text>
      </Stack>
      <Stack direction="row" justify="space-between" gap={vars.spacing[3]}>
        <Text variant="bodySm" color={vars.colors.textMuted}>
          {fillText(text.checkout.vatLine, { rate: formatPercent(vatRate, locale) })}
        </Text>
        <Text variant="bodySm" color={vars.colors.textMuted}>
          {showPrice(breakdown.vat)}
        </Text>
      </Stack>
      {/* Payments are in Egyptian pounds: other currencies are shown converted. */}
      {shownCurrency !== currency.code && (
        <Text variant="bodySm" color={vars.colors.textMuted}>
          {fillText(text.checkout.chargedIn, { price: formatPrice(breakdown.total, locale) })} {text.languageMenu.currencyNote}
        </Text>
      )}
    </Card>
  );
};
