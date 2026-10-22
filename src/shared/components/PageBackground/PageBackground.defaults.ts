import { vars } from '@/shared/theme';
import type { PageBackgroundProps } from './PageBackground.types';

export const pageBackgroundDefaults: Required<PageBackgroundProps> = {
  color: vars.colors.primary,
  highlightColor: vars.accentPairs.lime.bg,
  opacity: vars.opacity.backgroundLine,
  highlightOpacity: vars.opacity.backgroundHighlight,
  lineCount: 46,
  highlightEvery: 9,
  strokeWidth: vars.borders.width.hairline,
};
