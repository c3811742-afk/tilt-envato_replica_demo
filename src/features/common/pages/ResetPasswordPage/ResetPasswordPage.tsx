import { Navigate } from 'react-router';
import { CodeField, FormFooter, PasswordField, Stack, Text } from '@/shared/components';
import { auth, routes, withReturnTo } from '@/shared/constants';
import { useAuthFlow, useForm, useLocale, useRouteState } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import {
  authApi,
  fillText,
  validateCode,
  validatePassword,
  validatePasswordConfirmation,
} from '@/shared/utils';
import { AuthPage, AuthSwitch, DemoCodeNote } from '@/features/common/components';
import type { SignInRouteState } from '../SignInPage';

export interface ResetPasswordRouteState {
  email: string; // the account the code was sent for
}

export const ResetPasswordPage = () => {
  const { text } = useLocale();
  const { goTo, returnTo } = useAuthFlow();
  const { email } = useRouteState<ResetPasswordRouteState>();
  const form = useForm(
    { code: '', password: '', confirmation: '' },
    {
      code: validateCode,
      password: validatePassword,
      confirmation: (confirmation, values) => validatePasswordConfirmation(values.password, confirmation),
    },
  );

  // The email comes from "Forgot password". Without it (e.g. after a reload), start that step again.
  if (!email) return <Navigate to={withReturnTo(routes.forgotPassword, returnTo)} replace />;

  const submit = form.submit(async ({ code, password }) => {
    await authApi.resetPassword({ email, code, password });
    const state: Partial<SignInRouteState> = { passwordChanged: true, email };
    goTo(routes.signIn, state);
  });

  return (
    <AuthPage title={text.auth.reset.title}>
      <Text>{fillText(text.auth.reset.message, { email })}</Text>
      <DemoCodeNote code={authApi.demoCode('resetPassword', email)} />
      <Stack as="form" gap={vars.spacing[4]} onSubmit={submit} noValidate>
        <CodeField label={text.auth.reset.codeLabel} autoFocus {...form.field('code')} />
        <PasswordField
          label={text.auth.newPassword}
          autoComplete="new-password"
          hint={fillText(text.auth.passwordHint, { min: auth.passwordMinLength })}
          {...form.field('password')}
        />
        <PasswordField label={text.auth.confirmPassword} autoComplete="new-password" {...form.field('confirmation')} />
        <FormFooter label={text.auth.reset.submit} submitting={form.submitting} requestError={form.requestError} />
      </Stack>
      <AuthSwitch question={text.auth.haveAccount} linkLabel={text.common.signIn} to={routes.signIn} />
    </AuthPage>
  );
};
