import { Card, ContactButton, FaqAccordion, Page, Section, Text } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';

export const FaqPage = () => {
  const { text } = useLocale();

  return (
    <Page title={text.faq.title} subtitle={text.faq.subtitle} contentMaxWidth={vars.sizes.readable.maxWidth}>
      {text.faq.groups.map((group) => (
        <Section key={group.title} title={group.title} variant="h3" gap={vars.spacing[3]}>
          <FaqAccordion entries={group.items} />
        </Section>
      ))}

      <Card as="section" background={vars.colors.surfaceMuted} borderColor={vars.colors.surfaceMuted}>
        <Text as="h2" variant="h3">
          {text.faq.contactTitle}
        </Text>
        <Text color={vars.colors.textMuted}>{text.faq.contactText}</Text>
        <div>
          <ContactButton />
        </div>
      </Card>
    </Page>
  );
};
