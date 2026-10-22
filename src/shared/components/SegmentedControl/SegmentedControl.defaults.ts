import { vars } from '@/shared/theme';
import type { SegmentedControlProps } from './SegmentedControl.types';

export const segmentHeights = vars.sizes.segment.height;

export const segmentedControlDefaults: Required<
  Pick<SegmentedControlProps<string>, 'options' | 'size' | 'fullWidth' | 'background' | 'color' | 'selectedBackground' | 'selectedColor'>
> = {
  options: [],
  size: 'md',
  fullWidth: false,
  background: vars.colors.surface,
  color: vars.colors.text,
  selectedBackground: vars.colors.secondary,
  selectedColor: vars.colors.onSecondary,
};
