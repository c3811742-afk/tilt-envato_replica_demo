import type { DateRangeFieldProps } from './DateRangeField.types';

export const dateRangeFieldDefaults: Required<Pick<DateRangeFieldProps, 'value' | 'errors' | 'required'>> = {
  value: {},
  errors: {},
  required: false,
};
