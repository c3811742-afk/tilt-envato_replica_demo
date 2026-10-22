import { Card, Grid, Text } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { formatNumber } from '@/shared/utils';

// The three steps from choosing a plan to using an item (home page and "How it works" page).
export const HowItWorksSteps = () => {
  const { text, locale } = useLocale();

  return (
    <Grid as="ol" stretch>
      {text.howItWorks.steps.map((step, index) => (
        <Card key={step.title} as="li" gap={vars.spacing[2]}>
          <Text as="span" variant="display" color={vars.colors.primary}>
            {formatNumber(index + 1, locale)}
          </Text>
          <Text as="h3" variant="h3">
            {step.title}
          </Text>
          <Text color={vars.colors.textMuted}>{step.text}</Text>
        </Card>
      ))}
    </Grid>
  );
};
