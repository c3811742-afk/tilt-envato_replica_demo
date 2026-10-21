import { vars } from '@/shared/theme';
import type { ButtonProps, ButtonSize, ButtonVariant } from './Button.types';

export const buttonVariants: Record<ButtonVariant, { background: string; color: string }> = {
  primary: { background: vars.colors.primary, color: vars.colors.onPrimary },
  secondary: { background: vars.colors.secondary, color: vars.colors.onSecondary },
  muted: { background: vars.colors.surfaceMuted, color: vars.colors.text },
  highlight: { background: vars.colors.highlight, color: vars.colors.onHighlight },
  danger: { background: vars.colors.danger, color: vars.colors.onDanger },
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
