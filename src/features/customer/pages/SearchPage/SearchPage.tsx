import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, EmptyState, Page, SearchBar, SplitLayout, Stack, Text } from '@/shared/components';
import { catalog, categoryFilters, searchPath } from '@/shared/constants';
import { useLocale, usePagedAsync, useSearchFilters, useStoredValue } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { Facets, Item, SearchResults } from '@/shared/types';
import { api, fillText, formatNumber, preferences } from '@/shared/utils';
import { ChipLinks } from '@/features/customer/components';
import { ActiveFilters } from './ActiveFilters';
import { AdvancedSearchDialog } from './AdvancedSearchDialog';
import { FilterDialog } from './FilterDialog';
import { FilterPanel } from './FilterPanel';
import { ImageSearchDialog } from './ImageSearchDialog';
import { MusicMatchDialog } from './MusicMatchDialog';
import { ReportResults } from './ReportResults';
import { SearchResultsView } from './SearchResultsView';
import { SearchToolbar, type SearchDialog } from './SearchToolbar';
import { useSearchTitle } from './useSearchTitle';
import styles from './SearchPage.module.css';

export const SearchPage = () => {
  const { text, locale } = useLocale();
  const navigate = useNavigate();
  const search = useSearchFilters();
  const [pagingMode] = useStoredValue(preferences.pagingMode);
  const [dialog, setDialog] = useState<SearchDialog | null>(null);
  const title = useSearchTitle(search);

  // Pages: load the page in the URL. Infinite scroll: start at the top and add pages as the user scrolls.
  const pages = pagingMode === 'pages';
  const firstOffset = pages ? (search.page - 1) * catalog.searchPageSize : 0;
  const loadKey = pages ? search.searchKey : search.pathWith({ page: 1 });
  const results = usePagedAsync<Item, SearchResults>(
    (offset) => api.searchItems({ ...search.searchQuery, offset: firstOffset + offset }),
    [loadKey, pagingMode],
  );

  // The filter counts of the last results, kept while new results load so the panel doesn't jump.
  const [keptFacets, setKeptFacets] = useState<Facets>({});
  const latestFacets = results.state.status === 'success' ? results.state.data.facets : null;
  if (latestFacets && latestFacets !== keptFacets) setKeptFacets(latestFacets);
  const facets = latestFacets ?? keptFacets;

  const total = results.state.status === 'success' ? results.state.data.total : 0;
  const filterKeys = categoryFilters[search.categoryId ?? 'all'];
  const filterPanel = (
    <FilterPanel
      categoryId={search.categoryId}
      keys={filterKeys}
      filters={search.filters}
      facets={facets}
      onCategoryChange={(categoryId) =>
        navigate(search.pathWith({ categoryId, filters: keepFilters(search.filters, categoryId ? categoryFilters[categoryId] : categoryFilters.all) }))
      }
      onChange={(filters) => navigate(search.pathWith({ filters }), { replace: true })}
    />
  );

  return (
    <Page
      title={title}
      gap={vars.spacing[5]}
      headerContent={
        results.state.status === 'success' && (
          <Text color={vars.colors.textMuted}>{fillText(text.search.resultCount, { count: formatNumber(total, locale) })}</Text>
        )
      }
    >
      {/* Phones have no search bar in the header, so the page shows its own. */}
      <div className={styles.phoneOnly}>
        <SearchBar key={search.query} defaultValue={search.query} autoFocus={search.isEmpty} onSearch={(value) => navigate(search.pathWith({ query: value }))} />
      </div>

      <SearchToolbar search={search} onOpen={setDialog} />

      {search.categoryId && !search.query && (
        <Stack gap={vars.spacing[2]}>
          <Text as="h2" variant="label" color={vars.colors.textMuted}>
            {text.search.topSearches}
          </Text>
          <ChipLinks
            label={text.search.topSearches}
            links={text.search.topTerms[search.categoryId].map((term) => ({
              key: term,
              label: term,
              to: searchPath({ category: search.categoryId, query: term }),
            }))}
          />
        </Stack>
      )}

      <ActiveFilters search={search} />

      <SplitLayout
        asideAt="start"
        columns={`${vars.sizes.sidebar.width} minmax(0, 1fr)`}
        aside={<div className={styles.sidebar}>{filterPanel}</div>}
        main={
          <Stack gap={vars.spacing[6]}>
            <SearchResultsView
              search={search}
              results={results}
              title={title}
              empty={
                <EmptyState
                  title={text.search.noResultsTitle}
                  message={search.query ? fillText(text.search.noResultsMessage, { query: search.query }) : text.search.noResultsInCategory}
                  action={
                    !search.isEmpty && (
                      <Button variant="secondary" onClick={() => navigate(searchPath())}>
                        {text.search.clearFilters}
                      </Button>
                    )
                  }
                />
              }
            />
            {search.query && <ReportResults query={search.query} categoryId={search.categoryId} />}
          </Stack>
        }
      />

      <AdvancedSearchDialog open={dialog === 'advanced'} search={search} onClose={() => setDialog(null)} />
      <ImageSearchDialog open={dialog === 'image'} search={search} onClose={() => setDialog(null)} />
      <MusicMatchDialog open={dialog === 'music'} onClose={() => setDialog(null)} />
      <FilterDialog open={dialog === 'filters'} count={total} onClose={() => setDialog(null)}>
        {filterPanel}
      </FilterDialog>
    </Page>
  );
};

// Keeps only the filters the new category offers.
const keepFilters = (filters: Record<string, string[] | undefined>, keys: readonly string[]) =>
  Object.fromEntries(Object.entries(filters).filter(([key]) => keys.includes(key)));
