import type { ReactNode } from 'react';

export interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
}

export interface AccordionProps {
  items?: AccordionItem[];
  exclusive?: boolean; // opening one item closes the others
  defaultOpenId?: string;
  borderColor?: string;
}
