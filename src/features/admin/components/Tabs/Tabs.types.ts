import type { ReactNode } from 'react';

export interface TabItem<T extends string> {
  value: T;
  label: string;
}

export interface TabsProps<T extends string> {
  label: string; // accessible name of the tab list, e.g. "Homepage sections"
  tabs: TabItem<T>[];
  value: T; // the selected tab
  onChange?: (value: T) => void;
  children?: ReactNode; // the selected tab's content
  gap?: string; // space between the tab list and the content
}
