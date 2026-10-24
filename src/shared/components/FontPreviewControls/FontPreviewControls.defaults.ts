import { fontPreviewSize } from '@/shared/constants';
import type { FontPreviewControlsProps, FontPreviewSettings } from './FontPreviewControls.types';

export const fontPreviewDefaults: FontPreviewSettings = {
  text: '',
  size: fontPreviewSize.initial,
  align: 'start',
};

export const fontPreviewControlsDefaults: Required<Pick<FontPreviewControlsProps, 'value'>> = {
  value: fontPreviewDefaults,
};
