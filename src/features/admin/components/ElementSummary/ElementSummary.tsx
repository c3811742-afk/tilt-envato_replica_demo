import { Stack, Text, TextLink } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';

import type { ElementSummaryProps } from './ElementSummary.types';
import { fillText, isolate } from '@/shared/utils';

// An element's title (optionally a link) with its creator underneath. Used in admin tables.
export const ElementSummary = ({ title, creatorName, to }: ElementSummaryProps) => {
  const { text } = useLocale();

  return (
    <Stack gap={vars.spacing[1]}>
      {to ? (
        <TextLink to={to} autoDirection>
          {title}
        </TextLink>
      ) : (
        <Text as="span" autoDirection>
          {title}
        </Text>
      )}
      <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
        {fillText(text.admin.review.byCreator, { name: isolate(creatorName) })}
      </Text>
    </Stack>
  );
};
