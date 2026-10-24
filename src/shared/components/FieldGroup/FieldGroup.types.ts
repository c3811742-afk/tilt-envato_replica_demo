import type { ReactNode } from 'react';

export interface FieldGroupProps {
  label: string; // the group's name, e.g. "Plans" or "Reasons"
  children?: ReactNode; // the controls: checkboxes, or several fields that belong together
  hint?: string; // help text under the group
  error?: string; // shown under the group in place of the hint
  gap?: string; // space between the label, the controls and the message
}
