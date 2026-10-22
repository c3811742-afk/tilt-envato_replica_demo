import type { TextFieldProps } from './TextField.types';

export const textFieldDefaults: Required<
  Pick<TextFieldProps, 'value' | 'type' | 'inputMode' | 'direction' | 'disabled' | 'required' | 'autoFocus' | 'autoComplete'>
> = {
  value: '',
  type: 'text',
  inputMode: 'text',
  direction: 'auto',
  disabled: false,
  required: false,
  autoFocus: false,
  autoComplete: 'off',
};
