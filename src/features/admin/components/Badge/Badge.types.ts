import type { ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'primary' | 'info' | 'success' | 'warning' | 'danger';

export interface BadgeProps {
  children?: ReactNode;
  tone?: BadgeTone;
  background?: string; // overrides the tone's background
  color?: string; // overrides the tone's text color
  radius?: string;
}
