import type { ReactNode } from 'react';

export interface DetailRow {
  label: string;
  value: ReactNode; // text, or e.g. a badge or a link
  autoDirection?: boolean; // the value is user content that may be in either language
}

export interface DetailListProps {
  rows?: DetailRow[];
  dividerColor?: string;
}
