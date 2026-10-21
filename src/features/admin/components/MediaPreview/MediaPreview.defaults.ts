import { vars } from '@/shared/theme';
import type { MediaPreviewProps } from './MediaPreview.types';

export const mediaPreviewDefaults: Required<Pick<MediaPreviewProps, 'kind' | 'aspectRatio' | 'background'>> = {
  kind: 'image',
  aspectRatio: vars.sizes.aspectRatio.video,
  background: vars.colors.surfaceMuted,
};
