import { useState } from 'react';
import { fetchLiveElements, unpublishElement } from '@/features/admin/api';
import {
  DataTable,
  ElementSummary,
  FilterBar,
  Notice,
  PageHeader,
  RequirePermission,
  Stack,
  TextField,
  type DataTableColumn,
} from '@/features/admin/components';
import { useAdminSession } from '@/features/admin/hooks';
import type { CatalogElement, UnpublishInput } from '@/features/admin/types';
import { elementMatchesQuery, errorMessage, fillText, isolate } from '@/features/admin/utils';
import { AsyncContent, Button, EmptyState, Text } from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { formatDate, formatNumber, safeAsync } from '@/shared/utils';
import { UnpublishModal } from './UnpublishModal';

const LiveElements = () => {
  const { text, locale } = useLocale();
  const { currentAdmin } = useAdminSession();
  const live = useAsync(fetchLiveElements, []);
  const [query, setQuery] = useState('');
  const [target, setTarget] = useState<CatalogElement | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const t = text.admin;

  const openUnpublish = (element: CatalogElement) => {
    setError(null);
    setTarget(element);
  };

  const submitUnpublish = async (input: UnpublishInput) => {
    if (!target) return;
    setPending(true);
    setError(null);
    const result = await safeAsync(() => unpublishElement(currentAdmin.id, target.id, input));
    setPending(false);
    if (!result.ok) {
      setError(errorMessage(result.error, text));
      return;
    }
    setTarget(null);
    setNotice(fillText(t.live.unpublished, { title: isolate(result.data.title) }));
    live.retry();
  };

  const columns: DataTableColumn<CatalogElement>[] = [
    {
      key: 'element',
      header: t.columns.element,
      render: (element) => <ElementSummary title={element.title} creatorName={element.creator.name} />,
    },
    { key: 'type', header: t.columns.type, render: (element) => t.elementTypes[element.type] },
    { key: 'category', header: t.columns.category, render: (element) => t.categories[element.category] },
    {
      key: 'published',
      header: t.columns.published,
      render: (element) => (element.publishedAt ? formatDate(element.publishedAt, locale) : ''),
    },
    {
      key: 'actions',
      header: t.columns.actions,
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
      <PageHeader title={t.live.title} description={t.live.description} />
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
                  autoDirection
                />
              </FilterBar>
              <Text color={vars.colors.textMuted}>
                {fillText(t.live.count, { count: formatNumber(elements.length, locale) })}
              </Text>
              {visible.length > 0 ? (
                <DataTable
                  label={t.live.tableLabel}
                  columns={columns}
                  rows={visible}
                  getRowKey={(element) => element.id}
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
