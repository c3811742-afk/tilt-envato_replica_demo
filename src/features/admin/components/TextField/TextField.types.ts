export type TextFieldType = 'text' | 'email' | 'search' | 'url';

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
}
