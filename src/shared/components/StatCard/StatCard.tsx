import { vars } from '@/shared/theme';
import { withDefaults } from '@/shared/utils';
import { Card } from '../Card';
import { Stack } from '../Stack';
import { Text } from '../Text';
import { statCardDefaults } from './StatCard.defaults';
import type { StatCardProps } from './StatCard.types';

// One key number with its name and a short line of context. Text only, so it never relies on color.
// Built on Card: with `to`, the whole card is a link and lifts on hover like every other card.
export const StatCard = (props: StatCardProps) => {
  const { label, value, detail, to, minHeight } = withDefaults(statCardDefaults, props);

  return (
    <Card to={to} minHeight={minHeight}>
      <Stack grow justify="space-between" gap={vars.spacing[3]}>
        <Text as="span" variant="label" color={vars.colors.textMuted}>
          {label}
        </Text>
        <Text as="span" variant="h2">
          {value}
        </Text>
        {detail && (
          <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
            {detail}
          </Text>
        )}
      </Stack>
    </Card>
  );
};
