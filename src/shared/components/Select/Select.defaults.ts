import type { SelectProps } from './Select.types';

export const selectDefaults: Required<Pick<SelectProps, 'value' | 'options' | 'disabled'>> = {
  value: '',
  options: [],
  disabled: false,
};
