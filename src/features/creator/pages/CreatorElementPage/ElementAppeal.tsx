import { useState } from 'react';
import { Button, Card, Stack, Text, TextField } from '@/shared/components';
import { studioLimits } from '@/shared/constants';
import { useAction, useLocale, useMessages } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { StudioElement } from '@/shared/types';
import { canAppeal, fillText, formatDate, studioApi, validateMessage } from '@/shared/utils';

interface ElementAppealProps {
  element: StudioElement;
  onChange: (element: StudioElement) => void;
}

// "Appeal a copyright takedown": the creator explains why the claim is wrong; the team can put the element back.
// Shows the appeal once it is sent, and the team's note if it was not accepted.
export const ElementAppeal = ({ element, onChange }: ElementAppealProps) => {
  const { text, locale } = useLocale();
  const { fieldError } = useMessages();
  const { run, busy, error, setError } = useAction();
  const [message, setMessage] = useState('');
  const t = text.studio;
  const { appeal } = element;

  const send = async () => {
    const invalid = validateMessage(message);
    if (invalid) {
      setError(fieldError(invalid));
      return;
    }
    const result = await run(() => studioApi.appeal(element.id, message));
    if (result.ok) onChange(result.data);
  };

  if (appeal?.status === 'open') {
    return (
      <Card gap={vars.spacing[2]}>
        <Text as="h3" variant="h4">
          {t.appealTitle}
        </Text>
        <Text variant="bodySm" color={vars.colors.textMuted}>
          {fillText(t.appealSent, { date: formatDate(appeal.at, locale) })}
        </Text>
        <Text autoDirection>{appeal.message}</Text>
      </Card>
    );
  }

  if (appeal?.status === 'rejected' && element.status === 'unpublished') {
    return (
      <Card gap={vars.spacing[2]}>
        <Text as="h3" variant="h4">
          {t.appealRejectedTitle}
        </Text>
        {appeal.note && <Text autoDirection>{appeal.note}</Text>}
      </Card>
    );
  }

  if (!canAppeal(element)) return null;

  return (
    <Card gap={vars.spacing[3]}>
      <Stack gap={vars.spacing[1]}>
        <Text as="h3" variant="h4">
          {t.appealTitle}
        </Text>
        <Text variant="bodySm" color={vars.colors.textMuted}>
          {t.appealText}
        </Text>
      </Stack>
      <TextField
        label={t.appealLabel}
        hint={t.appealHint}
        value={message}
        onChange={setMessage}
        rows={4}
        maxLength={studioLimits.descriptionMaxLength}
        error={error}
      />
      <div>
        <Button disabled={busy} onClick={() => void send()}>
          {t.sendAppeal}
        </Button>
      </div>
    </Card>
  );
};
