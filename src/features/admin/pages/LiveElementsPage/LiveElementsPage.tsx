import { useState } from 'react';
import { fetchLiveElements, unpublishElement } from '@/features/admin/api';
import { ElementSummary, RequirePermission } from '@/features/admin/components';
import { useAdminSession, useAdminAction } from '@/features/admin/hooks';
import type { CatalogElement, UnpublishInput } from '@/features/admin/types';
import { elementMatchesQuery } from '@/features/admin/utils';
import { AsyncContent, Button, EmptyState, FilterBar, Notice, type RecordColumn, recordRows, SectionHeader, Stack, Table, Text, TextField } from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { fillText, formatDate, formatNumber, isolate } from '@/shared/utils';
import { UnpublishModal } from './UnpublishModal';

const LiveElements = () => {
  const { text, locale } = useLocale();
  const { currentAdmin } = useAdminSession();
  const live = useAsync(fetchLiveElements, []);
  const [query, setQuery] = useState('');
  const [target, setTarget] = useState<CatalogElement | null>(null);
  const { run, busy: pending, error, clearError } = useAdminAction();
  const [notice, setNotice] = useState<string | null>(null);
  const t = text.admin;

  const openUnpublish = (element: CatalogElement) => {
    clearError();
    setTarget(element);
  };

  const submitUnpublish = async (input: UnpublishInput) => {
    if (!target) return;
    const result = await run(() => unpublishElement(currentAdmin.id, target.id, input));
    if (!result.ok) return;
    setTarget(null);
    setNotice(fillText(t.live.unpublished, { title: isolate(result.data.title) }));
    live.retry();
  };

  const columns: RecordColumn<CatalogElement>[] = [
    {
      key: 'element',
      label: t.columns.element,
      render: (element) => <ElementSummary title={element.title} creatorName={element.creator.name} />,
    },
    { key: 'type', label: t.columns.type, render: (element) => t.elementTypes[element.type] },
    { key: 'category', label: t.columns.category, render: (element) => text.categories[element.category].name },
    {
      key: 'published',
      label: t.columns.published,
      render: (element) => (element.publishedAt ? formatDate(element.publishedAt, locale) : ''),
    },
    {
      key: 'actions',
      label: t.columns.actions,
      align: 'end',
      render: (element) => (
        <Button size="sm" variant="danger" onClick={() => openUnpublish(element)}>
          {t.live.unpublish}
        </Button>
      ),
    },
  ];

  return (
    <Stack gap={vars.spacing[6]}>
      <SectionHeader as="h1" title={t.live.title} subtitle={t.live.description} />
      {notice && (
        <Notice tone="success" onDismiss={() => setNotice(null)}>
          {notice}
        </Notice>
      )}
      <AsyncContent state={live} empty={<EmptyState title={t.live.emptyTitle} message={t.live.emptyMessage} />}>
        {(elements) => {
          const visible = elements.filter((element) => elementMatchesQuery(element, query));
          return (
            <Stack>
              <FilterBar>
                <TextField
                  type="search"
                  label={t.common.search}
                  placeholder={t.common.searchPlaceholder}
                  value={query}
                  onChange={setQuery}
                />
              </FilterBar>
              <Text color={vars.colors.textMuted}>
                {fillText(t.live.count, { count: formatNumber(elements.length, locale) })}
              </Text>
              {visible.length > 0 ? (
                <Table
                  label={t.live.tableLabel}
                  columns={columns} rows={recordRows(visible, (element) => element.id, columns)} stackOnMobile
                 
                 
                />
              ) : (
                <EmptyState
                  title={t.common.noMatchesTitle}
                  message={t.live.noMatchesMessage}
                  action={<Button onClick={() => setQuery('')}>{t.common.clearFilters}</Button>}
                />
              )}
            </Stack>
          );
        }}
      </AsyncContent>
      {target && (
        <UnpublishModal
          element={target}
          pending={pending}
          error={error}
          onClose={() => setTarget(null)}
          onSubmit={submitUnpublish}
        />
      )}
    </Stack>
  );
};

export const LiveElementsPage = () => (
  <RequirePermission permission="unpublish">
    <LiveElements />
  </RequirePermission>
);
