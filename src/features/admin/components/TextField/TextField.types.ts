import type { Direction, Locale } from '@/shared/theme';

export type TextFieldType = 'text' | 'email' | 'search' | 'url' | 'number' | 'date' | 'month' | 'datetime-local';

export interface TextFieldProps {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: TextFieldType;
  multiline?: boolean; // a <textarea> instead of an <input>
  placeholder?: string;
  hint?: string;
  error?: string;
  required?: boolean; // announced to screen readers; validation is done by the form
  disabled?: boolean;
  hideLabel?: boolean;
  autoComplete?: string;
  autoDirection?: boolean; // for text the user may type in either language
  lang?: Locale | string; // the language the text must be written in (e.g. the Arabic half of a two-language field)
  direction?: Direction; // fixes the direction, e.g. 'rtl' for an Arabic-only field on the English page
  min?: string; // for number, date and month fields
  max?: string;
}
