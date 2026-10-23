import { useParams } from 'react-router';
import { AsyncContent, Button, EmptyState, Grid, ItemGrid, Page, Stack, Text } from '@/shared/components';
import { routes } from '@/shared/constants';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { fillText, libraryApi } from '@/shared/utils';
import { UploadTile } from '@/features/customer/components';

// A collection someone shared by link: anyone can view it (read only).
export const SharedCollectionPage = () => {
  const { text } = useLocale();
  const { shareId = '' } = useParams();
  const shared = useAsync(() => libraryApi.sharedCollection(shareId), [shareId], (data) => data === null);
  const notFound = (
    <EmptyState
      title={text.myCollections.sharedNotFoundTitle}
      message={text.myCollections.sharedNotFoundMessage}
      action={<Button to={routes.home}>{text.common.backToHome}</Button>}
    />
  );

  return (
    <Page>
      <AsyncContent state={shared} empty={notFound}>
        {(data) =>
          data ? (
            <Stack gap={vars.spacing[6]}>
              <Stack gap={vars.spacing[2]}>
                <Text as="h1" variant="h1" autoDirection>
                  {data.collection.name}
                </Text>
                <Text color={vars.colors.textMuted} autoDirection>
                  {fillText(text.myCollections.sharedBy, { name: data.ownerName })}
                </Text>
              </Stack>
              {data.items.length > 0 && <ItemGrid items={data.items} label={data.collection.name} />}
              {data.collection.uploads.length > 0 && (
                <Grid minColumnWidth={vars.sizes.itemCard.minWidth.medium} gap={vars.spacing[4]} ariaLabel={text.myCollections.sources.upload}>
                  {data.collection.uploads.map((file) => (
                    <UploadTile key={file.id} upload={file} />
                  ))}
                </Grid>
              )}
              {data.items.length === 0 && data.collection.uploads.length === 0 && <Text color={vars.colors.textMuted}>{text.myCollections.emptyMessage}</Text>}
            </Stack>
          ) : (
            notFound
          )
        }
      </AsyncContent>
    </Page>
  );
};
