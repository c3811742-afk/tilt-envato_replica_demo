import { useState } from 'react';
import { fetchPayouts } from '@/features/admin/api';
import {
  Badge,
  DataTable,
  FilterBar,
  Notice,
  SelectField,
  Stack,
  type DataTableColumn,
} from '@/features/admin/components';
import { payoutStatuses, payoutStatusTone } from '@/features/admin/constants';
import type { Payout, PayoutDecision, PayoutStatus } from '@/features/admin/types';
import { fillText, formatMoney, isOneOf, isolate, replaceById } from '@/features/admin/utils';
import { AsyncContent, Button, EmptyState, Text } from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { formatDate } from '@/shared/utils';
import { PayoutDecisionModal } from './PayoutDecisionModal';

const allStatuses = 'all';

// The decisions each status allows: a request is approved or rejected, then marked paid or failed.
const nextSteps: Partial<Record<PayoutStatus, PayoutDecision[]>> = {
  pending: ['approved', 'rejected'],
  approved: ['paid', 'failed'],
};

export const RequestsTab = () => {
  const { text, locale } = useLocale();
  const payouts = useAsync(fetchPayouts, []);
  const [status, setStatus] = useState<PayoutStatus | typeof allStatuses>(allStatuses);
  const [deciding, setDeciding] = useState<{ payout: Payout; decision: PayoutDecision } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const t = text.admin.payouts;

  const columns: DataTableColumn<Payout>[] = [
    {
      key: 'creator',
      header: text.admin.columns.creator,
      render: (row) => (
        <Text as="span" autoDirection>
          {row.creator.name}
        </Text>
      ),
    },
    { key: 'amount', header: text.admin.columns.amount, render: (row) => formatMoney(row.amount, locale) },
    {
      key: 'method',
      header: text.admin.columns.method,
      render: (row) => (
        <Stack gap={vars.spacing[1]}>
          <Text as="span">{text.admin.methods[row.method]}</Text>
          <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
            <bdi>{row.account}</bdi>
          </Text>
        </Stack>
      ),
    },
    { key: 'requested', header: text.admin.columns.requested, render: (row) => formatDate(row.requestedAt, locale) },
    {
      key: 'status',
      header: text.admin.columns.status,
      render: (row) => (
        <Stack gap={vars.spacing[1]} align="start">
          <Badge tone={payoutStatusTone[row.status]}>{text.admin.payoutStatuses[row.status]}</Badge>
          {row.note && (
            <Text as="span" variant="bodySm" color={vars.colors.textMuted} autoDirection>
              {row.note}
            </Text>
          )}
        </Stack>
      ),
    },
    {
      key: 'actions',
      header: text.admin.columns.actions,
      render: (row) => (
        <Stack direction="row" gap={vars.spacing[2]}>
          {(nextSteps[row.status] ?? []).map((decision) => (
            <Button
              key={decision}
              size="sm"
              variant={decision === 'rejected' || decision === 'failed' ? 'muted' : 'primary'}
              onClick={() => setDeciding({ payout: row, decision })}
            >
              {t.decisions[decision].button}
            </Button>
          ))}
        </Stack>
      ),
    },
  ];

  return (
    <Stack>
      <Text color={vars.colors.textMuted}>{t.requestsDescription}</Text>
      {notice && (
        <Notice tone="success" onDismiss={() => setNotice(null)}>
          {notice}
        </Notice>
      )}
      <AsyncContent state={payouts} empty={<EmptyState title={t.emptyTitle} message={t.emptyMessage} />}>
        {(list) => {
          const visible = list.filter((row) => status === allStatuses || row.status === status);
          return (
            <Stack>
              <FilterBar>
                <SelectField
                  label={text.admin.columns.status}
                  options={[
                    { value: allStatuses, label: t.allStatuses },
                    ...payoutStatuses.map((value) => ({ value, label: text.admin.payoutStatuses[value] })),
                  ]}
                  value={status}
                  onChange={(value) => setStatus(isOneOf(payoutStatuses, value) ? value : allStatuses)}
                />
              </FilterBar>
              {visible.length > 0 ? (
                <DataTable label={t.tabs.requests} columns={columns} rows={visible} getRowKey={(row) => row.id} />
              ) : (
                <EmptyState
                  title={t.noneTitle}
                  message={t.noneMessage}
                  action={<Button onClick={() => setStatus(allStatuses)}>{t.showAll}</Button>}
                />
              )}
              {deciding && (
                <PayoutDecisionModal
                  payout={deciding.payout}
                  decision={deciding.decision}
                  onClose={() => setDeciding(null)}
                  onDone={(saved) => {
                    payouts.update(replaceById(list, saved));
                    setNotice(
                      fillText(t.decisions[deciding.decision].done, {
                        name: isolate(saved.creator.name),
                        amount: formatMoney(saved.amount, locale),
                      }),
                    );
                    setDeciding(null);
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
