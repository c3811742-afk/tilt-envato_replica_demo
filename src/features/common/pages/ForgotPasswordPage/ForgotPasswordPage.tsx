import { EmailField, FormFooter, Stack } from '@/shared/components';
import { routes } from '@/shared/constants';
import { useAuthFlow, useForm, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { authApi, validateEmail } from '@/shared/utils';
import { AuthPage, AuthSwitch } from '@/features/common/components';
import type { ResetPasswordRouteState } from '../ResetPasswordPage';

export const ForgotPasswordPage = () => {
  const { text } = useLocale();
  const { goTo } = useAuthFlow();
  const form = useForm({ email: '' }, { email: validateEmail });

  const submit = form.submit(async ({ email }) => {
    await authApi.requestPasswordReset(email);
    const state: ResetPasswordRouteState = { email };
    goTo(routes.resetPassword, state);
  });

  return (
    <AuthPage title={text.auth.forgot.title} subtitle={text.auth.forgot.message}>
      <Stack as="form" gap={vars.spacing[4]} onSubmit={submit} noValidate>
        <EmailField autoFocus {...form.field('email')} />
        <FormFooter label={text.auth.forgot.submit} submitting={form.submitting} requestError={form.requestError} />
      </Stack>
      <AuthSwitch question={text.auth.haveAccount} linkLabel={text.common.signIn} to={routes.signIn} />
    </AuthPage>
  );
};
