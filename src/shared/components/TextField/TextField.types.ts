import type { ReactNode } from 'react';

export interface TextFieldProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  id?: string; // generated when not given
  name?: string;
  type?: 'text' | 'email' | 'password' | 'tel';
  inputMode?: 'text' | 'email' | 'numeric' | 'tel';
  placeholder?: string;
  hint?: string; // help text under the field
  error?: string; // shown under the field in place of the hint
  prefix?: string; // fixed text before the value, e.g. the country code "+20"
  endAction?: ReactNode; // a small button at the end of the field, e.g. "Show password"
  direction?: 'auto' | 'ltr'; // 'ltr' for numbers and codes, which read left to right in every language
  maxLength?: number;
  disabled?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
}
