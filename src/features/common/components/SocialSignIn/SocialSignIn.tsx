import { useState } from 'react';
import { BrandLogo, Button, Stack } from '@/shared/components';
import { socialProviders, type SocialProvider } from '@/shared/constants';
import { useAuthFlow, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { authApi, fillText } from '@/shared/utils';
import { SocialAuthDialog } from './SocialAuthDialog';

interface SocialSignInProps {
  intent: 'signUp' | 'signIn';
  canContinue?: () => boolean; // e.g. sign-up checks that the terms are accepted first
}

// "Continue with Google / Apple / Facebook" buttons (simulated in the demo).
export const SocialSignIn = ({ intent, canContinue = () => true }: SocialSignInProps) => {
  const { text, locale } = useLocale();
  const { continueWith } = useAuthFlow();
  const [provider, setProvider] = useState<SocialProvider | null>(null);

  return (
    <Stack gap={vars.spacing[3]}>
      {socialProviders.map((option) => (
        <Button key={option} variant="outline" fullWidth onClick={() => canContinue() && setProvider(option)}>
          <BrandLogo name={option} />
          {fillText(text.auth.continueWith, { provider: text.providers[option] })}
        </Button>
      ))}
      {provider && (
        <SocialAuthDialog
          provider={provider}
          askName={intent === 'signUp'}
          onContinue={async ({ name, email }) =>
            continueWith(await authApi.continueWith({ provider, name, email, intent, language: locale }))
          }
          onClose={() => setProvider(null)}
        />
      )}
    </Stack>
  );
};
