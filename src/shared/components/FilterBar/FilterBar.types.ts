import type { ReactNode } from 'react';

export interface FilterBarProps {
  children?: ReactNode; // search fields, selects, checkboxes
  label?: string; // the group's accessible name, e.g. "Filters"
  gap?: string;
  itemMinWidth?: string; // each filter wraps to a new line below this width
  wideFirst?: boolean; // the first filter (usually the search) takes twice the room of the others
}
