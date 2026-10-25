import { useState } from 'react';
import { generatePath } from 'react-router';
import { dismissDownloadAlert, fetchDownloadAlerts } from '@/features/admin/api';
import { accountStatusTone, downloadAlertRule } from '@/features/admin/constants';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { DownloadAlert } from '@/features/admin/types';
import { StatusModal } from '@/features/admin/pages/UserPage';
import { AsyncContent, Badge, Button, EmptyState, Notice, type RecordColumn, recordRows, Stack, Table, Text, TextLink } from '@/shared/components';
import { routes } from '@/shared/constants';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { fillText, formatNumber, isolate } from '@/shared/utils';

// Accounts that downloaded far more than usual in the last day (possible sharing or scraping).
// The admin either marks it as fine or suspends the account.
export const DownloadAlertsTab = () => {
  const { text, locale } = useLocale();
  const { currentAdmin } = useAdminSession();
  const alerts = useAsync(fetchDownloadAlerts, []);
  const { run, busy: pending, error } = useAdminAction();
  const [suspending, setSuspending] = useState<DownloadAlert | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const t = text.admin.users;

  const without = (list: DownloadAlert[], id: string) => list.filter((alert) => alert.user.id !== id);

  const columns = (list: DownloadAlert[]): RecordColumn<DownloadAlert>[] => [
    {
      key: 'user',
      label: text.admin.columns.user,
      render: (alert) => (
        <Stack gap={vars.spacing[1]}>
          <TextLink to={generatePath(routes.adminUser, { userId: alert.user.id })} autoDirection>
            {alert.user.name}
          </TextLink>
          <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
            <bdi>{alert.user.email}</bdi>
          </Text>
        </Stack>
      ),
    },
    { key: 'count', label: t.lastDay, render: (alert) => formatNumber(alert.count, locale) },
    { key: 'usual', label: t.usualDay, render: (alert) => formatNumber(alert.usual, locale) },
    {
      key: 'status',
      label: text.admin.columns.status,
      render: (alert) => <Badge variant={accountStatusTone[alert.user.status]}>{t.statuses[alert.user.status]}</Badge>,
    },
    {
      key: 'actions',
      label: text.admin.columns.actions,
      align: 'end',
      render: (alert) => (
        <Stack direction="row" justify="flex-end" wrap gap={vars.spacing[2]}>
          <Button
            size="sm"
            variant="muted"
            disabled={pending}
            onClick={async () => {
              const result = await run(() => dismissDownloadAlert(currentAdmin.id, alert.user.id));
              if (!result.ok) return;
              alerts.update(without(list, alert.user.id));
              setNotice(fillText(t.alertDismissed, { name: isolate(alert.user.name) }));
            }}
          >
            {t.looksFine}
          </Button>
          {alert.user.status === 'active' && (
            <Button size="sm" variant="danger" onClick={() => setSuspending(alert)}>
              {t.suspend}
            </Button>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Stack>
      <Text color={vars.colors.textMuted}>
        {fillText(t.alertsDescription, {
          minimum: formatNumber(downloadAlertRule.minimum, locale),
          times: formatNumber(downloadAlertRule.timesUsual, locale),
        })}
      </Text>
      {notice && (
        <Notice tone="success" onDismiss={() => setNotice(null)}>
          {notice}
        </Notice>
      )}
      {error && <Notice tone="danger">{error}</Notice>}
      <AsyncContent state={alerts} empty={<EmptyState title={t.noAlertsTitle} message={t.noAlertsMessage} />}>
        {(list) => (
          <>
            <Table label={t.tabs.downloadAlerts} columns={columns(list)} rows={recordRows(list, (alert) => alert.user.id, columns(list))} stackOnMobile />
            {suspending && (
              <StatusModal
                user={suspending.user}
                action="suspend"
                onClose={() => setSuspending(null)}
                onSaved={(saved) => {
                  alerts.update(list.map((alert) => (alert.user.id === saved.id ? { ...alert, user: { ...alert.user, status: saved.status } } : alert)));
                  setSuspending(null);
                  setNotice(fillText(t.suspended, { name: isolate(saved.name) }));
                }}
              />
            )}
          </>
        )}
      </AsyncContent>
    </Stack>
  );
};
