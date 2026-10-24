import { vars } from '@/shared/theme';
import type { ItemRowProps } from './ItemRow.types';

export const itemRowDefaults: Required<Pick<ItemRowProps, 'items' | 'itemWidth'>> = {
  items: [],
  itemWidth: vars.sizes.itemCard.railWidth,
};
