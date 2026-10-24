import { useState } from 'react';
import { fetchSubscriptions } from '@/features/admin/api';
import { Notice } from '@/features/admin/components';
import { subscriptionStatusTone } from '@/features/admin/constants';
import type { Subscription } from '@/features/admin/types';
import { fillText, isolate, replaceById } from '@/features/admin/utils';
import {
  AsyncContent,
  Badge,
  Button,
  EmptyState,
  type RecordColumn,
  recordRows,
  Stack,
  Table,
  Text,
} from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { formatDate } from '@/shared/utils';
import { CancelSubscriptionModal } from './CancelSubscriptionModal';

export const SubscriptionsTab = () => {
  const { text, locale } = useLocale();
  const subscriptions = useAsync(fetchSubscriptions, []);
  const [canceling, setCanceling] = useState<Subscription | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const t = text.admin.billing;

  // "Renews on" for active ones, "Ends on" for ones that won't renew, "Ended on" for canceled ones.
  const renewal = (row: Subscription) =>
    fillText(t.renewal[row.status], { date: formatDate(row.renewsAt, locale) });

  const columns: RecordColumn<Subscription>[] = [
    {
      key: 'customer',
      label: text.admin.columns.customer,
      render: (row) => (
        <Stack gap={vars.spacing[1]}>
          <Text as="span" autoDirection>
            {row.customer.name}
          </Text>
          <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
            <bdi>{row.customer.email}</bdi>
          </Text>
        </Stack>
      ),
    },
    {
      key: 'plan',
      label: text.admin.columns.plan,
      render: (row) => (
        <Stack gap={vars.spacing[1]}>
          <Text as="span">{row.planName}</Text>
          <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
            {t.periods[row.period]}
          </Text>
        </Stack>
      ),
    },
    { key: 'started', label: text.admin.columns.started, render: (row) => formatDate(row.startedAt, locale) },
    { key: 'renewal', label: text.admin.columns.renewal, render: renewal },
    {
      key: 'status',
      label: text.admin.columns.status,
      render: (row) => <Badge variant={subscriptionStatusTone[row.status]}>{t.subscriptionStatuses[row.status]}</Badge>,
    },
    {
      key: 'actions',
      label: text.admin.columns.actions,
      align: 'end',
      render: (row) =>
        row.status !== 'canceled' && (
          <Button size="sm" variant="muted" onClick={() => setCanceling(row)}>
            {t.cancel.button}
          </Button>
        ),
    },
  ];

  return (
    <Stack>
      {notice && (
        <Notice tone="success" onDismiss={() => setNotice(null)}>
          {notice}
        </Notice>
      )}
      <AsyncContent
        state={subscriptions}
        empty={<EmptyState title={t.subscriptionsEmptyTitle} message={t.subscriptionsEmptyMessage} />}
      >
        {(list) => (
          <>
            <Table label={t.tabs.subscriptions} columns={columns} rows={recordRows(list, (row) => row.id, columns)} stackOnMobile />
            {canceling && (
              <CancelSubscriptionModal
                subscription={canceling}
                onClose={() => setCanceling(null)}
                onCanceled={(saved) => {
                  subscriptions.update(replaceById(list, saved));
                  setCanceling(null);
                  const message = saved.status === 'canceled' ? t.cancel.doneNow : t.cancel.doneAtEnd;
                  setNotice(
                    fillText(message, { name: isolate(saved.customer.name), date: formatDate(saved.renewsAt, locale) }),
                  );
                }}
              />
            )}
          </>
        )}
      </AsyncContent>
    </Stack>
  );
};
