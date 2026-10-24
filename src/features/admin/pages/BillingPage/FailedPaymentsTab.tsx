import { fetchFailedPayments } from '@/features/admin/api';

import type { FailedPayment } from '@/features/admin/types';
import { AsyncContent, EmptyState, type RecordColumn, recordRows, Stack, Table, Text } from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { formatDate, formatNumber, formatPrice } from '@/shared/utils';

// Renewals and purchases that didn't go through. The customer is emailed and the payment is retried.
export const FailedPaymentsTab = () => {
  const { text, locale } = useLocale();
  const payments = useAsync(fetchFailedPayments, []);
  const t = text.admin.billing;

  const columns: RecordColumn<FailedPayment>[] = [
    { key: 'date', label: text.admin.columns.date, render: (row) => formatDate(row.at, locale) },
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
    { key: 'plan', label: text.admin.columns.plan, render: (row) => row.planName },
    { key: 'amount', label: text.admin.columns.amount, render: (row) => formatPrice(row.amount, locale) },
    { key: 'method', label: text.admin.columns.method, render: (row) => text.admin.methods[row.method] },
    { key: 'reason', label: text.admin.columns.reason, render: (row) => t.failureReasons[row.reason] },
    { key: 'attempts', label: text.admin.columns.attempts, render: (row) => formatNumber(row.attempts, locale) },
  ];

  return (
    <Stack>
      <Text color={vars.colors.textMuted}>{t.failedDescription}</Text>
      <AsyncContent state={payments} empty={<EmptyState title={t.failedEmptyTitle} message={t.failedEmptyMessage} />}>
        {(list) => <Table label={t.tabs.failedPayments} columns={columns} rows={recordRows(list, (row) => row.id, columns)} stackOnMobile />}
      </AsyncContent>
    </Stack>
  );
};
