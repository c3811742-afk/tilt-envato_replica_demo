import { vars } from '@/shared/theme';
import type { MenuProps } from './Menu.types';

export const menuDefaults: Required<Pick<MenuProps, 'icon' | 'items' | 'columns' | 'width' | 'columnsWidth'>> = {
  icon: 'more',
  items: [],
  columns: false,
  width: vars.sizes.menu.width,
  columnsWidth: vars.sizes.menu.columnsWidth,
};
