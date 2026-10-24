import { useState } from 'react';
import { fetchTransactions } from '@/features/admin/api';
import {
  Badge,
  DataTable,
  FilterBar,
  Notice,
  SelectField,
  Stack,
  TextField,
  type DataTableColumn,
} from '@/features/admin/components';
import { transactionStatuses, transactionStatusTone } from '@/features/admin/constants';
import type { Transaction, TransactionStatus } from '@/features/admin/types';
import { fillText, formatMoney, isOneOf, isolate, matchesQuery, refundable, replaceById } from '@/features/admin/utils';
import { AsyncContent, Button, EmptyState, Text } from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { formatDate } from '@/shared/utils';
import { RefundModal } from './RefundModal';

const allStatuses = 'all';
const dateTime: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' };

// Every payment, newest first. Refunds are issued from here.
export const TransactionsTab = () => {
  const { text, locale } = useLocale();
  const transactions = useAsync(fetchTransactions, []);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<TransactionStatus | typeof allStatuses>(allStatuses);
  const [refunding, setRefunding] = useState<Transaction | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const t = text.admin.billing;

  const columns: DataTableColumn<Transaction>[] = [
    { key: 'date', header: text.admin.columns.date, render: (row) => formatDate(row.at, locale, dateTime) },
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
    { key: 'method', header: text.admin.columns.method, render: (row) => text.admin.methods[row.method] },
    {
      key: 'amount',
      header: text.admin.columns.amount,
      render: (row) => (
        <Stack gap={vars.spacing[1]}>
          <Text as="span">{formatMoney(row.amount, locale)}</Text>
          {row.refunded > 0 && (
            <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
              {fillText(t.refundedAmount, { amount: formatMoney(row.refunded, locale) })}
            </Text>
          )}
        </Stack>
      ),
    },
    {
      key: 'status',
      header: text.admin.columns.status,
      render: (row) => <Badge tone={transactionStatusTone[row.status]}>{t.statuses[row.status]}</Badge>,
    },
    {
      key: 'actions',
      header: text.admin.columns.actions,
      align: 'end',
      render: (row) =>
        refundable(row) > 0 && (
          <Button size="sm" variant="muted" onClick={() => setRefunding(row)}>
            {t.refund.button}
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
      <AsyncContent state={transactions} empty={<EmptyState title={t.emptyTitle} message={t.emptyMessage} />}>
        {(list) => {
          const visible = list.filter(
            (row) =>
              (status === allStatuses || row.status === status) &&
              matchesQuery(query, [row.customer.name, row.customer.email, row.id]),
          );
          return (
            <Stack>
              <FilterBar>
                <TextField
                  type="search"
                  label={text.admin.common.search}
                  placeholder={t.searchPlaceholder}
                  value={query}
                  onChange={setQuery}
                  autoDirection
                />
                <SelectField
                  label={text.admin.columns.status}
                  options={[
                    { value: allStatuses, label: t.allStatuses },
                    ...transactionStatuses.map((value) => ({ value, label: t.statuses[value] })),
                  ]}
                  value={status}
                  onChange={(value) => setStatus(isOneOf(transactionStatuses, value) ? value : allStatuses)}
                />
              </FilterBar>
              {visible.length > 0 ? (
                <DataTable label={t.tabs.transactions} columns={columns} rows={visible} getRowKey={(row) => row.id} />
              ) : (
                <EmptyState
                  title={text.admin.common.noMatchesTitle}
                  message={t.noMatchesMessage}
                  action={
                    <Button
                      onClick={() => {
                        setQuery('');
                        setStatus(allStatuses);
                      }}
                    >
                      {text.admin.common.clearFilters}
                    </Button>
                  }
                />
              )}
              {refunding && (
                <RefundModal
                  transaction={refunding}
                  onClose={() => setRefunding(null)}
                  onRefunded={(saved, amount) => {
                    transactions.update(replaceById(list, saved));
                    setRefunding(null);
                    setNotice(
                      fillText(t.refund.done, {
                        amount: formatMoney(amount, locale),
                        name: isolate(saved.customer.name),
                      }),
                    );
                  }}
                />
              )}
            </Stack>
          );
        }}
      </AsyncContent>
    </Stack>
  );
};
