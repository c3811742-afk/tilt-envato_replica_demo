import { useSyncExternalStore } from 'react';
import { AsyncContent, Button, Card, DetailList, EmptyState, Grid, Icon, Page, Stack, Text } from '@/shared/components';
import { routes } from '@/shared/constants';
import { useAsync, useLocale, useSession } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { categoryIds, type CategoryId } from '@/shared/types';
import {
  applicationsSnapshot,
  creatorApplicationDetails,
  creatorApplicationStatus,
  formatNumber,
  latestCreatorApplication,
  studioApi,
  subscribeToApplications,
} from '@/shared/utils';
import { ApplicationStatusCard, CreatorArea } from '@/features/creator/components';

const isCategory = (value: string): value is CategoryId => (categoryIds as readonly string[]).includes(value);

// "Creator dashboard": where a creator lands after signing in. It follows their latest application: none yet
// (start one), in review or not approved (its status), or approved (their elements, balance and profile).
export const CreatorDashboardPage = () => {
  const { text } = useLocale();
  const { session } = useSession();
  // Re-read when an admin decides, even in another tab.
  useSyncExternalStore(subscribeToApplications, applicationsSnapshot);
  if (session.status !== 'signedIn') return null; // only signed-in users reach this page
  const t = text.creatorDashboard;
  const receipt = latestCreatorApplication(session.user.id);

  if (!receipt) {
    return (
      <Page title={t.title}>
        <EmptyState title={t.noApplicationTitle} message={t.noApplicationText} action={<Button to={routes.creatorOnboarding}>{text.authors.startApplication}</Button>} />
      </Page>
    );
  }

  const { status } = creatorApplicationStatus(receipt.id);
  if (status === 'approved') return <ApprovedDashboard reference={receipt.id} />;

  return (
    <Page title={t.title} subtitle={t.reviewSubtitle} gap={vars.spacing[6]}>
      <ApplicationStatusCard receipt={receipt} />
      <Stack direction="row" wrap gap={vars.spacing[3]}>
        {status === 'rejected' && <Button to={routes.creatorOnboarding}>{t.applyAgain}</Button>}
        <Button variant="outline" to={routes.help}>
          {text.nav.help}
        </Button>
        <Button variant="outline" to={routes.support}>
          {text.nav.support}
        </Button>
      </Stack>
    </Page>
  );
};

// An approved creator: how many elements are live, in review or need changes, the balance, and their profile.
const ApprovedDashboard = ({ reference }: { reference: string }) => {
  const { text, locale, price } = useLocale();
  const t = text.creatorDashboard;
  const overview = useAsync(async () => ({ elements: await studioApi.myElements(), earnings: await studioApi.earnings() }), [], () => false);
  const details = creatorApplicationDetails(reference);

  return (
    <CreatorArea section="dashboard" title={t.title} subtitle={t.approvedSubtitle}>
      <AsyncContent state={overview}>
        {({ elements, earnings }) => {
          const count = (statuses: string[]) => formatNumber(elements.filter((element) => statuses.includes(element.status)).length, locale);
          const tiles = [
            { label: text.studio.summary.live, value: count(['live']), to: routes.creatorElements },
            { label: text.studio.summary.pending, value: count(['pending']), to: routes.creatorElements },
            { label: text.studio.summary.needsChanges, value: count(['softRejected']), to: routes.creatorElements },
            { label: text.studio.summary.available, value: price(earnings.balance.available), to: routes.creatorEarnings },
          ];
          return (
            <Grid minColumnWidth={vars.sizes.itemCard.minWidth.small} gap={vars.spacing[4]} ariaLabel={t.title}>
              {tiles.map((tile) => (
                <li key={tile.label}>
                  <Card to={tile.to} gap={vars.spacing[1]}>
                    <Text variant="label" color={vars.colors.textMuted}>
                      {tile.label}
                    </Text>
                    <Text variant="h2">{tile.value}</Text>
                  </Card>
                </li>
              ))}
            </Grid>
          );
        }}
      </AsyncContent>
      <div>
        <Button to={routes.creatorUpload}>
          <Icon name="upload" size={vars.sizes.icon.sm} />
          {text.studio.sections.upload}
        </Button>
      </div>
      {details && (
        <Card gap={vars.spacing[4]}>
          <Text as="h2" variant="h3">
            {t.profileTitle}
          </Text>
          <DetailList
            rows={[
              { label: t.name, value: details.name, autoDirection: true },
              { label: t.portfolio, value: details.portfolio },
              { label: t.specialties, value: details.categories.filter(isCategory).map((id) => text.categories[id].name).join(', ') },
              ...(details.about ? [{ label: t.about, value: details.about, autoDirection: true }] : []),
            ]}
          />
        </Card>
      )}
    </CreatorArea>
  );
};
