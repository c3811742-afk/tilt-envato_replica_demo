import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react';
import type { Page } from '@/shared/types';
import { safeAsync } from '@/shared/utils';
import { toAsyncState, type AsyncState } from './useAsync';

const isEmptyPage = <T>(page: Page<T>) => page.items.length === 0;

// `P` is the page type: a plain Page, or one with more fields (e.g. search results with filter counts),
// which are kept from the latest page.
export interface PagedAsyncResult<T, P extends Page<T> = Page<T>> {
  state: AsyncState<P> & { retry: () => void }; // first page: render it with <AsyncContent>
  hasMore: boolean;
  loadMore: () => void;
  loadingMore: boolean;
  loadMoreFailed: boolean; // the last "Load more" failed: show a message and let the user try again
}

// Loads a list page by page ("Load more"). The first page shows loading / error / empty / success;
// later pages are appended without hiding what is already on screen.
export const usePagedAsync = <T, P extends Page<T> = Page<T>>(
  loadPage: (offset: number) => Promise<P>,
  deps: DependencyList,
): PagedAsyncResult<T, P> => {
  const [state, setState] = useState<AsyncState<P>>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreFailed, setLoadMoreFailed] = useState(false);
  const generation = useRef(0); // results from an older query are ignored

  useEffect(() => {
    const current = ++generation.current;
    setState({ status: 'loading' });
    setLoadMoreFailed(false);
    setLoadingMore(false);
    safeAsync(() => loadPage(0)).then((result) => {
      if (current === generation.current) setState(toAsyncState(result, isEmptyPage));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reruns on the caller's deps, like useEffect
  }, [...deps, attempt]);

  const loaded = state.status === 'success' ? state.data : null;
  const hasMore = loaded ? loaded.items.length < loaded.total : false;

  const loadMore = useCallback(() => {
    if (!loaded || loadingMore) return;
    const current = generation.current;
    setLoadingMore(true);
    setLoadMoreFailed(false);
    safeAsync(() => loadPage(loaded.items.length)).then((result) => {
      if (current !== generation.current) return;
      setLoadingMore(false);
      if (!result.ok) {
        setLoadMoreFailed(true);
        return;
      }
      setState({
        status: 'success',
        data: { ...result.data, items: [...loaded.items, ...result.data.items] },
      });
    });
  }, [loaded, loadingMore, loadPage]);

  const retry = useCallback(() => setAttempt((count) => count + 1), []);

  return { state: { ...state, retry }, hasMore, loadMore, loadingMore, loadMoreFailed };
};
