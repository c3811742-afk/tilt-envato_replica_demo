import { useState } from 'react';
import { fetchPlans } from '@/features/admin/api';
import { Badge, DataTable, Notice, Stack, type DataTableColumn } from '@/features/admin/components';
import type { Plan } from '@/features/admin/types';
import { fillText, formatMoney, isolate, localized, upsertById } from '@/features/admin/utils';
import { AsyncContent, Button, EmptyState, Text } from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { formatNumber } from '@/shared/utils';
import { PlanModal } from './PlanModal';

export const PlansTab = () => {
  const { text, locale } = useLocale();
  const plans = useAsync(fetchPlans, []);
  const [editing, setEditing] = useState<Plan | 'new' | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const t = text.admin.plans;
  const current = plans.status === 'success' ? plans.data : [];
  const number = (value: number) => formatNumber(value, locale);

  const columns: DataTableColumn<Plan>[] = [
    {
      key: 'plan',
      header: text.admin.columns.plan,
      render: (plan) => (
        <Stack gap={vars.spacing[1]} align="start">
          <Text as="span" autoDirection>
            <strong>{localized(plan.name, locale)}</strong>
          </Text>
          {!plan.active && <Badge>{t.notForSale}</Badge>}
        </Stack>
      ),
    },
    {
      key: 'price',
      header: text.admin.columns.price,
      render: (plan) => (
        <Stack gap={vars.spacing[1]}>
          <Text as="span">{fillText(t.perMonth, { price: formatMoney(plan.monthlyPrice, locale) })}</Text>
          <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
            {fillText(t.perYear, { price: formatMoney(plan.yearlyPrice, locale) })}
          </Text>
        </Stack>
      ),
    },
    {
      key: 'limits',
      header: text.admin.columns.limits,
      render: (plan) => (
        <Stack gap={vars.spacing[1]}>
          <Text as="span">
            {plan.downloadLimit === null
              ? t.unlimited
              : fillText(t.downloadsPerMonth, { count: number(plan.downloadLimit) })}
          </Text>
          <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
            {fillText(t.seats, { count: number(plan.seats) })}
          </Text>
          <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
            {text.admin.licenseScopes[plan.licenseScope]}
          </Text>
        </Stack>
      ),
    },
    {
      key: 'ai',
      header: text.admin.columns.ai,
      render: (plan) => (
        <Stack gap={vars.spacing[1]}>
          <Text as="span">{fillText(t.creditsPerMonth, { count: number(plan.aiCredits) })}</Text>
          <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
            {fillText(t.parallel, { count: number(plan.parallelGenerations) })}
          </Text>
        </Stack>
      ),
    },
    { key: 'subscribers', header: text.admin.columns.subscribers, render: (plan) => number(plan.subscribers) },
    {
      key: 'actions',
      header: text.admin.columns.actions,
      align: 'end',
      render: (plan) => (
        <Button size="sm" variant="muted" onClick={() => setEditing(plan)}>
          {text.admin.common.edit}
        </Button>
      ),
    },
  ];

  const addButton = <Button onClick={() => setEditing('new')}>{t.add}</Button>;

  return (
    <Stack>
      <Stack direction="row" align="center">
        <Text color={vars.colors.textMuted}>{t.description}</Text>
        {current.length > 0 && addButton}
      </Stack>
      {notice && (
        <Notice tone="success" onDismiss={() => setNotice(null)}>
          {notice}
        </Notice>
      )}
      <AsyncContent state={plans} empty={<EmptyState title={t.emptyTitle} message={t.emptyMessage} action={addButton} />}>
        {(list) => <DataTable label={t.tableLabel} columns={columns} rows={list} getRowKey={(plan) => plan.id} />}
      </AsyncContent>
      {editing && (
        <PlanModal
          plan={editing === 'new' ? undefined : editing}
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
