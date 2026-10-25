import { useState } from 'react';
import { fetchPayouts } from '@/features/admin/api';
import { payoutStatuses, payoutStatusTone } from '@/features/admin/constants';
import type { IconName } from '@/shared/assets';
import type { Payout, PayoutDecision, PayoutStatus } from '@/features/admin/types';
import { replaceById } from '@/features/admin/utils';
import { AsyncContent, Badge, Button, EmptyState, FilterBar, Icon, Notice, type RecordColumn, recordRows, Select, Stack, Table, Text } from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { fillText, formatDate, formatPrice, isolate, isOneOf } from '@/shared/utils';
import { PayoutDecisionModal } from './PayoutDecisionModal';

const allStatuses = 'all';

// The decisions each status allows: a request is approved or rejected, then marked paid or failed.
const nextSteps: Partial<Record<PayoutStatus, PayoutDecision[]>> = {
  pending: ['approved', 'rejected'],
  approved: ['paid', 'failed'],
};

// Each decision's icon button: approve and pay go forward; reject and failed stop the payout.
const decisionIcons: Record<PayoutDecision, IconName> = { approved: 'check', paid: 'wallet', rejected: 'close', failed: 'close' };

export const RequestsTab = () => {
  const { text, locale } = useLocale();
  const payouts = useAsync(fetchPayouts, []);
  const [status, setStatus] = useState<PayoutStatus | typeof allStatuses>(allStatuses);
  const [deciding, setDeciding] = useState<{ payout: Payout; decision: PayoutDecision } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const t = text.admin.payouts;

  const columns: RecordColumn<Payout>[] = [
    {
      key: 'creator',
      label: text.admin.columns.creator,
      render: (row) => (
        <Text as="span" autoDirection>
          {row.creator.name}
        </Text>
      ),
    },
    { key: 'amount', label: text.admin.columns.amount, render: (row) => formatPrice(row.amount, locale) },
    {
      key: 'method',
      label: text.admin.columns.method,
      render: (row) => (
        <Stack gap={vars.spacing[1]}>
          <Text as="span">{text.admin.methods[row.method]}</Text>
          <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
            <bdi>{row.account}</bdi>
          </Text>
        </Stack>
      ),
    },
    { key: 'requested', label: text.admin.columns.requested, render: (row) => formatDate(row.requestedAt, locale) },
    {
      key: 'status',
      label: text.admin.columns.status,
      render: (row) => (
        <Stack gap={vars.spacing[1]} align="flex-start">
          <Badge variant={payoutStatusTone[row.status]}>{text.admin.payoutStatuses[row.status]}</Badge>
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
      label: text.admin.columns.actions,
      align: 'end',
      render: (row) => (
        <Stack direction="row" justify="flex-end" wrap gap={vars.spacing[2]}>
          {(nextSteps[row.status] ?? []).map((decision) => (
            <Button
              key={decision}
              size="sm"
              variant={decision === 'rejected' || decision === 'failed' ? 'outline' : 'primary'}
              iconOnly
              tooltip={t.decisions[decision].button}
              tooltipAlign="end"
              onClick={() => setDeciding({ payout: row, decision })}
            >
              <Icon name={decisionIcons[decision]} size={vars.sizes.icon.sm} />
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
                <Select
                  label={text.admin.columns.status}
                  options={[
                    { value: allStatuses, label: t.allStatuses },
                    ...payoutStatuses.map((value) => ({ value, label: text.admin.payoutStatuses[value] })),
                  ]}
                  value={status}
                  onChange={(value) => setStatus(isOneOf(value, payoutStatuses) ? value : allStatuses)}
                />
              </FilterBar>
              {visible.length > 0 ? (
                <Table label={t.tabs.requests} columns={columns} rows={recordRows(visible, (row) => row.id, columns)} stackOnMobile />
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
                        amount: formatPrice(saved.amount, locale),
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
