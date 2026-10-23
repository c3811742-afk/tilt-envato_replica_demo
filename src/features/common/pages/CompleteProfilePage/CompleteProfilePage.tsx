import { useAuthFlow, useLocale, useSession } from '@/shared/hooks';
import { authApi } from '@/shared/utils';
import { AuthPage, ProfileForm } from '@/features/common/components';

// "Gather user information": asked once, right after sign-up and email verification.
export const CompleteProfilePage = () => {
  const { text } = useLocale();
  const { session } = useSession();
  const { continueWith } = useAuthFlow();
  if (session.status !== 'signedIn') return null; // the onboarding gate only shows this page to signed-in users

  return (
    <AuthPage title={text.profile.title} subtitle={text.profile.subtitle}>
      <ProfileForm
        user={session.user}
        submitLabel={text.common.continue}
        showChannels
        onSubmit={async (profile, notifications) => continueWith(await authApi.saveProfile(profile, notifications))}
      />
    </AuthPage>
  );
};
