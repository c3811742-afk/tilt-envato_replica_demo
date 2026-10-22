import { AsyncContent, Button, EmptyState, ItemGrid, Page } from '@/shared/components';
import { routes } from '@/shared/constants';
import { useAsync, useLocale, useSession } from '@/shared/hooks';
import { api } from '@/shared/utils';

// The items the user saved, newest first. Only signed-in users reach this page.
export const SavedPage = () => {
  const { text } = useLocale();
  const { session } = useSession();
  const savedIds = session.status === 'signedIn' ? session.user.savedItemIds : [];
  const items = useAsync(() => api.getItemsByIds(savedIds), [savedIds.join()]);

  return (
    <Page title={text.saved.title} subtitle={text.saved.subtitle}>
      <AsyncContent
        state={items}
        empty={
          <EmptyState
            title={text.saved.emptyTitle}
            message={text.saved.emptyMessage}
            action={<Button to={routes.search}>{text.home.cta}</Button>}
          />
        }
      >
        {(data) => <ItemGrid items={data} label={text.saved.title} />}
      </AsyncContent>
    </Page>
  );
};
