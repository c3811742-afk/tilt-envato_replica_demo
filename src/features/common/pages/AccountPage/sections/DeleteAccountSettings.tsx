import { useNavigate } from 'react-router';
import { Button, EmailField, FieldMessage, Section, Stack, Text } from '@/shared/components';
import { routes } from '@/shared/constants';
import { useForm, useLocale, useMessages, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { authApi, validateEmail } from '@/shared/utils';
import type { SignInRouteState } from '../../SignInPage';

// "A registered user can delete their account": confirmed by typing the account's email.
export const DeleteAccountSettings = () => {
  const { text } = useLocale();
  const { requestError } = useMessages();
  const { signOut } = useSession();
  const navigate = useNavigate();
  const form = useForm({ email: '' }, { email: validateEmail });

  const submit = form.submit(async ({ email }) => {
    await authApi.deleteAccount(email);
    await signOut();
    const state: Partial<SignInRouteState> = { accountDeleted: true };
    navigate(routes.signIn, { state });
  });

  return (
    <Section title={text.account.sections.deleteAccount} variant="h3" gap={vars.spacing[4]}>
      <Text color={vars.colors.textMuted}>{text.account.deleteAccount.intro}</Text>
      <Stack as="form" gap={vars.spacing[4]} onSubmit={submit} noValidate>
        <EmailField label={text.account.deleteAccount.confirmLabel} autoComplete="off" {...form.field('email')} />
        <FieldMessage tone="error" message={form.requestError ? requestError(form.requestError) : undefined} />
        <div>
          <Button type="submit" variant="danger" disabled={form.submitting}>
            {form.submitting ? text.common.processing : text.account.deleteAccount.button}
          </Button>
        </div>
      </Stack>
    </Section>
  );
};
