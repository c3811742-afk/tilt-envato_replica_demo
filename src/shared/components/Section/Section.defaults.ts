import { vars } from '@/shared/theme';
import type { SectionProps } from './Section.types';

export const sectionDefaults: Required<Pick<SectionProps, 'gap'>> = {
  gap: vars.spacing[5],
};
