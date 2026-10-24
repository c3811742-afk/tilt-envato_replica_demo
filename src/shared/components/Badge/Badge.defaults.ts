import { vars } from '@/shared/theme';
import type { BadgeProps, BadgeVariant } from './Badge.types';

export const badgeVariants: Record<BadgeVariant, { background: string; color: string }> = {
  neutral: { background: vars.colors.surfaceMuted, color: vars.colors.text },
  free: { background: vars.colors.success, color: vars.colors.onSuccess },
  premium: { background: vars.colors.secondary, color: vars.colors.onSecondary },
  highlight: { background: vars.colors.highlight, color: vars.colors.onHighlight },
  info: { background: vars.colors.primary, color: vars.colors.onPrimary },
  success: { background: vars.colors.success, color: vars.colors.onSuccess },
  warning: { background: vars.colors.warning, color: vars.colors.onWarning },
  danger: { background: vars.colors.danger, color: vars.colors.onDanger },
};

export const badgeDefaults: Required<Pick<BadgeProps, 'variant' | 'radius'>> = {
  variant: 'neutral',
  radius: vars.radii.none,
};
