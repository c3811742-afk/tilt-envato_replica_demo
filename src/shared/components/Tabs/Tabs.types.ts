import type { ReactNode } from 'react';

export interface Tab<T extends string> {
  value: T;
  label: string;
  content?: ReactNode; // or pass the open tab's content as the Tabs' children
}

export interface TabsProps<T extends string> {
  label?: string; // accessible name of the tab list
  tabs?: Tab<T>[];
  value?: T; // the open tab; the first one when not given
  onChange?: (value: T) => void;
  gap?: string; // between the tab list and the open panel
  children?: ReactNode; // the open tab's content, for tabs that don't carry their own
}
