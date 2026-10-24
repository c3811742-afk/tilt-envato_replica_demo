import { useState } from 'react';
import { fetchPlans } from '@/features/admin/api';
import { Notice } from '@/features/admin/components';
import type { Plan } from '@/features/admin/types';
import { fillText, isolate, localized, upsertById } from '@/features/admin/utils';
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
import { formatNumber, formatPrice } from '@/shared/utils';
import { PlanModal } from './PlanModal';

export const PlansTab = () => {
  const { text, locale } = useLocale();
  const plans = useAsync(fetchPlans, []);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const t = text.admin.plans;
  const current = plans.status === 'success' ? plans.data : [];
  const number = (value: number) => formatNumber(value, locale);

  const columns: RecordColumn<Plan>[] = [
    {
      key: 'plan',
      label: text.admin.columns.plan,
      render: (plan) => (
        <Stack gap={vars.spacing[1]} align="flex-start">
          <Text as="span" autoDirection>
            <strong>{localized(plan.name, locale)}</strong>
          </Text>
          {!plan.active && <Badge>{t.notForSale}</Badge>}
        </Stack>
      ),
    },
    {
      key: 'price',
      label: text.admin.columns.price,
      render: (plan) => (
        plan.monthlyPrice === null || plan.yearlyPrice === null ? (
          <Text as="span">{t.priceOnRequest}</Text>
        ) : (
          <Stack gap={vars.spacing[1]}>
            <Text as="span">{fillText(plan.perMember ? t.perSeatMonth : t.perMonth, { price: formatPrice(plan.monthlyPrice, locale) })}</Text>
            <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
              {fillText(t.perYear, { price: formatPrice(plan.yearlyPrice, locale) })}
            </Text>
          </Stack>
        )
      ),
    },
    {
      key: 'limits',
      label: text.admin.columns.limits,
      render: (plan) => (
        <Stack gap={vars.spacing[1]}>
          <Text as="span">
            {plan.downloadLimit === null
              ? t.unlimited
              : fillText(t.downloadsPerMonth, { count: number(plan.downloadLimit) })}
          </Text>
          {plan.perMember && (
            <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
              {fillText(t.seats, { count: number(plan.seats) })}
            </Text>
          )}
        </Stack>
      ),
    },
    {
      key: 'ai',
      label: text.admin.columns.ai,
      render: (plan) => (
        <Stack gap={vars.spacing[1]}>
          <Text as="span">{fillText(t.creditsPerMonth, { count: number(plan.aiCredits) })}</Text>
          <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
            {fillText(t.parallel, { count: number(plan.parallelGenerations) })}
          </Text>
        </Stack>
      ),
    },
    { key: 'subscribers', label: text.admin.columns.subscribers, render: (plan) => number(plan.subscribers) },
    {
      key: 'actions',
      label: text.admin.columns.actions,
      align: 'end',
      render: (plan) => (
        <Button size="sm" variant="muted" onClick={() => setEditing(plan)}>
          {text.admin.common.edit}
        </Button>
      ),
    },
  ];

  return (
    <Stack>
      <Text color={vars.colors.textMuted}>{t.description}</Text>
      {notice && (
        <Notice tone="success" onDismiss={() => setNotice(null)}>
          {notice}
        </Notice>
      )}
      <AsyncContent state={plans} empty={<EmptyState title={t.emptyTitle} message={t.emptyMessage} />}>
        {(list) => <Table label={t.tableLabel} columns={columns} rows={recordRows(list, (plan) => plan.id, columns)} stackOnMobile />}
      </AsyncContent>
      {editing && (
        <PlanModal
          plan={editing}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            plans.update(upsertById(current, saved));
            setEditing(null);
            setNotice(fillText(t.saved, { name: isolate(localized(saved.name, locale)) }));
          }}
        />
      )}
    </Stack>
  );
};
