import { vars } from '@/shared/theme';
import type { ItemGridProps } from './ItemGrid.types';

export const itemGridDefaults: Required<Pick<ItemGridProps, 'items' | 'size' | 'gap'>> = {
  items: [],
  size: 'medium',
  gap: vars.spacing[5],
};
