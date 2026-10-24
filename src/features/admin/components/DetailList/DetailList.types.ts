import type { ReactNode } from 'react';

export interface DetailItem {
  label: string;
  value: ReactNode;
}

export interface DetailListProps {
  items?: DetailItem[];
  gap?: string; // space between rows
}
