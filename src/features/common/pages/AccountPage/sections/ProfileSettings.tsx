import { useState } from 'react';
import { useNavigate } from 'react-router';
import { IconNote, Section } from '@/shared/components';
import { accountPath, routes, withReturnTo } from '@/shared/constants';
import { useLocale, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { authApi } from '@/shared/utils';
import { ProfileForm } from '@/features/common/components';
import { useSignedInUser } from '../useSignedInUser';

// "A subscriber can edit their profile". A new phone number is verified before it's used.
export const ProfileSettings = () => {
  const { text } = useLocale();
  const { setAccount } = useSession();
  const navigate = useNavigate();
  const user = useSignedInUser();
  const [saved, setSaved] = useState(false);

  return (
    <Section title={text.account.sections.profile} variant="h3" gap={vars.spacing[4]}>
      {saved && <IconNote icon="check" text={text.common.saved} />}
      <ProfileForm
        user={user}
        submitLabel={text.common.saveChanges}
        showChannels={false}
        onSubmit={async (profile) => {
          const account = await authApi.saveProfile(profile);
          setAccount(account);
          if (!account.user.phoneVerified) navigate(withReturnTo(routes.verifyPhone, accountPath('profile')));
          else setSaved(true);
        }}
      />
    </Section>
  );
};
