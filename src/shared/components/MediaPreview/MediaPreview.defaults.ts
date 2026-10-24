import { vars } from '@/shared/theme';
import type { MediaPreviewProps } from './MediaPreview.types';

export const mediaPreviewDefaults: Required<Pick<MediaPreviewProps, 'kind' | 'aspectRatio' | 'background' | 'fit' | 'border'>> = {
  kind: 'image',
  aspectRatio: vars.sizes.aspectRatio.video,
  background: vars.colors.surfaceMuted,
  fit: 'contain',
  border: true,
};
