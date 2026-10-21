import type { SelectFieldProps } from './SelectField.types';

export const selectFieldDefaults: Required<
  Pick<SelectFieldProps, 'options' | 'value' | 'required' | 'disabled' | 'hideLabel'>
> = {
  options: [],
  value: '',
  required: false,
  disabled: false,
  hideLabel: false,
};
