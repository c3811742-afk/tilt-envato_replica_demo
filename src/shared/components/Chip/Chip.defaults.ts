import { vars } from '@/shared/theme';
import type { ChipProps } from './Chip.types';

export const chipDefaults: Required<Pick<ChipProps, 'selected' | 'background' | 'color' | 'radius'>> = {
  selected: false,
  background: vars.colors.surface,
  color: vars.colors.text,
  radius: vars.radii.pill,
};

export const chipSelected = {
  background: vars.colors.secondary,
  color: vars.colors.onSecondary,
};
