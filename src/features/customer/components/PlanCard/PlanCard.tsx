import { Badge, Button, Card, Icon, Select, Stack, Text } from '@/shared/components';
import { routes, type PlanDuration } from '@/shared/constants';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { CreditTier, Plan } from '@/shared/types';
import { fillText, formatNumber, formatPercent, getInstallment, getPlanPrice } from '@/shared/utils';

interface PlanCardProps {
  plan: Plan;
  duration: PlanDuration;
  current: boolean; // the signed-in user already has this plan
  hasPlan: boolean; // the user has another plan: the button switches to this one
  student: boolean; // a verified student: plans with a student price show it
  creditTier?: CreditTier; // Ultimate: the chosen monthly credits
  onCreditTierChange?: (tier: CreditTier) => void;
  onSubscribe: (plan: Plan) => void;
}

// One plan on the pricing page: price for the chosen billing, what's included, and the button to get it.
// Enterprise has no listed price; its button goes to the sales form.
export const PlanCard = ({ plan, duration, current, hasPlan, student, creditTier, onCreditTierChange, onSubscribe }: PlanCardProps) => {
  const { text, locale, price: showPrice } = useLocale();
  const copy = text.pricing.plans[plan.id];
  const priced = plan.monthlyPrice !== null;
  const price = getPlanPrice(plan, duration, { student, creditTier });
  const installment = getInstallment(price.total, duration);
  const featureValues = {
    downloads: formatNumber(plan.downloadsPerMonth ?? 0, locale),
    credits: formatNumber(creditTier?.credits ?? plan.credits, locale),
    concurrent: formatNumber(plan.concurrentGenerations, locale),
  };

  return (
    <Card
      as="li"
      gap={vars.spacing[3]}
      padding={vars.sizes.planCard.padding}
      borderColor={plan.featured ? vars.colors.primary : vars.colors.border}
      background={plan.featured ? vars.colors.surfaceMuted : vars.colors.surface}
    >
      <Stack direction="row" wrap align="center" justify="space-between" gap={vars.spacing[2]}>
        <Text as="h2" variant="h4">
          {copy.name}
        </Text>
        {plan.featured && <Badge variant="info">{text.pricing.popular}</Badge>}
      </Stack>
      <Text variant="bodySm" color={vars.colors.textMuted}>
        {copy.description}
      </Text>

      {priced ? (
        <Stack direction="row" wrap align="baseline" gap={vars.spacing[2]}>
          <Text as="span" variant="h2">
            {showPrice(price.perMonth)}
          </Text>
          <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
            {plan.perMember ? text.pricing.perMemberMonth : text.pricing.perMonth}
          </Text>
        </Stack>
      ) : (
        <Text as="span" variant="h3">
          {text.pricing.priceOnRequest}
        </Text>
      )}

      {priced && (
        <Stack gap={vars.spacing[2]} align="flex-start">
          {duration > 1 && (
            <Text variant="bodySm">
              {fillText(plan.perMember ? text.pricing.totalPerMember : text.pricing.total, { price: showPrice(price.total) })}
            </Text>
          )}
          {price.discount > 0 && <Badge variant="free">{fillText(text.pricing.save, { percent: formatPercent(price.discount, locale) })}</Badge>}
          {student && plan.studentPrice && <Badge variant="highlight">{text.pricing.studentApplied}</Badge>}
          {installment !== null && (
            <Text variant="bodySm" color={vars.colors.textMuted}>
              {fillText(text.pricing.installments, { price: showPrice(installment) })}
            </Text>
          )}
        </Stack>
      )}
      {plan.minMembers > 1 && (
        <Text variant="bodySm" color={vars.colors.textMuted}>
          {fillText(text.pricing.minMembers, { count: formatNumber(plan.minMembers, locale) })}
        </Text>
      )}

      {plan.creditTiers.length > 0 && (
        <Select
          label={text.pricing.creditTierLabel}
          value={String(creditTier?.credits ?? plan.creditTiers[0].credits)}
          onChange={(value) => {
            const tier = plan.creditTiers.find((candidate) => String(candidate.credits) === value);
            if (tier) onCreditTierChange?.(tier);
          }}
          options={plan.creditTiers.map((tier) => ({
            value: String(tier.credits),
            label: [
              fillText(text.pricing.creditTierOption, { credits: formatNumber(tier.credits, locale) }),
              tier.extraMonthlyPrice > 0 ? fillText(text.pricing.creditTierExtra, { price: showPrice(tier.extraMonthlyPrice) }) : '',
            ]
              .filter(Boolean)
              .join(' '),
          }))}
        />
      )}

      <Stack as="ul" gap={vars.spacing[2]} grow>
        {copy.features.map((feature) => (
          <Stack key={feature} as="li" direction="row" align="flex-start" gap={vars.spacing[2]}>
            <Icon name="check" size={vars.sizes.icon.sm} color={vars.colors.primary} />
            <Text as="span" variant="bodySm">
              {fillText(feature, featureValues)}
            </Text>
          </Stack>
        ))}
      </Stack>

      {priced ? (
        <Button fullWidth variant={plan.featured ? 'primary' : 'secondary'} disabled={current} onClick={() => onSubscribe(plan)}>
          {current ? text.pricing.currentPlan : hasPlan ? text.pricing.switchPlan : text.pricing.subscribe}
        </Button>
      ) : (
        <Button fullWidth variant="outline" to={routes.contactSales}>
          {text.pricing.contactSales}
        </Button>
      )}
    </Card>
  );
};
