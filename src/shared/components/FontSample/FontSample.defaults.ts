import { vars } from '@/shared/theme';
import type { FontSampleProps } from './FontSample.types';

export const fontSampleDefaults: Required<Pick<FontSampleProps, 'text' | 'size' | 'align' | 'color' | 'maxLines'>> = {
  text: '',
  size: vars.typography.fontSize.xxl,
  align: 'start',
  color: vars.colors.text,
  maxLines: 2,
};
