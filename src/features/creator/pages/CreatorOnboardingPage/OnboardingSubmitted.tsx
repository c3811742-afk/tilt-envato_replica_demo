import { Button, Card, IconNote, Stack, Stepper, Text } from '@/shared/components';
import { creatorApplicationStages, routes } from '@/shared/constants';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { CreatorApplicationReceipt } from '@/shared/types';
import { fillText, formatDate } from '@/shared/utils';
import { useApplicationProgress } from './useApplicationProgress';

interface OnboardingSubmittedProps {
  receipt: CreatorApplicationReceipt;
  onStartOver: () => void;
}

// After submitting: where the application is now, like tracking an order.
export const OnboardingSubmitted = ({ receipt, onStartOver }: OnboardingSubmittedProps) => {
  const { text, locale } = useLocale();
  const t = text.creatorOnboarding.submitted;
  const { current, stage, reachedAt, isFinal } = useApplicationProgress(receipt);

  const stages = creatorApplicationStages.map((name, index) => ({
    label: t.stages[name].label,
    description: t.stages[name].description,
    meta: index <= current ? formatDate(reachedAt[index], locale, { timeStyle: 'short' }) : undefined,
  }));

  return (
    <Stack gap={vars.spacing[6]}>
      <Card padding={vars.spacing[6]} gap={vars.spacing[6]}>
        <Stack direction="row" wrap justify="space-between" align="baseline" gap={vars.spacing[3]}>
          <Text as="h2" variant="h3">
            {t.statusLabel}
          </Text>
          <Text variant="label" color={vars.colors.textMuted}>
            {fillText(t.reference, {
              id: receipt.id,
              date: formatDate(receipt.submittedAt, locale),
            })}
          </Text>
        </Stack>
        {/* All stages show as done once the application is approved. */}
        <Stepper label={t.statusLabel} steps={stages} current={isFinal ? stages.length : current} />
        <div role="status">
          <IconNote icon={isFinal ? 'check' : 'clock'} title={`${t.currentStatus}: ${t.stages[stage].label}`} text={t.stages[stage].description} />
        </div>
      </Card>
      <Stack direction="row" wrap gap={vars.spacing[3]}>
        <Button to={routes.home}>{text.common.backToHome}</Button>
        <Button variant="outline" onClick={onStartOver}>
          {t.startOver}
        </Button>
      </Stack>
    </Stack>
  );
};
