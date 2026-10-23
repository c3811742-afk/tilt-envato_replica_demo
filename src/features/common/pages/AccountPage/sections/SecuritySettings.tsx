import { useState } from 'react';
import { BrandLogo, Button, Card, FieldMessage, PasswordField, Stack, Text } from '@/shared/components';
import { auth, socialProviders, type SocialProvider } from '@/shared/constants';
import { useForm, useLocale, useMessages, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { authApi, fillText, safeAsync, validatePassword, validatePasswordConfirmation, validateRequired } from '@/shared/utils';
import { SocialAuthDialog } from '@/features/common/components';
import { SettingsForm } from '../SettingsForm';
import { useSignedInUser } from '../useSignedInUser';

// "A subscriber can change password" and "link / unlink a social login".
export const SecuritySettings = () => (
  <Stack gap={vars.spacing[7]}>
    <PasswordSettings />
    <LinkedAccounts />
  </Stack>
);

const PasswordSettings = () => {
  const { text } = useLocale();
  const { setAccount } = useSession();
  const user = useSignedInUser();
  const [saved, setSaved] = useState(false);
  const form = useForm(
    { current: '', next: '', confirmation: '' },
    {
      current: (value) => (user.hasPassword ? validateRequired(value) : null),
      next: validatePassword,
      confirmation: (value, values) => validatePasswordConfirmation(values.next, value),
    },
  );

  const providers = user.linkedProviders.map((provider) => text.providers[provider]).join(', ');

  return (
    <SettingsForm
      title={text.account.password.title}
      intro={user.hasPassword ? undefined : fillText(text.account.password.noPassword, { providers })}
      submitLabel={user.hasPassword ? text.account.password.change : text.account.password.set}
      saved={saved}
      submitting={form.submitting}
      requestError={form.requestError}
      onSubmit={form.submit(async ({ current, next }) => {
        setAccount(await authApi.changePassword({ current, next }));
        setSaved(true);
      })}
    >
      {user.hasPassword && <PasswordField label={text.account.password.current} {...form.field('current')} />}
      <PasswordField
        label={text.auth.newPassword}
        autoComplete="new-password"
        hint={fillText(text.auth.passwordHint, { min: auth.passwordMinLength })}
        {...form.field('next')}
      />
      <PasswordField label={text.auth.confirmPassword} autoComplete="new-password" {...form.field('confirmation')} />
    </SettingsForm>
  );
};

const LinkedAccounts = () => {
  const { text } = useLocale();
  const { setAccount } = useSession();
  const { requestError } = useMessages();
  const user = useSignedInUser();
  const [linking, setLinking] = useState<SocialProvider | null>(null);
  const [unlinkError, setUnlinkError] = useState<unknown>(null);

  const unlink = async (provider: SocialProvider) => {
    const result = await safeAsync(() => authApi.unlinkProvider(provider));
    setUnlinkError(result.ok ? null : result.error);
    if (result.ok) setAccount(result.data);
  };

  return (
    <Stack gap={vars.spacing[4]}>
      <Stack gap={vars.spacing[1]}>
        <Text as="h3" variant="h3">
          {text.account.linked.title}
        </Text>
        <Text color={vars.colors.textMuted}>{text.account.linked.intro}</Text>
      </Stack>
      <FieldMessage tone="error" message={unlinkError ? requestError(unlinkError) : undefined} />
      <Stack as="ul" gap={vars.spacing[3]}>
        {socialProviders.map((provider) => {
          const linked = user.linkedProviders.includes(provider);
          return (
            <Card key={provider} as="li" padding={vars.spacing[4]}>
              <Stack direction="row" align="center" justify="space-between" gap={vars.spacing[3]} wrap>
                <Stack direction="row" align="center" gap={vars.spacing[3]}>
                  <BrandLogo name={provider} size={vars.sizes.icon.md} />
                  <Stack gap={vars.spacing[1]}>
                    <Text variant="title">{text.providers[provider]}</Text>
                    <Text variant="bodySm" color={vars.colors.textMuted}>
                      {linked ? text.account.linked.linked : text.account.linked.notLinked}
                    </Text>
                  </Stack>
                </Stack>
                {linked ? (
                  <Button variant="outline" size="sm" onClick={() => unlink(provider)}>
                    {text.account.linked.unlink}
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => setLinking(provider)}>
                    {text.account.linked.link}
                  </Button>
                )}
              </Stack>
            </Card>
          );
        })}
      </Stack>
      {linking && (
        <SocialAuthDialog
          provider={linking}
          askName={false}
          onContinue={async ({ email }) => {
            setAccount(await authApi.linkProvider(linking, email));
            setLinking(null);
          }}
          onClose={() => setLinking(null)}
        />
      )}
    </Stack>
  );
};
