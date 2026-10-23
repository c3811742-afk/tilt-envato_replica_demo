import { useParams } from 'react-router';
import { AsyncContent, Button, EmptyState, Page, Section, Stack, Text, TextLink } from '@/shared/components';
import { helpArticlePath, routes } from '@/shared/constants';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { contentApi } from '@/shared/utils';
import { ContactSupport } from './HelpCenterPage';

// One Help Center article, with others on the same topic.
export const HelpArticlePage = () => {
  const { text, locale } = useLocale();
  const { id = '' } = useParams();
  const content = useAsync(async () => ({ article: await contentApi.getHelpArticle(id), all: await contentApi.getHelpArticles() }), [id], ({ article }) => article === null);

  return (
    <Page contentMaxWidth={vars.sizes.readable.maxWidth}>
      <AsyncContent
        state={content}
        empty={<EmptyState title={text.help.notFoundTitle} message={text.help.notFoundMessage} action={<Button to={routes.help}>{text.help.back}</Button>} />}
      >
        {({ article, all }) =>
          article && (
            <Stack gap={vars.spacing[6]}>
              <TextLink to={routes.help} variant="bodySm">
                {text.help.back}
              </TextLink>
              <Stack gap={vars.spacing[3]}>
                <Text as="h1" variant="h1">
                  {article.title[locale]}
                </Text>
                {article.body[locale].map((paragraph) => (
                  <Text key={paragraph}>{paragraph}</Text>
                ))}
              </Stack>
              <Section title={text.help.related} variant="h4" gap={vars.spacing[2]}>
                <Stack as="ul" gap={vars.spacing[2]}>
                  {all
                    .filter((other) => other.topic === article.topic && other.id !== article.id)
                    .map((other) => (
                      <li key={other.id}>
                        <TextLink to={helpArticlePath(other.id)}>{other.title[locale]}</TextLink>
                      </li>
                    ))}
                </Stack>
              </Section>
              <ContactSupport />
            </Stack>
          )
        }
      </AsyncContent>
    </Page>
  );
};
