
import { licenseStatusTone, subscriptionStatusTone } from '@/features/admin/constants';
import type { Subscription, UserDownload, UserLicense } from '@/features/admin/types';
import { fillText } from '@/features/admin/utils';
import { Badge, EmptyState, type RecordColumn, recordRows, Stack, Table, Text } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { formatDate, formatNumber } from '@/shared/utils';

const dateTime: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' };
const downloadsShown = 50; // the newest ones; heavy accounts have hundreds

export const SubscriptionsTable = ({ subscriptions }: { subscriptions: Subscription[] }) => {
  const { text, locale } = useLocale();
  const t = text.admin.users;
  const b = text.admin.billing;

  if (subscriptions.length === 0) return <EmptyState title={t.noSubscriptionsTitle} message={t.noSubscriptionsMessage} />;

  const columns: RecordColumn<Subscription>[] = [
    { key: 'plan', label: text.admin.columns.plan, render: (subscription) => subscription.planName },
    { key: 'period', label: t.period, render: (subscription) => b.periods[subscription.period] },
    {
      key: 'status',
      label: text.admin.columns.status,
      render: (subscription) => (
        <Badge variant={subscriptionStatusTone[subscription.status]}>{b.subscriptionStatuses[subscription.status]}</Badge>
      ),
    },
    { key: 'started', label: text.admin.columns.started, render: (subscription) => formatDate(subscription.startedAt, locale) },
    { key: 'renewal', label: text.admin.columns.renewal, render: (subscription) => formatDate(subscription.renewsAt, locale) },
  ];

  return <Table label={t.detailTabs.subscriptions} columns={columns} rows={recordRows(subscriptions, (subscription) => subscription.id, columns)} stackOnMobile />;
};

export const DownloadsTable = ({ downloads }: { downloads: UserDownload[] }) => {
  const { text, locale } = useLocale();
  const t = text.admin.users;

  if (downloads.length === 0) return <EmptyState title={t.noDownloadsTitle} message={t.noDownloadsMessage} />;

  const columns: RecordColumn<UserDownload>[] = [
    {
      key: 'item',
      label: text.admin.columns.item,
      render: (download) => (
        <Text as="span" autoDirection>
          {download.itemTitle}
        </Text>
      ),
    },
    { key: 'license', label: t.licenseCode, render: (download) => <bdi>{download.licenseCode}</bdi> },
    { key: 'date', label: text.admin.columns.date, render: (download) => formatDate(download.at, locale, dateTime) },
  ];

  return (
    <Stack>
      <Text color={vars.colors.textMuted}>
        {fillText(downloads.length > downloadsShown ? t.downloadsCountNewest : t.downloadsCount, {
          count: formatNumber(downloads.length, locale),
          shown: formatNumber(downloadsShown, locale),
        })}
      </Text>
      <Table
        label={t.detailTabs.downloads}
        columns={columns} rows={recordRows(downloads.slice(0, downloadsShown), (download) => download.id, columns)} stackOnMobile
       
       
      />
    </Stack>
  );
};

export const LicensesTable = ({ licenses }: { licenses: UserLicense[] }) => {
  const { text, locale } = useLocale();
  const t = text.admin.users;

  if (licenses.length === 0) return <EmptyState title={t.noLicensesTitle} message={t.noLicensesMessage} />;

  const columns: RecordColumn<UserLicense>[] = [
    { key: 'code', label: text.admin.columns.code, render: (license) => <bdi>{license.code}</bdi> },
    {
      key: 'item',
      label: text.admin.columns.item,
      render: (license) => (
        <Stack gap={vars.spacing[1]}>
          <Text as="span" autoDirection>
            {license.itemTitle}
          </Text>
          <Text as="span" variant="bodySm" color={vars.colors.textMuted} autoDirection>
            {license.project}
          </Text>
        </Stack>
      ),
    },
    { key: 'issued', label: text.admin.columns.issued, render: (license) => formatDate(license.issuedAt, locale) },
    {
      key: 'status',
      label: text.admin.columns.status,
      render: (license) => <Badge variant={licenseStatusTone[license.status]}>{text.admin.licenses.statuses[license.status]}</Badge>,
    },
  ];

  return <Table label={t.detailTabs.licenses} columns={columns} rows={recordRows(licenses, (license) => license.code, columns)} stackOnMobile />;
};
