import { useState, type FormEvent } from 'react';
import { Button, EmailField, IconNote, Stack, Text } from '@/shared/components';
import { useLocale, useMessages, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { resourcesApi, safeAsync, validateEmail } from '@/shared/utils';

// "Sign up for the newsletter" in the footer. A signed-in user's email is filled in.
export const NewsletterForm = () => {
  const { text } = useLocale();
  const { session } = useSession();
  const { fieldError, requestError } = useMessages();
  const [email, setEmail] = useState(session.status === 'signedIn' ? session.user.email : '');
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const invalid = validateEmail(email);
    if (invalid) {
      setError(fieldError(invalid));
      return;
    }
    setBusy(true);
    const result = await safeAsync(() => resourcesApi.subscribe(email));
    setBusy(false);
    setError(result.ok ? undefined : requestError(result.error));
    setDone(result.ok);
  };

  return (
    <Stack gap={vars.spacing[3]}>
      <Text as="h2" variant="label" color={vars.colors.textInverse}>
        {text.newsletter.title}
      </Text>
      <Text variant="bodySm" color={vars.colors.textInverse}>
        {text.newsletter.text}
      </Text>
      {done ? (
        <IconNote icon="check" text={text.newsletter.done} />
      ) : (
        <Stack as="form" gap={vars.spacing[2]} onSubmit={submit} noValidate>
          <EmailField label={text.newsletter.email} value={email} onChange={setEmail} error={error} autoComplete="email" />
          <div>
            <Button type="submit" variant="highlight" size="sm" disabled={busy}>
              {text.newsletter.submit}
            </Button>
          </div>
        </Stack>
      )}
    </Stack>
  );
};
