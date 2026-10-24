import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, EmptyState, Icon, Page, SidebarLayout, Stack, Text } from '@/shared/components';
import { catalog, categoryFilters, searchPath } from '@/shared/constants';
import { useLocale, usePagedAsync, useSearchFilters, useStoredValue } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { Facets, Item, SearchResults } from '@/shared/types';
import { api, countSelectedFilters, fillText, formatNumber, preferences } from '@/shared/utils';
import { ChipLinks, SearchBox } from '@/features/customer/components';
import { ActiveFilters } from './ActiveFilters';
import { FilterDialog } from './FilterDialog';
import { FilterPanel } from './FilterPanel';
import { ReportResults } from './ReportResults';
import { ResultOptions } from './ResultOptions';
import { SearchResultsView } from './SearchResultsView';
import { useSearchTitle } from './useSearchTitle';
import styles from './SearchPage.module.css';

export const SearchPage = () => {
  const { text, locale } = useLocale();
  const navigate = useNavigate();
  const search = useSearchFilters();
  const [pagingMode] = useStoredValue(preferences.pagingMode);
  const [filtersCollapsed, setFiltersCollapsed] = useStoredValue(preferences.filtersCollapsed);
  const [filtersOpen, setFiltersOpen] = useState(false);
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
  const selectedFilters = countSelectedFilters(search.filters);
  // Sort, view and filters: a panel docked to the side of the screen on desktop, a dialog on phones and tablets.
  const optionsPanel = (
    <Stack gap={vars.spacing[6]}>
      <ResultOptions search={search} />
      <FilterPanel
        categoryId={search.categoryId}
        keys={filterKeys}
        filters={search.filters}
        facets={facets}
        onCategoryChange={(categoryId) =>
          navigate(
            search.pathWith({
              categoryId,
              filters: keepFilters(search.filters, categoryId ? categoryFilters[categoryId] : categoryFilters.all),
            }),
          )
        }
        // A quick date choice (past week…) and a custom range replace each other.
        onChange={(filters) =>
          navigate(
            search.pathWith(filters.date ? { filters, uploadedFrom: undefined, uploadedTo: undefined } : { filters }),
            { replace: true },
          )
        }
        range={{ from: search.uploadedFrom, to: search.uploadedTo }}
        onRangeChange={({ from, to }) =>
          navigate(
            search.pathWith({ uploadedFrom: from, uploadedTo: to, filters: { ...search.filters, date: undefined } }),
            { replace: true },
          )
        }
      />
    </Stack>
  );

  return (
    <SidebarLayout
      label={text.filters.title}
      collapsed={filtersCollapsed}
      onCollapsedChange={setFiltersCollapsed}
      collapseLabel={text.filters.hide}
      expandLabel={text.filters.show}
      sidebar={
        <div data-tour="filters">
          {optionsPanel}
        </div>
      }
    >
      <Page
        title={title}
        gap={vars.spacing[5]}
        headerContent={
          results.state.status === 'success' && (
            <Text color={vars.colors.textMuted}>
              {fillText(text.search.resultCount, { count: formatNumber(total, locale) })}
            </Text>
          )
        }
      >
        {/* Phones have no search bar in the header, so the page shows its own. */}
        <div className={styles.phoneOnly}>
          <SearchBox
            key={search.query}
            defaultValue={search.query}
            autoFocus={search.isEmpty}
            onSearch={(value) => navigate(search.pathWith({ query: value }))}
          />
        </div>

        <div className={styles.phoneFilters} data-tour="filtersButton">
          <Button variant="outline" onClick={() => setFiltersOpen(true)}>
            <Icon name="filter" size={vars.sizes.icon.sm} />
            {selectedFilters
              ? fillText(text.filters.titleWithCount, { count: formatNumber(selectedFilters, locale) })
              : text.filters.title}
          </Button>
        </div>

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

        <Stack gap={vars.spacing[6]}>
          <SearchResultsView
            search={search}
            results={results}
            title={title}
            empty={
              <EmptyState
                title={text.search.noResultsTitle}
                message={
                  search.query
                    ? fillText(text.search.noResultsMessage, { query: search.query })
                    : text.search.noResultsInCategory
                }
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
          <ReportResults query={search.query} categoryId={search.categoryId} />
        </Stack>

        <FilterDialog open={filtersOpen} count={total} onClose={() => setFiltersOpen(false)}>
          {optionsPanel}
        </FilterDialog>
      </Page>
    </SidebarLayout>
  );
};

// Keeps only the filters the new category offers.
const keepFilters = (filters: Record<string, string[] | undefined>, keys: readonly string[]) =>
  Object.fromEntries(Object.entries(filters).filter(([key]) => keys.includes(key)));
