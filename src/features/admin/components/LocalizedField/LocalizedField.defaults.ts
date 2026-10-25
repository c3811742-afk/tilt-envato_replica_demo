import type { LocalizedFieldProps } from './LocalizedField.types';

export const localizedFieldDefaults: Required<Pick<LocalizedFieldProps, 'value' | 'multiline' | 'errors' | 'required'>> =
  {
    value: { en: '', ar: '' },
    multiline: false,
    errors: {},
    required: false,
  };
