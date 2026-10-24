import { Button, Stack } from '@/shared/components';
import { routes } from '@/shared/constants';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { CreatorApplicationReceipt } from '@/shared/types';
import { ApplicationStatusCard } from '@/features/creator/components';

interface OnboardingSubmittedProps {
  receipt: CreatorApplicationReceipt;
  onStartOver: () => void;
}

// After submitting: where the application is now, like tracking an order.
export const OnboardingSubmitted = ({ receipt, onStartOver }: OnboardingSubmittedProps) => {
  const { text } = useLocale();

  return (
    <Stack gap={vars.spacing[6]}>
      <ApplicationStatusCard receipt={receipt} />
      <Stack direction="row" wrap gap={vars.spacing[3]}>
        <Button to={routes.creatorDashboard}>{text.nav.creatorDashboard}</Button>
        <Button variant="outline" onClick={onStartOver}>
          {text.creatorOnboarding.submitted.startOver}
        </Button>
      </Stack>
    </Stack>
  );
};
