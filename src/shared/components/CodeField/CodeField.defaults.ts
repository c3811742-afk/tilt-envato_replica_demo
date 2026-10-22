import { auth } from '@/shared/constants';
import type { CodeFieldProps } from './CodeField.types';

export const codeFieldDefaults: Required<Pick<CodeFieldProps, 'length' | 'autoComplete' | 'direction'>> = {
  length: auth.codeLength,
  autoComplete: 'one-time-code', // lets phones offer the code from a message
  direction: 'ltr',
};
