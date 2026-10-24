import type { ReactNode } from 'react';

export interface StackProps {
  children?: ReactNode;
  as?: 'div' | 'section' | 'ul';
  direction?: 'column' | 'row'; // 'row' puts children side by side, wrapping on small screens (e.g. buttons)
  gap?: string; // space between children
  align?: 'stretch' | 'start' | 'center' | 'end';
}
