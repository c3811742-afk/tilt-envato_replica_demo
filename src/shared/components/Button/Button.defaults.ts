import { vars } from '@/shared/theme';
import type { ButtonProps, ButtonSize, ButtonVariant } from './Button.types';

export const buttonVariants: Record<ButtonVariant, { background: string; color: string; border: string }> = {
  primary: { background: vars.colors.primary, color: vars.colors.onPrimary, border: vars.colors.primary },
  secondary: { background: vars.colors.secondary, color: vars.colors.onSecondary, border: vars.colors.secondary },
  muted: { background: vars.colors.surfaceMuted, color: vars.colors.text, border: vars.colors.surfaceMuted },
  highlight: { background: vars.colors.highlight, color: vars.colors.onHighlight, border: vars.colors.highlight },
  outline: { background: vars.colors.surface, color: vars.colors.text, border: vars.colors.border },
  danger: { background: vars.colors.danger, color: vars.colors.onDanger, border: vars.colors.danger }, // destructive actions
};

export const buttonHeights: Record<ButtonSize, string> = vars.sizes.button.height;

export const buttonDefaults: Required<Pick<ButtonProps, 'variant' | 'size' | 'radius' | 'fullWidth' | 'disabled' | 'type'>> = {
  variant: 'primary',
  size: 'md',
  radius: vars.radii.none,
  fullWidth: false,
  disabled: false,
  type: 'button',
};
