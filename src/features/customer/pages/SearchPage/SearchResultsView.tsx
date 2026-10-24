import type { ReactNode } from 'react';
import { AsyncContent, ItemGrid, Pagination, Stack, TrackList } from '@/shared/components';
import { catalog } from '@/shared/constants';
import { useStoredValue, type PagedAsyncResult, type useSearchFilters } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import type { Item, SearchResults } from '@/shared/types';
import { preferences } from '@/shared/utils';
import { DownloadButton } from './DownloadButton';
import { FontResults } from './FontResults';
import { LoadMore, ItemSaveActions } from '@/features/customer/components';

interface SearchResultsViewProps {
  search: ReturnType<typeof useSearchFilters>;
  results: PagedAsyncResult<Item, SearchResults>;
  title: string;
  empty: ReactNode;
}

// The results, shown the way their kind of item reads best: tracks for audio, samples for fonts, cards for the rest.
// Then the next page: loaded as the user scrolls, or page links.
export const SearchResultsView = ({ search, results, title, empty }: SearchResultsViewProps) => {
  const [gridSize] = useStoredValue(preferences.gridSize);
  const [pagingMode] = useStoredValue(preferences.pagingMode);
  const tracks = search.categoryId === 'music' || search.categoryId === 'soundEffects' || Boolean(search.soundsLike);

  return (
    <AsyncContent state={results.state} empty={empty}>
      {(page) => (
        <Stack gap={vars.spacing[6]}>
          {tracks ? (
            <TrackList
              items={page.items}
              label={title}
              actionsFor={(item) => (
                <>
                  <DownloadButton item={item} />
                  <ItemSaveActions item={item} />
                </>
              )}
            />
          ) : search.categoryId === 'fonts' ? (
            <FontResults items={page.items} label={title} gridSize={gridSize} />
          ) : (
            <ItemGrid items={page.items} size={gridSize} label={title} />
          )}
          {pagingMode === 'pages' ? (
            <Pagination
              page={search.page}
              pageCount={Math.ceil(page.total / catalog.searchPageSize)}
              pathFor={(number) => search.pathWith({ page: number })}
            />
          ) : (
            <LoadMore {...results} />
          )}
        </Stack>
      )}
    </AsyncContent>
  );
};

