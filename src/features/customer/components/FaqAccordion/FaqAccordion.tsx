import { Accordion, Text } from '@/shared/components';
import { vars } from '@/shared/theme';

export interface FaqEntry {
  question: string;
  answer: string;
}

// Questions and answers from the text files, as an accordion (home page preview and FAQ page).
export const FaqAccordion = ({ entries }: { entries: FaqEntry[] }) => (
  <Accordion
    items={entries.map((entry) => ({
      id: entry.question,
      title: entry.question,
      content: <Text color={vars.colors.textMuted}>{entry.answer}</Text>,
    }))}
  />
);
