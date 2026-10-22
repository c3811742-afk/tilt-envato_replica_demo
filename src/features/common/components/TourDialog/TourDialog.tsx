import { useState } from 'react';
import type { IconName } from '@/shared/assets';
import { Button, FieldMessage, Icon, Modal, Stack, Text } from '@/shared/components';
import { tourSteps, type TourStep } from '@/shared/constants';
import { useLocale, useMessages, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { authApi, fillText, formatNumber, safeAsync } from '@/shared/utils';

const stepIcons: Record<TourStep, IconName> = {
  search: 'search',
  categories: 'grid',
  downloads: 'download',
  account: 'user',
};

// "A registered user gets a short tour on first login": a few steps, skippable, shown once.
export const TourDialog = () => {
  const { text, locale } = useLocale();
  const { requestError } = useMessages();
  const { setAccount } = useSession();
  const [index, setIndex] = useState(0);
  const [error, setError] = useState<unknown>(null);
  const step = tourSteps[index];
  const last = index === tourSteps.length - 1;

  // Skipping and finishing both end the tour for good.
  const finish = async () => {
    const result = await safeAsync(authApi.completeTour);
    setError(result.ok ? null : result.error);
    if (result.ok) setAccount(result.data);
  };

  return (
    <Modal
      open
      onClose={finish}
      title={text.tour.steps[step].title}
      actions={
        <>
          {index === 0 ? (
            <Button variant="outline" onClick={finish}>
              {text.common.skip}
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setIndex(index - 1)}>
              {text.common.back}
            </Button>
          )}
          <Button onClick={last ? finish : () => setIndex(index + 1)}>{last ? text.common.done : text.common.next}</Button>
        </>
      }
    >
      <Stack direction="row" align="flex-start" gap={vars.spacing[4]}>
        <Icon name={stepIcons[step]} size={vars.sizes.icon.xl} color={vars.colors.primary} />
        <Stack gap={vars.spacing[2]}>
          <Text>{text.tour.steps[step].text}</Text>
          <Text variant="bodySm" color={vars.colors.textMuted}>
            {fillText(text.tour.stepOf, { current: formatNumber(index + 1, locale), total: formatNumber(tourSteps.length, locale) })}
          </Text>
        </Stack>
      </Stack>
      <FieldMessage tone="error" message={error ? requestError(error) : undefined} />
    </Modal>
  );
};
