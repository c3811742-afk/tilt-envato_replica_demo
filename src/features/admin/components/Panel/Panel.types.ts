import type { ReactNode } from 'react';

export interface PanelProps {
  children?: ReactNode;
  title?: string; // shown as the panel heading and used as its accessible name
  as?: 'section' | 'div' | 'aside';
  padding?: string;
  background?: string;
  borderColor?: string;
}
