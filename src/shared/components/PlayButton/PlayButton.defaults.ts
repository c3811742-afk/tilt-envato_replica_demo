import { vars } from '@/shared/theme';
import type { PlayButtonProps } from './PlayButton.types';

export const playButtonSizes: Record<NonNullable<PlayButtonProps['size']>, { button: string; icon: string }> = {
  sm: { button: vars.sizes.tapTarget, icon: vars.sizes.icon.sm },
  md: { button: vars.sizes.tapTarget, icon: vars.sizes.icon.md },
  lg: { button: vars.sizes.avatar.xl, icon: vars.sizes.icon.lg },
};

export const playButtonVariants: Record<NonNullable<PlayButtonProps['variant']>, { background: string; color: string }> = {
  primary: { background: vars.colors.primary, color: vars.colors.onPrimary },
  surface: { background: vars.colors.surface, color: vars.colors.text },
};

export const playButtonDefaults: Required<Pick<PlayButtonProps, 'status' | 'size' | 'variant'>> = {
  status: 'idle',
  size: 'sm',
  variant: 'surface',
};
