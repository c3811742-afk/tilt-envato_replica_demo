import { fetchNoClickSearches } from '@/features/admin/api';
import { Badge, DataTable, Stack, type DataTableColumn } from '@/features/admin/components';
import type { NoClickSearch } from '@/features/admin/types';
import { AsyncContent, EmptyState, Text } from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { formatDate, formatNumber } from '@/shared/utils';

// Searches nobody clicked a result for: gaps in the catalog, or results that don't match.
export const NoClicksTab = () => {
  const { text, locale } = useLocale();
  const searches = useAsync(fetchNoClickSearches, []);
  const t = text.admin.search.noClicks;

  const columns: DataTableColumn<NoClickSearch>[] = [
    {
      key: 'term',
      header: text.admin.columns.term,
      render: (search) => (
        <Text as="span" autoDirection>
          {search.term}
        </Text>
      ),
    },
    { key: 'searches', header: text.admin.columns.searches, render: (search) => formatNumber(search.searches, locale) },
    {
      key: 'results',
      header: text.admin.columns.results,
      render: (search) =>
        search.results === 0 ? (
          <Badge tone="danger">{t.noResults}</Badge>
        ) : (
          formatNumber(search.results, locale)
        ),
    },
    {
      key: 'lastSearched',
      header: text.admin.columns.lastSearched,
      render: (search) => formatDate(search.lastSearchedAt, locale),
    },
  ];

  return (
    <Stack>
      <Text color={vars.colors.textMuted}>{t.description}</Text>
      <AsyncContent state={searches} empty={<EmptyState title={t.emptyTitle} message={t.emptyMessage} />}>
        {(list) => <DataTable label={t.tableLabel} columns={columns} rows={list} getRowKey={(search) => search.id} />}
      </AsyncContent>
    </Stack>
  );
};
