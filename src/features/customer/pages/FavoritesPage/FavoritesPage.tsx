import { AsyncContent, Button, EmptyState, ItemGrid, Page } from '@/shared/components';
import { routes } from '@/shared/constants';
import { useAsync, useLocale, useSession } from '@/shared/hooks';
import { api } from '@/shared/utils';

// The user's favorite items, newest first. Only signed-in users reach this page.
export const FavoritesPage = () => {
  const { text } = useLocale();
  const { session } = useSession();
  const favoriteIds = session.status === 'signedIn' ? session.user.favoriteIds : [];
  const items = useAsync(() => api.getItemsByIds(favoriteIds), [favoriteIds.join()]);

  return (
    <Page title={text.favorites.title} subtitle={text.favorites.subtitle}>
      <AsyncContent
        state={items}
        empty={
          <EmptyState
            title={text.favorites.emptyTitle}
            message={text.favorites.emptyMessage}
            action={<Button to={routes.search}>{text.home.cta}</Button>}
          />
        }
      >
        {(data) => <ItemGrid items={data} label={text.favorites.title} />}
      </AsyncContent>
    </Page>
  );
};
