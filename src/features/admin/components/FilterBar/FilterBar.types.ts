import type { ReactNode } from 'react';

export interface FilterBarProps {
  children?: ReactNode; // search fields, selects, checkboxes
  gap?: string;
  itemMinWidth?: string; // each filter wraps to a new line below this width
}
