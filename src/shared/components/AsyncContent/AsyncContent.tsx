import { EmptyState } from '../EmptyState';
import { ErrorState } from '../ErrorState';
import { LoadingState } from '../LoadingState';
import type { AsyncContentProps } from './AsyncContent.types';

// Renders the right state for a useAsync result:
// <AsyncContent state={items}>{(data) => <ItemGrid items={data} />}</AsyncContent>
export const AsyncContent = <T,>({ state, children, loading, error, empty, minHeight }: AsyncContentProps<T>) => {
  switch (state.status) {
    case 'loading':
      return loading ?? <LoadingState minHeight={minHeight} />;
    case 'error':
      return error ?? <ErrorState onRetry={state.retry} minHeight={minHeight} />;
    case 'empty':
      return empty ?? <EmptyState minHeight={minHeight} />;
    case 'success':
      return children(state.data);
  }
};
