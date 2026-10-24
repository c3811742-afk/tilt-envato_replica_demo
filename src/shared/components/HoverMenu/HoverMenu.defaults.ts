import { vars } from '@/shared/theme';
import type { HoverMenuProps } from './HoverMenu.types';

export const hoverMenuDefaults: Required<Pick<HoverMenuProps, 'width' | 'align' | 'closeDelayMs'>> = {
  width: vars.sizes.dropdown.width,
  align: 'start',
  closeDelayMs: 150,
};
