import type { MouseEventHandler, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'muted' | 'highlight' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  background?: string; // overrides the variant's background
  color?: string; // overrides the variant's text color
  radius?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: MouseEventHandler<HTMLButtonElement>;
}
