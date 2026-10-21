import { vars } from '@/shared/theme';
import type { BadgeProps, BadgeTone } from './Badge.types';

export const badgeTones: Record<BadgeTone, { background: string; color: string }> = {
  neutral: { background: vars.colors.surfaceMuted, color: vars.colors.text },
  primary: { background: vars.colors.primary, color: vars.colors.onPrimary },
  info: { background: vars.colors.info, color: vars.colors.onInfo },
  success: { background: vars.colors.success, color: vars.colors.onSuccess },
  warning: { background: vars.colors.warning, color: vars.colors.onWarning },
  danger: { background: vars.colors.danger, color: vars.colors.onDanger },
};

export const badgeDefaults: Required<Pick<BadgeProps, 'tone' | 'radius'>> = {
  tone: 'neutral',
  radius: vars.radii.xs,
};
