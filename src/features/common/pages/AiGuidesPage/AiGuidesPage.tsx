import { Button, Card, Page, Stack, Text } from '@/shared/components';
import { routes } from '@/shared/constants';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';

// "Prompt guides": how to describe what you want, per kind of tool, with examples. Open to everyone.
export const AiGuidesPage = () => {
  const { text } = useLocale();

  return (
    <Page title={text.ai.guidesTitle} subtitle={text.ai.guidesSubtitle} contentMaxWidth={vars.sizes.readable.maxWidth} gap={vars.spacing[6]}>
      {text.ai.guideList.map((guide) => (
        <Card key={guide.title} as="section" gap={vars.spacing[3]}>
          <Text as="h2" variant="h3">
            {guide.title}
          </Text>
          <Text>{guide.text}</Text>
          <Text as="h3" variant="label" color={vars.colors.textMuted}>
            {text.ai.guideExamples}
          </Text>
          <Stack as="ul" gap={vars.spacing[2]}>
            {guide.examples.map((example) => (
              <li key={example}>
                <Text variant="bodySm">{example}</Text>
              </li>
            ))}
          </Stack>
        </Card>
      ))}
      <div>
        <Button to={routes.ai}>{text.ai.title}</Button>
      </div>
    </Page>
  );
};
