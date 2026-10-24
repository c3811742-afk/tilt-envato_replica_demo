import { useEffect, useState } from 'react';
import { Button, CodeField, FieldMessage, FormFooter, Stack, Text } from '@/shared/components';
import { auth } from '@/shared/constants';
import { useAuthFlow, useForm, useLocale, useMessages } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { authApi, fillText, formatNumber, safeAsync, validateCode, type SessionAccount } from '@/shared/utils';
import { AuthPage } from '../AuthPage';

const secondMs = 1000;

interface CodeVerificationProps {
  purpose: 'verifyEmail' | 'verifyPhone';
  title: string;
  message: string; // where the code was sent
  verify: (code: string) => Promise<SessionAccount>;
}

// Enter a one-time code sent by email or SMS, with "Resend code" after a short wait.
// Demo only: no email or SMS is sent, so the code is shown on the page.
export const CodeVerification = ({ purpose, title, message, verify }: CodeVerificationProps) => {
  const { text, locale } = useLocale();
  const { requestError } = useMessages();
  const { continueWith } = useAuthFlow();
  const [demoCode, setDemoCode] = useState(() => authApi.demoCode(purpose));
  // A code was just sent: wait before sending another. Without one, resending is allowed at once.
  const [resendIn, setResendIn] = useState<number>(demoCode ? auth.resendCooldownSeconds : 0);
  const [resendStatus, setResendStatus] = useState<{ sent: boolean; error: unknown }>({ sent: false, error: null });
  const form = useForm({ code: '' }, { code: validateCode });

  // Counts down until "Resend code" can be used again.
  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((seconds) => seconds - 1), secondMs);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const resend = async () => {
    const result = await safeAsync(() => authApi.resendCode(purpose));
    setResendStatus({ sent: result.ok, error: result.ok ? null : result.error });
    if (!result.ok) return;
    setDemoCode(authApi.demoCode(purpose));
    setResendIn(auth.resendCooldownSeconds);
  };

  const submit = form.submit(async ({ code }) => continueWith(await verify(code)));

  return (
    <AuthPage title={title} showBack={false}>
      <Text>{message}</Text>
      <Stack as="form" gap={vars.spacing[4]} onSubmit={submit} noValidate>
        {/* No email or SMS is sent in the demo: the code to type is shown as the placeholder. */}
        <CodeField label={text.auth.verify.codeLabel} placeholder={demoCode} autoFocus {...form.field('code')} />
        <FormFooter label={text.auth.verify.submit} submitting={form.submitting} requestError={form.requestError} />
      </Stack>
      <Stack align="center" gap={vars.spacing[2]}>
        <Button variant="muted" disabled={resendIn > 0} onClick={resend}>
          {resendIn > 0
            ? fillText(text.auth.verify.resendIn, { seconds: formatNumber(resendIn, locale) })
            : text.auth.verify.resend}
        </Button>
        <FieldMessage message={resendStatus.sent ? text.auth.verify.resent : undefined} />
        <FieldMessage tone="error" message={resendStatus.error ? requestError(resendStatus.error) : undefined} />
      </Stack>
    </AuthPage>
  );
};
