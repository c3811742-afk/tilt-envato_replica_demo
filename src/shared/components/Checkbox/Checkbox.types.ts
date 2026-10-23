import type { ReactNode } from 'react';

export interface CheckboxProps {
  label?: ReactNode; // may contain a link, e.g. "I agree to the terms and conditions"
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  error?: string; // shown under the checkbox
  id?: string; // generated when not given
  disabled?: boolean;
}
