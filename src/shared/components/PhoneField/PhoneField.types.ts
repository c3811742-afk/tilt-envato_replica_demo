import type { TextFieldProps } from '../TextField';

// A TextField set up for Egyptian mobile numbers; everything except the input type can be set.
export type PhoneFieldProps = Omit<TextFieldProps, 'type' | 'inputMode'>;
