import { phoneCountryCode } from '@/shared/constants';
import type { PhoneFieldProps } from './PhoneField.types';

export const phoneFieldDefaults: Required<Pick<PhoneFieldProps, 'prefix' | 'autoComplete' | 'direction'>> = {
  prefix: phoneCountryCode,
  autoComplete: 'tel-national',
  direction: 'ltr', // numbers read left to right in every language
};
