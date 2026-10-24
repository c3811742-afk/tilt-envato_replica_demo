import { useParams } from 'react-router';
import { AsyncContent, Button, Card, EmptyState, Grid, Page, Stack, Text } from '@/shared/components';
import { learnGuidePath, routes } from '@/shared/constants';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { contentApi, fillText, formatNumber } from '@/shared/utils';

// "Learn": step-by-step guides on licensing, collections, search and AI Studio. Open to everyone.
export const LearnPage = () => {
  const { text, locale } = useLocale();
  const guides = useAsync(contentApi.getLearnGuides, []);

  return (
    <Page title={text.learn.title} subtitle={text.learn.subtitle}>
      <AsyncContent state={guides}>
        {(data) => (
          <Grid minColumnWidth={vars.sizes.card.minWidth} gap={vars.spacing[4]} ariaLabel={text.learn.title}>
            {data.map((guide) => (
              <li key={guide.id}>
                <Card to={learnGuidePath(guide.id)} gap={vars.spacing[2]}>
                  <Text as="span" variant="label" color={vars.colors.textMuted}>
                    {text.help.topics[guide.topic]}
                  </Text>
                  <Text as="h2" variant="h4">
                    {guide.title[locale]}
                  </Text>
                  <Text color={vars.colors.textMuted}>{guide.summary[locale]}</Text>
                  <Text variant="bodySm">{fillText(text.learn.minutes, { count: formatNumber(guide.minutes, locale) })}</Text>
                </Card>
              </li>
            ))}
          </Grid>
        )}
      </AsyncContent>
    </Page>
  );
};

// One guide: its steps in order.
export const LearnGuidePage = () => {
  const { text, locale } = useLocale();
  const { id = '' } = useParams();
  const guide = useAsync(() => contentApi.getLearnGuide(id), [id], (data) => data === null);

  return (
    <Page contentMaxWidth={vars.sizes.readable.maxWidth} backTo={routes.learn} backLabel={text.learn.back}>
      <AsyncContent
        state={guide}
        empty={<EmptyState title={text.learn.notFoundTitle} message={text.learn.notFoundMessage} action={<Button to={routes.learn}>{text.learn.back}</Button>} />}
      >
        {(data) =>
          data && (
            <Stack gap={vars.spacing[5]}>
              <Stack gap={vars.spacing[2]}>
                <Text as="h1" variant="h1">
                  {data.title[locale]}
                </Text>
                <Text color={vars.colors.textMuted}>{data.summary[locale]}</Text>
              </Stack>
              <Text as="h2" variant="h4">
                {text.learn.steps}
              </Text>
              <Stack as="ol" gap={vars.spacing[3]}>
                {data.steps[locale].map((step, index) => (
                  <Card key={step} as="li" padding={vars.spacing[4]}>
                    <Stack direction="row" align="flex-start" gap={vars.spacing[3]}>
                      <Text as="span" variant="h4" color={vars.colors.primary}>
                        {formatNumber(index + 1, locale)}
                      </Text>
                      <Text>{step}</Text>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Stack>
          )
        }
      </AsyncContent>
    </Page>
  );
};
