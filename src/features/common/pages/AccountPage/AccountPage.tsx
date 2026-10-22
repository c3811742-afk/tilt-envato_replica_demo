import type { ComponentType } from 'react';
import { Navigate, useParams } from 'react-router';
import { Chip, Page, Stack } from '@/shared/components';
import { accountPath, accountSections, type AccountSection } from '@/shared/constants';
import { useLocale, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { BillingSettings } from './sections/BillingSettings';
import { DeleteAccountSettings } from './sections/DeleteAccountSettings';
import { LicensingSettings } from './sections/LicensingSettings';
import { NotificationSettings } from './sections/NotificationSettings';
import { ProfileSettings } from './sections/ProfileSettings';
import { SecuritySettings } from './sections/SecuritySettings';

const isSection = (value: unknown): value is AccountSection =>
  typeof value === 'string' && (accountSections as readonly string[]).includes(value);

const sectionPages: Record<AccountSection, ComponentType> = {
  profile: ProfileSettings,
  security: SecuritySettings,
  notifications: NotificationSettings,
  licensing: LicensingSettings,
  billing: BillingSettings,
  deleteAccount: DeleteAccountSettings,
};

// Account settings: one page per section, switched with the tabs at the top.
export const AccountPage = () => {
  const { text } = useLocale();
  const { session } = useSession();
  const { section } = useParams();

  if (!isSection(section)) return <Navigate to={accountPath(accountSections[0])} replace />;
  if (session.status !== 'signedIn') return null; // the onboarding gate only shows this page to signed-in users
  const SectionPage = sectionPages[section];

  return (
    <Page title={text.account.title} gap={vars.spacing[6]}>
      <Stack as="nav" direction="row" wrap gap={vars.spacing[2]} ariaLabel={text.account.title}>
        {accountSections.map((key) => (
          <Chip key={key} to={accountPath(key)} selected={key === section}>
            {text.account.sections[key]}
          </Chip>
        ))}
      </Stack>
      <SectionPage key={section} />
    </Page>
  );
};
