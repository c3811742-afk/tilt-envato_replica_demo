import { useState } from 'react';
import { Button, Card, CodeField, EmailField, FieldMessage, IconNote, Stack, Text } from '@/shared/components';
import { auth } from '@/shared/constants';
import { useLocale, useMessages, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { User } from '@/shared/types';
import { authApi, billingApi, fillText, safeAsync, validateEmail } from '@/shared/utils';

// Students verify a university email with a code, then get the student price on the Individual plan.
export const StudentVerification = ({ user }: { user: User }) => {
  const { text } = useLocale();
  const { setAccount } = useSession();
  const { fieldError, requestError } = useMessages();
  const [email, setEmail] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  if (user.student) {
    return <IconNote icon="graduation" title={text.planPage.studentTitle} text={fillText(text.planPage.studentVerified, { email: user.student.email })} />;
  }

  const send = async () => {
    const invalid = validateEmail(email);
    if (invalid) {
      setError(fieldError(invalid));
      return;
    }
    setBusy(true);
    const result = await safeAsync(() => billingApi.requestStudentVerification(email));
    setBusy(false);
    setError(result.ok ? undefined : requestError(result.error));
    if (result.ok) setSentTo(email.trim().toLowerCase());
  };

  const verify = async () => {
    setBusy(true);
    const result = await safeAsync(() => billingApi.verifyStudent(code));
    setBusy(false);
    setError(result.ok ? undefined : requestError(result.error));
    if (result.ok) setAccount(result.data);
  };

  // The demo shows the code instead of emailing it.
  const demoCode = sentTo ? authApi.demoCode('verifyStudent', user.email) : undefined;

  return (
    <Card gap={vars.spacing[4]}>
      <Stack gap={vars.spacing[1]}>
        <Text as="h3" variant="h4">
          {text.planPage.studentTitle}
        </Text>
        <Text variant="bodySm" color={vars.colors.textMuted}>
          {text.planPage.studentText}
        </Text>
      </Stack>
      {sentTo ? (
        <Stack gap={vars.spacing[3]}>
          <Text variant="bodySm">{fillText(text.planPage.studentCodeSent, { email: sentTo })}</Text>
          <CodeField label={text.planPage.studentCode} placeholder={demoCode} length={auth.codeLength} value={code} onChange={setCode} />
          <FieldMessage tone="error" message={error} />
          <Button disabled={busy || code.length !== auth.codeLength} onClick={() => void verify()}>
            {text.planPage.studentVerify}
          </Button>
        </Stack>
      ) : (
        <Stack gap={vars.spacing[3]}>
          <EmailField label={text.planPage.studentEmail} value={email} onChange={setEmail} error={error} />
          <Button variant="outline" disabled={busy} onClick={() => void send()}>
            {text.planPage.studentSend}
          </Button>
        </Stack>
      )}
    </Card>
  );
};
