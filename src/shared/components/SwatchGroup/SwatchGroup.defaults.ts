import { vars } from '@/shared/theme';
import type { SwatchGroupProps } from './SwatchGroup.types';

export const swatchGroupDefaults: Required<Pick<SwatchGroupProps<string>, 'options' | 'size' | 'multiple' | 'values'>> = {
  options: [],
  size: vars.sizes.swatch,
  multiple: false,
  values: [],
};
