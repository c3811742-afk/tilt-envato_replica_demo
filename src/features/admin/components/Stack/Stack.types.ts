import type { ReactNode } from 'react';

export interface StackProps {
  children?: ReactNode;
  as?: 'div' | 'section' | 'ul';
  gap?: string; // space between children
  align?: 'stretch' | 'start' | 'center' | 'end';
}
