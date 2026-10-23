import { routes } from '@/shared/constants';
import { vars } from '@/shared/theme';
import type { TextLinkProps } from './TextLink.types';

export const textLinkDefaults: Required<Pick<TextLinkProps, 'to' | 'variant' | 'color' | 'underline' | 'newTab'>> = {
  to: routes.home,
  variant: 'body',
  color: vars.colors.text,
  underline: true,
  newTab: false,
};
