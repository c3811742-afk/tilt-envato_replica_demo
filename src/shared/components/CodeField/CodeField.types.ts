import type { TextFieldProps } from '../TextField';

// A TextField for one-time codes; everything except the input type can be set.
export type CodeFieldProps = Omit<TextFieldProps, 'type' | 'inputMode'> & {
  length?: number; // number of digits; extra characters and non-digits are dropped as the user types
};
