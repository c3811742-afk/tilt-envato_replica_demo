import { vars } from '@/shared/theme';
import type { TextLinkProps } from './TextLink.types';

export const textLinkDefaults: Required<Pick<TextLinkProps, 'color' | 'autoDirection'>> = {
  color: vars.colors.primary,
  autoDirection: false,
};
