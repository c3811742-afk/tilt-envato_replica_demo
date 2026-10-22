import { vars } from '@/shared/theme';
import type { BrandLogoProps } from './BrandLogo.types';

export const brandLogoDefaults: Required<Pick<BrandLogoProps, 'name' | 'size'>> = {
  name: 'google',
  size: vars.sizes.icon.sm,
};
