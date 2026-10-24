import { vars } from '@/shared/theme';
import type { IconNoteProps } from './IconNote.types';

export const iconNoteDefaults: Required<Pick<IconNoteProps, 'icon' | 'background' | 'iconColor' | 'autoDirection'>> = {
  icon: 'info',
  background: vars.colors.surfaceMuted,
  iconColor: vars.colors.primary,
  autoDirection: false,
};
