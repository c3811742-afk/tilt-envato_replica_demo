import { vars } from '@/shared/theme';
import { withDefaults } from '@/shared/utils';
import { Accordion } from '../Accordion';
import { Text } from '../Text';
import { faqAccordionDefaults } from './FaqAccordion.defaults';
import type { FaqAccordionProps } from './FaqAccordion.types';

// Questions and answers as an accordion (home page preview, FAQ page, pricing, AI Studio).
export const FaqAccordion = (props: FaqAccordionProps) => {
  const { entries } = withDefaults(faqAccordionDefaults, props);
  return (
    <Accordion
      items={entries.map((entry) => ({
        id: entry.question,
        title: entry.question,
        content: <Text color={vars.colors.textMuted}>{entry.answer}</Text>,
      }))}
    />
  );
};
