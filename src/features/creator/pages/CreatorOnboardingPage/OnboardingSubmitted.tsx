import { Button, Card, IconNote, Stack, Stepper, Text } from '@/shared/components';
import { creatorApplicationStages, routes } from '@/shared/constants';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { CreatorApplicationReceipt } from '@/shared/types';
import { fillText, formatDate } from '@/shared/utils';
import { useApplicationStatus } from './useApplicationStatus';

interface OnboardingSubmittedProps {
  receipt: CreatorApplicationReceipt;
  onStartOver: () => void;
}

// While the admin team hasn't decided, the application is in review; then it's approved (every stage done)
// or not approved, with the team's reason.
const inReviewStage = creatorApplicationStages.indexOf('inReview');

// After submitting: where the application is now, like tracking an order.
export const OnboardingSubmitted = ({ receipt, onStartOver }: OnboardingSubmittedProps) => {
  const { text, locale } = useLocale();
  const t = text.creatorOnboarding.submitted;
  const { status, reason, decidedAt } = useApplicationStatus(receipt);
  const approved = status === 'approved';
  const current = approved ? creatorApplicationStages.length : inReviewStage;

  const stages = creatorApplicationStages.map((name, index) => ({
    label: t.stages[name].label,
    description: t.stages[name].description,
    meta:
      index === 0
        ? formatDate(receipt.submittedAt, locale, { timeStyle: 'short' })
        : approved && decidedAt && index === creatorApplicationStages.length - 1
          ? formatDate(decidedAt, locale, { timeStyle: 'short' })
          : undefined,
  }));
  const reasons: Record<string, string> = text.admin.creators.applicationReasons;
  const note =
    status === 'rejected'
      ? { icon: 'close' as const, title: t.rejected.label, text: fillText(t.rejected.description, { reason: reasons[reason ?? 'other'] ?? reasons.other }) }
      : approved
        ? { icon: 'check' as const, title: `${t.currentStatus}: ${t.stages.approved.label}`, text: t.stages.approved.description }
        : { icon: 'clock' as const, title: `${t.currentStatus}: ${t.stages.inReview.label}`, text: t.stages.inReview.description };

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
        <Stepper label={t.statusLabel} steps={stages} current={current} />
        <div role="status">
          <IconNote icon={note.icon} title={note.title} text={note.text} />
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
