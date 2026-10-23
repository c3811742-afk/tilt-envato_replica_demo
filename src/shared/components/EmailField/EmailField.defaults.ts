import type { EmailFieldProps } from './EmailField.types';

export const emailFieldDefaults: Required<Pick<EmailFieldProps, 'autoComplete' | 'direction'>> = {
  autoComplete: 'email',
  direction: 'ltr', // addresses are written left to right in every language
};
