import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { Button, EmptyState, FieldMessage, IconNote, Page, Stack, Text } from '@/shared/components';
import { accountPath, unsubscribeParam } from '@/shared/constants';
import { useLocale, useMessages } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { fillText, resourcesApi, safeAsync } from '@/shared/utils';

// The page a newsletter email's "Unsubscribe" link opens: confirm, and sign up again if it was a mistake.
export const UnsubscribePage = () => {
  const { text } = useLocale();
  const { requestError } = useMessages();
  const [params] = useSearchParams();
  const email = params.get(unsubscribeParam)?.trim() ?? '';
  const [subscribed, setSubscribed] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const change = async (subscribe: boolean) => {
    setBusy(true);
    const result = await safeAsync(() => (subscribe ? resourcesApi.subscribe(email) : resourcesApi.unsubscribe(email)));
    setBusy(false);
    setError(result.ok ? undefined : requestError(result.error));
    if (result.ok) setSubscribed(subscribe);
  };

  if (!email) {
    return (
      <Page>
        <EmptyState title={text.newsletter.unsubscribeTitle} message={text.newsletter.missingEmail} action={<Button to={accountPath('notifications')}>{text.nav.account}</Button>} />
      </Page>
    );
  }

  return (
    <Page title={text.newsletter.unsubscribeTitle} contentMaxWidth={vars.sizes.readable.maxWidth}>
      {subscribed ? (
        <Stack gap={vars.spacing[4]} align="flex-start">
          <Text>{fillText(text.newsletter.unsubscribeText, { email })}</Text>
          <Button disabled={busy} onClick={() => void change(false)}>
            {text.newsletter.unsubscribe}
          </Button>
        </Stack>
      ) : (
        <Stack gap={vars.spacing[4]} align="flex-start">
          <IconNote icon="check" text={fillText(text.newsletter.unsubscribed, { email })} />
          <Button variant="outline" disabled={busy} onClick={() => void change(true)}>
            {text.newsletter.resubscribe}
          </Button>
        </Stack>
      )}
      <FieldMessage tone="error" message={error} />
    </Page>
  );
};
