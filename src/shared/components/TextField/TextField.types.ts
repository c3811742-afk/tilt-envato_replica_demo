import type { ReactNode } from 'react';

export interface TextFieldProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  id?: string; // generated when not given
  name?: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'date' | 'search' | 'url' | 'number' | 'month' | 'datetime-local'; // 'date' opens the device's calendar
  inputMode?: 'text' | 'email' | 'numeric' | 'tel';
  placeholder?: string;
  hint?: string; // help text under the field
  error?: string; // shown under the field in place of the hint
  prefix?: string; // fixed text before the value, e.g. the country code "+20"
  endAction?: ReactNode; // a small button at the end of the field, e.g. "Show password"
  direction?: 'auto' | 'ltr' | 'rtl'; // 'ltr' for numbers and codes, which read left to right in every language; 'rtl' for an Arabic-only field
  lang?: string; // the language the text must be written in (e.g. the Arabic half of a two-language field)
  hideLabel?: boolean; // the label is read by screen readers only (e.g. a search box whose placeholder says what it is)
  maxLength?: number;
  rows?: number; // more than 1: a multi-line field (e.g. a message, a list of links)
  min?: string; // earliest date (YYYY-MM-DD) for a date field, or the smallest number
  max?: string; // latest date for a date field, or the largest number
  disabled?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
}
