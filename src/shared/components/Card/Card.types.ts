import type { ReactNode } from 'react';

export interface CardProps {
  children?: ReactNode;
  title?: string; // a heading at the top of the card, which also names it
  as?: 'div' | 'article' | 'section' | 'li';
  to?: string; // app path (from routes.ts): the whole card is a link
  padding?: string;
  gap?: string; // space between the card's children
  background?: string;
  color?: string;
  borderColor?: string;
  radius?: string;
  interactive?: boolean; // lifts and casts the hard shadow on hover (on by default for links)
}
