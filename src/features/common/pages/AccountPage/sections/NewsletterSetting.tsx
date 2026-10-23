import { useState } from 'react';
import { Checkbox, FieldMessage, Section } from '@/shared/components';
import { useLocale, useMessages } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { resourcesApi, safeAsync } from '@/shared/utils';

// "Unsubscribe from the newsletter" (or sign up) for the account's email address.
export const NewsletterSetting = ({ email }: { email: string }) => {
  const { text } = useLocale();
  const { requestError } = useMessages();
  const [subscribed, setSubscribed] = useState(() => resourcesApi.isSubscribed(email));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const change = async (on: boolean) => {
    setBusy(true);
    const result = await safeAsync(() => (on ? resourcesApi.subscribe(email) : resourcesApi.unsubscribe(email)));
    setBusy(false);
    setError(result.ok ? undefined : requestError(result.error));
    if (result.ok) setSubscribed(on);
  };

  return (
    <Section title={text.newsletter.accountTitle} subtitle={text.newsletter.text} variant="h3" gap={vars.spacing[3]}>
      <Checkbox label={text.newsletter.accountLabel} checked={subscribed} disabled={busy} onChange={(on) => void change(on)} />
      <FieldMessage tone="error" message={error} />
    </Section>
  );
};
