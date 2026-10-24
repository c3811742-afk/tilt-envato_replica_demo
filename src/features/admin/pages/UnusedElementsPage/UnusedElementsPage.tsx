import { useState } from 'react';
import { deprecateElement, fetchUnusedElements } from '@/features/admin/api';
import {
  DataTable,
  ElementSummary,
  FilterBar,
  Notice,
  PageHeader,
  ReasonModal,
  RequirePermission,
  SelectField,
  Stack,
  type DataTableColumn,
} from '@/features/admin/components';
import { deprecateReasons, unusedPeriods, type UnusedPeriod } from '@/features/admin/constants';
import { useAdminAction, useAdminSession } from '@/features/admin/hooks';
import type { CatalogElement, DeprecateInput } from '@/features/admin/types';
import { fillText, isolate, removeById } from '@/features/admin/utils';
import { AsyncContent, Button, EmptyState, Text } from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { formatDate, formatNumber } from '@/shared/utils';

const defaultPeriod: UnusedPeriod = 12;

const UnusedElements = () => {
  const { text, locale } = useLocale();
  const { currentAdmin } = useAdminSession();
  const [period, setPeriod] = useState<UnusedPeriod>(defaultPeriod);
  const unused = useAsync(() => fetchUnusedElements(period), [period]);
  const action = useAdminAction();
  const [target, setTarget] = useState<CatalogElement | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const t = text.admin.unused;

  const deprecate = async (list: CatalogElement[], input: DeprecateInput) => {
    if (!target) return;
    const result = await action.run(() => deprecateElement(currentAdmin.id, target.id, input));
    if (!result.ok) return;
    unused.update(removeById(list, result.data.id));
    setTarget(null);
    setNotice(fillText(t.deprecated, { title: isolate(result.data.title) }));
  };

  const columns: DataTableColumn<CatalogElement>[] = [
    {
      key: 'element',
      header: text.admin.columns.element,
      render: (element) => <ElementSummary title={element.title} creatorName={element.creator.name} />,
    },
    { key: 'type', header: text.admin.columns.type, render: (element) => text.admin.elementTypes[element.type] },
    {
      key: 'published',
      header: text.admin.columns.published,
      render: (element) => (element.publishedAt ? formatDate(element.publishedAt, locale) : ''),
    },
    {
      key: 'downloads',
      header: text.admin.columns.downloads,
      render: (element) => formatNumber(element.downloads ?? 0, locale),
    },
    {
      key: 'lastDownload',
      header: text.admin.columns.lastDownload,
      render: (element) =>
        element.lastDownloadedAt ? (
          formatDate(element.lastDownloadedAt, locale)
        ) : (
          <Text as="span" color={vars.colors.textMuted}>
            {t.never}
          </Text>
        ),
    },
    {
      key: 'actions',
      header: text.admin.columns.actions,
      align: 'end',
      render: (element) => (
        <Button
          size="sm"
          variant="danger"
          onClick={() => {
            action.clearError();
            setTarget(element);
          }}
        >
          {t.deprecate}
        </Button>
      ),
    },
  ];

  return (
    <Stack gap={vars.spacing[6]}>
      <PageHeader title={t.title} description={t.description} />
      {notice && (
        <Notice tone="success" onDismiss={() => setNotice(null)}>
          {notice}
        </Notice>
      )}
      <FilterBar>
        <SelectField
          label={t.periodLabel}
          options={unusedPeriods.map((months) => ({
            value: String(months),
            label: fillText(t.periodOption, { count: formatNumber(months, locale) }),
          }))}
          value={String(period)}
          onChange={(value) => {
            const months = unusedPeriods.find((option) => String(option) === value);
            if (months) setPeriod(months);
          }}
        />
      </FilterBar>
      <AsyncContent
        state={unused}
        empty={
          <EmptyState
            title={t.emptyTitle}
            message={fillText(t.emptyMessage, { count: formatNumber(period, locale) })}
          />
        }
      >
        {(list) => (
          <Stack>
            <Text color={vars.colors.textMuted}>{fillText(t.count, { count: formatNumber(list.length, locale) })}</Text>
            <DataTable label={t.title} columns={columns} rows={list} getRowKey={(element) => element.id} />
            {target && (
              <ReasonModal
                title={t.deprecateTitle}
                confirmLabel={t.deprecate}
                message={t.deprecateMessage}
                reasons={deprecateReasons}
                reasonLabels={text.admin.deprecateReasons}
                noteLabel={t.noteLabel}
                pending={action.pending}
                error={action.error}
                onClose={() => setTarget(null)}
                onSubmit={(input) => deprecate(list, input)}
              >
                <Text autoDirection>
                  <strong>{target.title}</strong>
                </Text>
              </ReasonModal>
            )}
          </Stack>
        )}
      </AsyncContent>
    </Stack>
  );
};

export const UnusedElementsPage = () => (
  <RequirePermission permission="manageCatalog">
    <UnusedElements />
  </RequirePermission>
);
