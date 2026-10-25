import { useParams } from 'react-router';
import { AsyncContent, Badge, Button, Container, EmptyState, ItemGrid, Page, Stack, Text, TextLink } from '@/shared/components';
import { creatorPath, routes } from '@/shared/constants';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { api, fillText, formatDate } from '@/shared/utils';

// One collection or drop: what it is, who it's from, and its items.
export const CollectionPage = () => {
  const { id = '' } = useParams();
  const { text, locale } = useLocale();
  const collection = useAsync(() => api.getCollection(id), [id]);

  return (
    <AsyncContent
      state={collection}
      empty={
        <Container>
          <EmptyState
            title={text.collections.notFoundTitle}
            message={text.collections.notFoundMessage}
            action={<Button to={routes.collections}>{text.collections.backToCollections}</Button>}
          />
        </Container>
      }
    >
      {(data) =>
        data && (
          <Page
            backTo={routes.collections}
            backLabel={text.collections.backToCollections}
            title={data.title[locale]}
            subtitle={data.description[locale]}
            headerContent={
              <Stack direction="row" wrap align="center" gap={vars.spacing[3]}>
                <Badge variant={data.kind === 'drop' ? 'highlight' : 'neutral'}>{text.collections.kinds[data.kind]}</Badge>
                {data.creator ? (
                  <TextLink to={creatorPath(data.creator.id)} variant="bodySm">
                    {fillText(text.collections.byCreator, { creator: data.creator.name })}
                  </TextLink>
                ) : (
                  <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
                    {data.partner ? fillText(text.collections.byPartner, { partner: data.partner }) : text.collections.byTeam}
                  </Text>
                )}
                <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
                  {formatDate(data.publishedAt, locale)}
                </Text>
              </Stack>
            }
          >
            <ItemGrid items={data.items} label={data.title[locale]} />
          </Page>
        )
      }
    </AsyncContent>
  );
};
