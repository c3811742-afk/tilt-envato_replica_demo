import type { TextFieldProps } from '../TextField';

// A TextField for passwords; everything except the input type can be set.
export type PasswordFieldProps = Omit<TextFieldProps, 'type' | 'inputMode' | 'endAction' | 'prefix'>;
