import type { TextFieldProps } from './TextField.types';

export const textFieldDefaults: Required<
  Pick<TextFieldProps, 'value' | 'type' | 'multiline' | 'required' | 'disabled' | 'hideLabel' | 'autoDirection'>
> = {
  value: '',
  type: 'text',
  multiline: false,
  required: false,
  disabled: false,
  hideLabel: false,
  autoDirection: false,
};
