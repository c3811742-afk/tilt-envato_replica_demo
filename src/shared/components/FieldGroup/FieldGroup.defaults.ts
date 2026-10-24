import { vars } from '@/shared/theme';
import type { FieldGroupProps } from './FieldGroup.types';

export const fieldGroupDefaults: Required<Pick<FieldGroupProps, 'gap'>> = {
  gap: vars.spacing[2], // the same as a TextField's label and input
};
