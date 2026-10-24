import { vars } from '@/shared/theme';
import type { FilterBarProps } from './FilterBar.types';

export const filterBarDefaults: Required<Pick<FilterBarProps, 'gap' | 'itemMinWidth'>> = {
  gap: vars.spacing[4],
  itemMinWidth: vars.sizes.card.minWidth,
};
