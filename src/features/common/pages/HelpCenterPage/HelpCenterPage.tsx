import { useState } from 'react';
import { AsyncContent, Button, Card, Grid, Page, Section, Stack, Text, TextField, TextLink } from '@/shared/components';
import { helpArticlePath, helpTopics, learnGuidePath, routes } from '@/shared/constants';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { contentApi, fillText, formatNumber, matchesText } from '@/shared/utils';

// "Help Center": articles by topic (licensing, collections, search, AI), searchable, with the Learn guides
// and a way to contact support. Open to everyone.
export const HelpCenterPage = () => {
  const { text, locale } = useLocale();
  const [query, setQuery] = useState('');
  const content = useAsync(async () => ({ articles: await contentApi.getHelpArticles(), guides: await contentApi.getLearnGuides() }), []);

  return (
    <Page title={text.help.title} subtitle={text.help.subtitle} gap={vars.spacing[7]}>
      <TextField label={text.help.search} value={query} onChange={setQuery} />
      <AsyncContent state={content}>
        {({ articles, guides }) => {
          const shown = articles.filter((article) => matchesText(query, article.title[locale], article.summary[locale], ...article.body[locale]));
          return (
            <Stack gap={vars.spacing[7]}>
              {shown.length === 0 && <Text color={vars.colors.textMuted}>{fillText(text.help.noMatch, { query })}</Text>}
              {helpTopics.map((topic) => {
                const inTopic = shown.filter((article) => article.topic === topic);
                return inTopic.length === 0 ? null : (
                  <Section key={topic} title={text.help.topics[topic]} variant="h3" gap={vars.spacing[3]}>
                    <Stack as="ul" gap={vars.spacing[2]}>
                      {inTopic.map((article) => (
                        <li key={article.id}>
                          <TextLink to={helpArticlePath(article.id)} variant="title">
                            {article.title[locale]}
                          </TextLink>
                          <Text variant="bodySm" color={vars.colors.textMuted}>
                            {article.summary[locale]}
                          </Text>
                        </li>
                      ))}
                    </Stack>
                  </Section>
                );
              })}
              {!query.trim() && (
                <Section title={text.learn.title} subtitle={text.learn.subtitle} actionLabel={text.learn.viewAll} actionTo={routes.learn}>
                  <Grid minColumnWidth={vars.sizes.card.minWidth} gap={vars.spacing[4]} ariaLabel={text.learn.title}>
                    {guides.map((guide) => (
                      <li key={guide.id}>
                        <Card to={learnGuidePath(guide.id)} gap={vars.spacing[2]}>
                          <Text as="h3" variant="h4">
                            {guide.title[locale]}
                          </Text>
                          <Text variant="bodySm" color={vars.colors.textMuted}>
                            {fillText(text.learn.minutes, { count: formatNumber(guide.minutes, locale) })}
                          </Text>
                        </Card>
                      </li>
                    ))}
                  </Grid>
                </Section>
              )}
            </Stack>
          );
        }}
      </AsyncContent>
      <ContactSupport />
    </Page>
  );
};

// "Still need help?" with the way to reach the support team.
export const ContactSupport = () => {
  const { text } = useLocale();
  return (
    <Card gap={vars.spacing[3]}>
      <Text as="h2" variant="h4">
        {text.help.stillNeedHelp}
      </Text>
      <Text color={vars.colors.textMuted}>{text.help.contactText}</Text>
      <div>
        <Button to={routes.support}>{text.nav.support}</Button>
      </div>
    </Card>
  );
};
