import { vars } from '@/shared/theme';
import type { TopBarProps } from './TopBar.types';

export const topBarDefaults: Required<Pick<TopBarProps, 'accentColor' | 'accentWidth' | 'contained'>> = {
  accentColor: vars.colors.border,
  accentWidth: vars.borders.width.thin,
  contained: true,
};
