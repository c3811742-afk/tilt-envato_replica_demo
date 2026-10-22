import type { ReactNode } from 'react';

export type BadgeVariant = 'neutral' | 'free' | 'premium' | 'highlight' | 'info';

export interface BadgeProps {
  children?: ReactNode;
  variant?: BadgeVariant;
  background?: string; // overrides the variant's background
  color?: string; // overrides the variant's text color
  radius?: string;
}
