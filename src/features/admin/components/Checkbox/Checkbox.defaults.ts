import { vars } from '@/shared/theme';
import type { CheckboxProps } from './Checkbox.types';

export const checkboxDefaults: Required<Pick<CheckboxProps, 'checked' | 'disabled' | 'color'>> = {
  checked: false,
  disabled: false,
  color: vars.colors.primary,
};
