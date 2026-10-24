import { vars } from '@/shared/theme';
import type { SelectProps } from './Select.types';

export const selectDefaults: Required<Pick<SelectProps, 'hideLabel' | 'value' | 'options' | 'disabled' | 'listMaxHeight'>> = {
  hideLabel: false,
  value: '',
  options: [],
  disabled: false,
  listMaxHeight: vars.sizes.suggestions.maxHeight,
};
