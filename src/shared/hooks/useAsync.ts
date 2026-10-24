import { useCallback, useEffect, useState, type DependencyList } from 'react';
import { isEmptyData, safeAsync, type Result } from '@/shared/utils';

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: unknown }
  | { status: 'empty'; data: T }
  | { status: 'success'; data: T };

// retry: loads again from scratch (shows the loading state).
export type AsyncResult<T> = AsyncState<T> & { retry: () => void };

// update: replaces the data with a newer copy the caller already has (e.g. returned by a save), without reloading.
export type UpdatableAsyncResult<T> = AsyncResult<T> & { update: (data: T) => void };

// The state a finished call puts a view in: error, empty or success.
export const toAsyncState = <T>(result: Result<T>, isEmpty: (data: T) => boolean): AsyncState<T> => {
  if (!result.ok) return { status: 'error', error: result.error };
  return { status: isEmpty(result.data) ? 'empty' : 'success', data: result.data };
};

// Loads data and tracks loading / error / empty / success. Render the result with <AsyncContent>.
// `deps` works like useEffect's: the call reruns when they change.
export const useAsync = <T>(
  load: () => Promise<T>,
  deps: DependencyList,
  isEmpty: (data: T) => boolean = isEmptyData,
): UpdatableAsyncResult<T> => {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true; // ignore results that arrive after deps changed or the component unmounted
    setState({ status: 'loading' });
    safeAsync(load).then((result) => {
      if (active) setState(toAsyncState(result, isEmpty));
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reruns on the caller's deps, like useEffect
  }, [...deps, attempt]);

  const retry = useCallback(() => setAttempt((count) => count + 1), []);
  const update = useCallback(
    (data: T) => setState({ status: isEmpty(data) ? 'empty' : 'success', data }),
    [isEmpty],
  );

  return { ...state, retry, update };
};
