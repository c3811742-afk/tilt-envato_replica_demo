import { AsyncContent, CollectionCard, Grid, Page } from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { api } from '@/shared/utils';

// Every collection and drop, newest first.
export const CollectionsPage = () => {
  const { text } = useLocale();
  const collections = useAsync(api.getCollections, []);

  return (
    <Page title={text.collections.title} subtitle={text.collections.subtitle}>
      <AsyncContent state={collections}>
        {(data) => (
          <Grid minColumnWidth={vars.sizes.collectionCard.minWidth} ariaLabel={text.collections.title}>
            {data.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} headingLevel="h2" />
            ))}
          </Grid>
        )}
      </AsyncContent>
    </Page>
  );
};
