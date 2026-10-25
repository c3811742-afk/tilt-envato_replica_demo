import { useState } from 'react';
import { Checkbox, FieldMessage, Section } from '@/shared/components';
import { useAction, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { resourcesApi } from '@/shared/utils';

// "Unsubscribe from the newsletter" (or sign up) for the account's email address.
export const NewsletterSetting = ({ email }: { email: string }) => {
  const { text } = useLocale();
  const [subscribed, setSubscribed] = useState(() => resourcesApi.isSubscribed(email));
  const { run, busy, error } = useAction();

  const change = async (on: boolean) => {
    const result = await run(() => (on ? resourcesApi.subscribe(email) : resourcesApi.unsubscribe(email)));
    if (result.ok) setSubscribed(on);
  };

  return (
    <Section title={text.newsletter.accountTitle} subtitle={text.newsletter.text} variant="h3" gap={vars.spacing[3]}>
      <Checkbox label={text.newsletter.accountLabel} checked={subscribed} disabled={busy} onChange={(on) => void change(on)} />
      <FieldMessage tone="error" message={error} />
    </Section>
  );
};
