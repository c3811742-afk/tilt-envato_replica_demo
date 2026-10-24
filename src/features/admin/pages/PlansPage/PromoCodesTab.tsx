import { useState } from 'react';
import { disablePromoCode, fetchPlans, fetchPromoCodes } from '@/features/admin/api';
import { ConfirmModal, Notice } from '@/features/admin/components';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { Plan, PromoCode } from '@/features/admin/types';
import {
  fillText,
  formatList,
  fromDateKey,
  isolate,
  localized,
  promoState,
  replaceById,
  type PromoState,
} from '@/features/admin/utils';
import {
  AsyncContent,
  type BadgeVariant,
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
import { formatDate, formatNumber } from '@/shared/utils';
import { PromoCodeModal } from './PromoCodeModal';

const stateTone: Record<PromoState, BadgeVariant> = {
  active: 'success',
  expired: 'neutral',
  usedUp: 'warning',
  disabled: 'neutral',
};

const loadPromos = async () => {
  const [promos, plans] = await Promise.all([fetchPromoCodes(), fetchPlans()]);
  return { promos, plans };
};

export const PromoCodesTab = () => {
  const { text, locale } = useLocale();
  const { currentAdmin } = useAdminSession();
  const data = useAsync(loadPromos, [], ({ promos }) => promos.length === 0);
  const action = useAdminAction();
  const [adding, setAdding] = useState(false);
  const [disabling, setDisabling] = useState<PromoCode | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const t = text.admin.promoCodes;
  const loaded = data.status === 'success' || data.status === 'empty' ? data.data : null;

  const update = (promos: PromoCode[]) => loaded && data.update({ ...loaded, promos });

  const disable = async () => {
    if (!disabling || !loaded) return;
    const result = await action.run(() => disablePromoCode(currentAdmin.id, disabling.id));
    if (!result.ok) return;
    update(replaceById(loaded.promos, result.data));
    setDisabling(null);
    setNotice(fillText(t.disabled, { code: isolate(result.data.code) }));
  };

  const planNames = (promo: PromoCode, plans: Plan[]) =>
    promo.planIds.length === 0
      ? t.allPlans
      : formatList(
          plans.filter((plan) => promo.planIds.includes(plan.id)).map((plan) => localized(plan.name, locale)),
          locale,
        );

  const columns = (plans: Plan[]): RecordColumn<PromoCode>[] => [
    {
      key: 'code',
      label: text.admin.columns.code,
      render: (promo) => (
        <Text as="span">
          <bdi>
            <strong>{promo.code}</strong>
          </bdi>
        </Text>
      ),
    },
    {
      key: 'discount',
      label: text.admin.columns.discount,
      render: (promo) => fillText(t.percentOff, { value: formatNumber(promo.percent, locale) }),
    },
    { key: 'plans', label: text.admin.columns.plans, render: (promo) => planNames(promo, plans) },
    {
      key: 'expires',
      label: text.admin.columns.expires,
      render: (promo) => formatDate(fromDateKey(promo.expiresAt), locale),
    },
    {
      key: 'uses',
      label: text.admin.columns.uses,
      render: (promo) =>
        promo.maxUses === null
          ? formatNumber(promo.uses, locale)
          : fillText(t.usesOf, { uses: formatNumber(promo.uses, locale), max: formatNumber(promo.maxUses, locale) }),
    },
    {
      key: 'status',
      label: text.admin.columns.status,
      render: (promo) => {
        const state = promoState(promo);
        return <Badge variant={stateTone[state]}>{t.states[state]}</Badge>;
      },
    },
    {
      key: 'actions',
      label: text.admin.columns.actions,
      align: 'end',
      render: (promo) =>
        promo.active && (
          <Button
            size="sm"
            variant="muted"
            onClick={() => {
              action.clearError();
              setDisabling(promo);
            }}
          >
            {t.disable}
          </Button>
        ),
    },
  ];

  const addButton = <Button onClick={() => setAdding(true)}>{t.add}</Button>;

  return (
    <Stack>
      <Stack direction="row" wrap align="center">
        <Text color={vars.colors.textMuted}>{t.description}</Text>
        {data.status === 'success' && addButton}
      </Stack>
      {notice && (
        <Notice tone="success" onDismiss={() => setNotice(null)}>
          {notice}
        </Notice>
      )}
      <AsyncContent state={data} empty={<EmptyState title={t.emptyTitle} message={t.emptyMessage} action={addButton} />}>
        {({ promos, plans }) => (
          <Table label={t.tableLabel} columns={columns(plans)} rows={recordRows(promos, (promo) => promo.id, columns(plans))} stackOnMobile />
        )}
      </AsyncContent>
      {adding && loaded && (
        <PromoCodeModal
          plans={loaded.plans}
          onClose={() => setAdding(false)}
          onCreated={(promo) => {
            update([promo, ...loaded.promos]);
            setAdding(false);
            setNotice(fillText(t.created, { code: isolate(promo.code) }));
          }}
        />
      )}
      {disabling && (
        <ConfirmModal
          title={t.disableTitle}
          confirmLabel={t.disable}
          tone="danger"
          message={t.disableMessage}
          pending={action.pending}
          error={action.error}
          onConfirm={disable}
          onClose={() => setDisabling(null)}
        >
          <Text>
            <bdi>
              <strong>{disabling.code}</strong>
            </bdi>
          </Text>
        </ConfirmModal>
      )}
    </Stack>
  );
};
