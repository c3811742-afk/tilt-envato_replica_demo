import { useSyncExternalStore, type ReactNode } from 'react';
import { Badge, Button, Chip, EmptyState, Page, Stack } from '@/shared/components';
import { routes, type StudioStatus } from '@/shared/constants';
import { useLocale, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { applicationsSnapshot, isApprovedCreator, subscribeToApplications } from '@/shared/utils';

const sections = [
  { key: 'dashboard', to: routes.creatorDashboard },
  { key: 'elements', to: routes.creatorElements },
  { key: 'upload', to: routes.creatorUpload },
  { key: 'earnings', to: routes.creatorEarnings },
  { key: 'analytics', to: routes.creatorAnalytics },
  { key: 'claims', to: routes.creatorClaims },
] as const;
export type CreatorSection = (typeof sections)[number]['key'];

interface CreatorAreaProps {
  section: CreatorSection;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

// The frame of every creator page: the creator sections as tabs, and only for approved creators
// (anyone else is pointed to their application).
export const CreatorArea = ({ section, title, subtitle, children }: CreatorAreaProps) => {
  const { text } = useLocale();
  const { session } = useSession();
  // Re-checks when an admin decides on the application, even in another tab.
  useSyncExternalStore(subscribeToApplications, applicationsSnapshot);
  if (session.status !== 'signedIn') return null; // only signed-in users reach creator pages

  if (!isApprovedCreator(session.user.id)) {
    return (
      <Page title={title}>
        <EmptyState
          title={text.studio.notCreatorTitle}
          message={text.studio.notCreatorText}
          action={<Button to={routes.creatorDashboard}>{text.studio.viewApplication}</Button>}
        />
      </Page>
    );
  }

  return (
    <Page title={title} subtitle={subtitle} gap={vars.spacing[6]}>
      <Stack as="nav" direction="row" wrap gap={vars.spacing[2]} ariaLabel={text.studio.navLabel}>
        {sections.map((item) => (
          <Chip key={item.key} to={item.to} selected={item.key === section}>
            {text.studio.sections[item.key]}
          </Chip>
        ))}
      </Stack>
      {children}
    </Page>
  );
};

const statusBadges: Record<StudioStatus, 'free' | 'info' | 'highlight' | 'neutral'> = {
  draft: 'neutral',
  pending: 'info',
  live: 'free',
  softRejected: 'highlight',
  hardRejected: 'neutral',
  unpublished: 'neutral',
  disabled: 'neutral',
};

export const StudioStatusBadge = ({ status }: { status: StudioStatus }) => {
  const { text } = useLocale();
  return <Badge variant={statusBadges[status]}>{text.studio.statuses[status]}</Badge>;
};
