import { Badge, Button, Card, Icon, Stack, Text } from '@/shared/components';
import type { PlanDuration } from '@/shared/constants';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { Plan } from '@/shared/types';
import { fillText, formatNumber, formatPercent, getInstallment, getPlanPrice } from '@/shared/utils';

interface PlanCardProps {
  plan: Plan;
  duration: PlanDuration;
  current: boolean; // the signed-in user already has this plan
  onSubscribe: (plan: Plan) => void;
}

export const PlanCard = ({ plan, duration, current, onSubscribe }: PlanCardProps) => {
  const { text, locale, price: showPrice } = useLocale();
  const copy = text.pricing.plans[plan.id];
  const price = getPlanPrice(plan, duration);
  const installment = getInstallment(price.total);

  return (
    <Card
      as="li"
      gap={vars.spacing[4]}
      borderColor={plan.featured ? vars.colors.primary : vars.colors.border}
      background={plan.featured ? vars.colors.surfaceMuted : vars.colors.surface}
    >
      <Stack direction="row" wrap align="center" justify="space-between" gap={vars.spacing[2]}>
        <Text as="h2" variant="h3">
          {copy.name}
        </Text>
        {plan.featured && <Badge variant="info">{text.pricing.popular}</Badge>}
      </Stack>
      <Text color={vars.colors.textMuted}>{copy.description}</Text>

      <Stack direction="row" wrap align="baseline" gap={vars.spacing[2]}>
        <Text as="span" variant="h1">
          {showPrice(price.perMonth)}
        </Text>
        <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
          {plan.perMember ? text.pricing.perMemberMonth : text.pricing.perMonth}
        </Text>
      </Stack>

      <Stack gap={vars.spacing[2]} align="flex-start">
        {duration > 1 && (
          <Text variant="bodySm">
            {fillText(plan.perMember ? text.pricing.totalPerMember : text.pricing.total, {
              price: showPrice(price.total),
            })}
          </Text>
        )}
        {price.discount > 0 && (
          <Badge variant="free">{fillText(text.pricing.save, { percent: formatPercent(price.discount, locale) })}</Badge>
        )}
        {installment !== null && (
          <Text variant="bodySm" color={vars.colors.textMuted}>
            {fillText(text.pricing.installments, { price: showPrice(installment) })}
          </Text>
        )}
        {plan.minMembers > 1 && (
          <Text variant="bodySm" color={vars.colors.textMuted}>
            {fillText(text.pricing.minMembers, { count: formatNumber(plan.minMembers, locale) })}
          </Text>
        )}
      </Stack>

      <Stack as="ul" gap={vars.spacing[2]} grow>
        {copy.features.map((feature) => (
          <Stack key={feature} as="li" direction="row" align="flex-start" gap={vars.spacing[2]}>
            <Icon name="check" size={vars.sizes.icon.sm} color={vars.colors.primary} />
            <Text as="span" variant="bodySm">
              {feature}
            </Text>
          </Stack>
        ))}
      </Stack>

      <Button fullWidth variant={plan.featured ? 'primary' : 'secondary'} disabled={current} onClick={() => onSubscribe(plan)}>
        {current ? text.pricing.currentPlan : text.pricing.subscribe}
      </Button>
    </Card>
  );
};
