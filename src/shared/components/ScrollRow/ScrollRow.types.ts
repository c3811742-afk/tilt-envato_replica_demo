import type { ReactNode } from 'react';

export interface ScrollRowProps {
  children?: ReactNode[]; // each child becomes one item in the row
  itemWidth?: string;
  gap?: string;
  label?: string; // accessible name of the list
}
