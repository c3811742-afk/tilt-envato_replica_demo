import { vars } from '@/shared/theme';
import type { GridProps } from './Grid.types';

export const gridDefaults: Required<Pick<GridProps, 'as' | 'minColumnWidth' | 'gap' | 'stretch'>> = {
  as: 'ul',
  minColumnWidth: vars.sizes.card.minWidth,
  gap: vars.spacing[4],
  stretch: false,
};
