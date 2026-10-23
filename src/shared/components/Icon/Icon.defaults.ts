import { vars } from '@/shared/theme';
import type { IconProps } from './Icon.types';

export const iconViewBox = '0 0 24 24'; // the grid every icon in the registry is drawn on
export const iconStroke = {
  width: 2, // in viewBox units, so it scales with the icon
  linecap: 'square', // hard ends and corners, like the rest of the brand
  linejoin: 'miter',
} as const;

export const iconDefaults: Required<Pick<IconProps, 'name' | 'size' | 'color' | 'filled'>> = {
  name: 'info',
  size: vars.sizes.icon.md,
  color: 'currentColor',
  filled: false,
};
