import { vars } from '@/shared/theme';
import type { PanelProps } from './Panel.types';

export const panelDefaults: Required<Pick<PanelProps, 'as' | 'padding' | 'background' | 'borderColor'>> = {
  as: 'section',
  padding: vars.sizes.card.padding,
  background: vars.colors.surface,
  borderColor: vars.colors.border,
};
