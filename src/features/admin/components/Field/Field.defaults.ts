import { vars } from '@/shared/theme';
import type { FieldProps } from './Field.types';

export const fieldDefaults: Required<Pick<FieldProps, 'hideLabel' | 'group' | 'gap'>> = {
  hideLabel: false,
  group: false,
  gap: vars.spacing[2],
};
