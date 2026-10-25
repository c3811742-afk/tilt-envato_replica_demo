import { vars } from '@/shared/theme';
import type { AccordionProps } from './Accordion.types';

export const accordionDefaults: Required<Pick<AccordionProps, 'items' | 'exclusive' | 'borderColor'>> = {
  items: [],
  exclusive: true,
  borderColor: vars.colors.border,
};
