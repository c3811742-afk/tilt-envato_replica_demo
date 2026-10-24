import { Page, Section, Text } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { fillText, formatDate } from '@/shared/utils';

interface LegalPageProps {
  title: string;
  updatedAt: string; // ISO date
  updatedLabel: string; // e.g. "Last updated {date}"
  sections: readonly { title: string; text: string }[];
}

// A legal document (terms, privacy policy): title, last updated date and short titled sections.
export const LegalPage = ({ title, updatedAt, updatedLabel, sections }: LegalPageProps) => {
  const { locale } = useLocale();

  return (
    <Page
      title={title}
      subtitle={fillText(updatedLabel, { date: formatDate(updatedAt, locale) })}
      contentMaxWidth={vars.sizes.readable.maxWidth}
      gap={vars.spacing[6]}
    >
      {sections.map((section) => (
        <Section key={section.title} title={section.title} variant="h3" gap={vars.spacing[2]}>
          <Text>{section.text}</Text>
        </Section>
      ))}
    </Page>
  );
};
