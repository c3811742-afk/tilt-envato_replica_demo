import { keepDigits, withDefaults } from '@/shared/utils';
import { TextField } from '../TextField';
import { codeFieldDefaults } from './CodeField.defaults';
import type { CodeFieldProps } from './CodeField.types';

// A one-time code input (email verification, password reset): digits only, number keypad on phones.
export const CodeField = (props: CodeFieldProps) => {
  const { length, onChange, ...rest } = withDefaults(codeFieldDefaults, props);
  return <TextField {...rest} inputMode="numeric" onChange={(value) => onChange?.(keepDigits(value, length))} />;
};
