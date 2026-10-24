import { vars } from '@/shared/theme';
import type { ScrollRowProps } from './ScrollRow.types';

export const scrollRowDefaults: Required<Pick<ScrollRowProps, 'children' | 'itemWidth' | 'gap'>> = {
  children: [],
  itemWidth: vars.sizes.itemCard.railWidth,
  gap: vars.spacing[4],
};
