import type { ReactNode } from 'react';

export interface Tab<T extends string> {
  value: T;
  label: string;
  content: ReactNode;
}

export interface TabsProps<T extends string> {
  label?: string; // accessible name of the tab list
  tabs?: Tab<T>[];
  value?: T; // the open tab; the first one when not given
  onChange?: (value: T) => void;
  gap?: string; // between the tab list and the open panel
}
