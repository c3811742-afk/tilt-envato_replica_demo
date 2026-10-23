import { vars } from '@/shared/theme';
import type { AvatarProps } from './Avatar.types';

// Initials size for each avatar size.
export const avatarFontSizes: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: vars.typography.fontSize.xs,
  md: vars.typography.fontSize.md,
  lg: vars.typography.fontSize.xl,
  xl: vars.typography.fontSize.xxl,
};

export const avatarDefaults: Required<Pick<AvatarProps, 'name' | 'accent' | 'size'>> = {
  name: '',
  accent: 'royalBlue',
  size: 'md',
};
