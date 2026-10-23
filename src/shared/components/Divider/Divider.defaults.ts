import { vars } from '@/shared/theme';
import type { DividerProps } from './Divider.types';

export const dividerDefaults: Required<Pick<DividerProps, 'color'>> = {
  color: vars.colors.borderMuted,
};
