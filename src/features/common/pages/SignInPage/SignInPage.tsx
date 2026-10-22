import { Divider, EmailField, FormFooter, IconNote, PasswordField, Stack, TextLink } from '@/shared/components';
import { routes, withReturnTo } from '@/shared/constants';
import { useAuthFlow, useForm, useLocale, useRouteState } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { authApi, validateEmail, validateRequired } from '@/shared/utils';
import { AuthPage, AuthSwitch, SocialSignIn } from '@/features/common/components';

export interface SignInRouteState {
  passwordChanged: boolean; // coming from "Reset password"
  email: string; // fills in the email field
  accountDeleted: boolean; // coming from "Delete account"
}

export const SignInPage = () => {
  const { text } = useLocale();
  const { continueWith, returnTo } = useAuthFlow();
  const { passwordChanged, accountDeleted, email = '' } = useRouteState<SignInRouteState>();
  const form = useForm({ email, password: '' }, { email: validateEmail, password: validateRequired });

  const submit = form.submit(async (values) => continueWith(await authApi.signIn(values)));

  return (
    <AuthPage title={text.auth.signInTitle} subtitle={text.auth.signInSubtitle}>
      {passwordChanged && <IconNote icon="check" text={text.auth.reset.done} />}
      {accountDeleted && <IconNote icon="check" text={text.account.deleteAccount.done} />}
      <SocialSignIn intent="signIn" />
      <Divider label={text.auth.orEmail} />
      <Stack as="form" gap={vars.spacing[4]} onSubmit={submit} noValidate>
        <EmailField {...form.field('email')} />
        <PasswordField label={text.auth.password} {...form.field('password')} />
        <TextLink to={withReturnTo(routes.forgotPassword, returnTo)} variant="bodySm">
          {text.auth.forgotPassword}
        </TextLink>
        <FormFooter label={text.common.signIn} submitting={form.submitting} requestError={form.requestError} />
      </Stack>
      <AuthSwitch question={text.auth.noAccount} linkLabel={text.common.signUp} to={routes.signUp} />
    </AuthPage>
  );
};
