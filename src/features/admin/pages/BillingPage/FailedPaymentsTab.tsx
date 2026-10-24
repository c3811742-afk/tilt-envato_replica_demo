import { fetchFailedPayments } from '@/features/admin/api';
import { DataTable, Stack, type DataTableColumn } from '@/features/admin/components';
import type { FailedPayment } from '@/features/admin/types';
import { formatMoney } from '@/features/admin/utils';
import { AsyncContent, EmptyState, Text } from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { formatDate, formatNumber } from '@/shared/utils';

// Renewals and purchases that didn't go through. The customer is emailed and the payment is retried.
export const FailedPaymentsTab = () => {
  const { text, locale } = useLocale();
  const payments = useAsync(fetchFailedPayments, []);
  const t = text.admin.billing;

  const columns: DataTableColumn<FailedPayment>[] = [
    { key: 'date', header: text.admin.columns.date, render: (row) => formatDate(row.at, locale) },
    {
      key: 'customer',
      header: text.admin.columns.customer,
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
    { key: 'plan', header: text.admin.columns.plan, render: (row) => row.planName },
    { key: 'amount', header: text.admin.columns.amount, render: (row) => formatMoney(row.amount, locale) },
    { key: 'method', header: text.admin.columns.method, render: (row) => text.admin.methods[row.method] },
    { key: 'reason', header: text.admin.columns.reason, render: (row) => t.failureReasons[row.reason] },
    { key: 'attempts', header: text.admin.columns.attempts, render: (row) => formatNumber(row.attempts, locale) },
  ];

  return (
    <Stack>
      <Text color={vars.colors.textMuted}>{t.failedDescription}</Text>
      <AsyncContent state={payments} empty={<EmptyState title={t.failedEmptyTitle} message={t.failedEmptyMessage} />}>
        {(list) => <DataTable label={t.tabs.failedPayments} columns={columns} rows={list} getRowKey={(row) => row.id} />}
      </AsyncContent>
    </Stack>
  );
};
