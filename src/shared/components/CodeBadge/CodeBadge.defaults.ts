import { vars } from '@/shared/theme';
import type { CodeBadgeProps } from './CodeBadge.types';

export const codeBadgeSizes = {
  md: vars.typography.fontSize.md,
  lg: vars.typography.fontSize.xl,
};

export const codeBadgeDefaults: Required<Pick<CodeBadgeProps, 'code' | 'size' | 'background' | 'color'>> = {
  code: '',
  size: 'md',
  background: vars.colors.highlight,
  color: vars.colors.onHighlight,
};
