import type { ReactNode } from 'react';

export interface GridProps {
  children?: ReactNode; // list items (<li>) when rendered as a list
  as?: 'div' | 'ul' | 'ol' | 'dl';
  minColumnWidth?: string; // columns are added as the screen gets wider
  gap?: string;
  stretch?: boolean; // few items stretch to fill the row instead of keeping empty columns
  columns?: number; // a fixed number of equal columns instead (e.g. two buttons side by side)
  ariaLabel?: string;
}
