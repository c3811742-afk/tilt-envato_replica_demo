import type { PasswordFieldProps } from './PasswordField.types';

export const passwordFieldDefaults: Required<Pick<PasswordFieldProps, 'autoComplete' | 'direction'>> = {
  autoComplete: 'current-password', // 'new-password' on sign-up and reset forms
  direction: 'ltr', // passwords are typed left to right in every language
};
