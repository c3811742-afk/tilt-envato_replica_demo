import { vars } from '@/shared/theme';
import type { ItemCoverProps } from './ItemCover.types';

export const coverShapes = ['circle', 'square', 'arch'] as const;

export const itemCoverDefaults: Required<Pick<ItemCoverProps, 'accent' | 'icon' | 'showTitle' | 'seed' | 'aspectRatio' | 'previewOnHover' | 'fill'>> = {
  accent: 'royalBlue',
  icon: 'layers',
  showTitle: false,
  seed: '',
  aspectRatio: vars.sizes.aspectRatio.video,
  previewOnHover: false,
  fill: false,
};
