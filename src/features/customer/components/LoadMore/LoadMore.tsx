import { Button, Spinner, Stack, Text } from '@/shared/components';
import { useInView, useLocale, type PagedAsyncResult } from '@/shared/hooks';
import { vars } from '@/shared/theme';

type LoadMoreProps = Pick<PagedAsyncResult<unknown>, 'hasMore' | 'loadMore' | 'loadingMore' | 'loadMoreFailed'>;

// Infinite scroll: the next items load when the end of the list comes into view.
// If loading fails, the user can try again with a button.
export const LoadMore = ({ hasMore, loadMore, loadingMore, loadMoreFailed }: LoadMoreProps) => {
  const { text } = useLocale();
  const sentinel = useInView<HTMLDivElement>(loadMore, hasMore && !loadingMore && !loadMoreFailed);
  if (!hasMore) return null;

  return (
    <Stack align="center" gap={vars.spacing[3]}>
      <div ref={sentinel} />
      {loadMoreFailed ? (
        <>
          <Text align="center" color={vars.colors.danger}>
            {text.search.loadMoreFailed}
          </Text>
          <Button variant="outline" onClick={loadMore}>
            {text.common.tryAgain}
          </Button>
        </>
      ) : (
        <Spinner />
      )}
    </Stack>
  );
};
