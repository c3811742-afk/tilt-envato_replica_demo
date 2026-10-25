import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { Button, EmptyState, FieldMessage, IconNote, Page, Stack, Text } from '@/shared/components';
import { accountPath, unsubscribeParam } from '@/shared/constants';
import { useAction, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { fillText, resourcesApi } from '@/shared/utils';

// The page a newsletter email's "Unsubscribe" link opens: confirm, and sign up again if it was a mistake.
export const UnsubscribePage = () => {
  const { text } = useLocale();
  const [params] = useSearchParams();
  const email = params.get(unsubscribeParam)?.trim() ?? '';
  const [subscribed, setSubscribed] = useState(true);
  const { run, busy, error } = useAction();

  const change = async (subscribe: boolean) => {
    const result = await run(() => (subscribe ? resourcesApi.subscribe(email) : resourcesApi.unsubscribe(email)));
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
