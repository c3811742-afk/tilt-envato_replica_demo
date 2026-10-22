import { vars } from '@/shared/theme';
import type { SelectProps } from './Select.types';

export const selectDefaults: Required<Pick<SelectProps, 'value' | 'options' | 'disabled' | 'listMaxHeight'>> = {
  value: '',
  options: [],
  disabled: false,
  listMaxHeight: vars.sizes.suggestions.maxHeight,
};
