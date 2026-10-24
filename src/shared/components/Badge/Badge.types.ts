import type { ReactNode } from 'react';

// success / warning / danger: a status (approved, waiting, rejected), e.g. in the admin's lists.
export type BadgeVariant = 'neutral' | 'free' | 'premium' | 'highlight' | 'info' | 'success' | 'warning' | 'danger';

export interface BadgeProps {
  children?: ReactNode;
  variant?: BadgeVariant;
  background?: string; // overrides the variant's background
  color?: string; // overrides the variant's text color
  radius?: string;
}
