import type { TextFieldProps } from '../TextField';

// A TextField set up for email addresses; everything except the input type can be set.
export type EmailFieldProps = Omit<TextFieldProps, 'type' | 'inputMode'>;
