import { vars } from '@/shared/theme';
import type { CardProps } from './Card.types';

export const cardDefaults: Required<
  Pick<CardProps, 'as' | 'padding' | 'gap' | 'background' | 'color' | 'borderColor' | 'radius'>
> = {
  as: 'div',
  padding: vars.sizes.card.padding,
  gap: vars.spacing[3],
  background: vars.colors.surface,
  color: vars.colors.text,
  borderColor: vars.colors.border,
  radius: vars.radii.none,
};
