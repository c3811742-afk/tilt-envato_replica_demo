import { Checkbox, Divider, EmailField, FormFooter, PasswordField, Stack, TextLink } from '@/shared/components';
import { auth, routes } from '@/shared/constants';
import { useAuthFlow, useForm, useLocale, useMessages } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { authApi, fillText, validateEmail, validatePassword } from '@/shared/utils';
import { AuthPage, AuthSwitch, SocialSignIn } from '@/features/common/components';

export const SignUpPage = () => {
  const { text, locale } = useLocale();
  const { fieldError } = useMessages();
  const { continueWith } = useAuthFlow();
  const form = useForm(
    { email: '', password: '', acceptedTerms: false },
    { email: validateEmail, password: validatePassword, acceptedTerms: (accepted) => (accepted ? null : 'termsRequired') },
  );

  const submit = form.submit(async ({ email, password }) => {
    continueWith(await authApi.signUp({ email, password, language: locale }));
  });

  return (
    <AuthPage title={text.auth.signUpTitle} subtitle={text.auth.signUpSubtitle}>
      {/* Signing up with a provider also needs the terms accepted first. */}
      <SocialSignIn intent="signUp" canContinue={() => form.check('acceptedTerms')} />
      <Divider label={text.auth.orEmail} />
      <Stack as="form" gap={vars.spacing[4]} onSubmit={submit} noValidate>
        <EmailField {...form.field('email')} />
        <PasswordField
          label={text.auth.password}
          autoComplete="new-password"
          hint={fillText(text.auth.passwordHint, { min: auth.passwordMinLength })}
          {...form.field('password')}
        />
        <Checkbox
          checked={form.values.acceptedTerms}
          onChange={(checked) => form.setValue('acceptedTerms', checked)}
          error={fieldError(form.errors.acceptedTerms)}
          label={
            <>
              {text.auth.acceptTerms}{' '}
              <TextLink to={routes.terms} variant="bodySm" newTab>
                {text.auth.termsLink}
              </TextLink>{' '}
              {text.auth.acceptAnd}{' '}
              <TextLink to={routes.privacy} variant="bodySm" newTab>
                {text.auth.privacyLink}
              </TextLink>
            </>
          }
        />
        <FormFooter label={text.common.signUp} submitting={form.submitting} requestError={form.requestError} />
      </Stack>
      <AuthSwitch question={text.auth.haveAccount} linkLabel={text.common.signIn} to={routes.signIn} />
    </AuthPage>
  );
};
