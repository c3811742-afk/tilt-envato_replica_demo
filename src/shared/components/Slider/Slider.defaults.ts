import { vars } from '@/shared/theme';
import type { SliderProps } from './Slider.types';

export const sliderDefaults: Required<Pick<SliderProps, 'showLabel' | 'value' | 'min' | 'max' | 'step' | 'width' | 'color' | 'disabled'>> = {
  showLabel: false,
  value: 0,
  min: 0,
  max: 1,
  step: 'any',
  width: '100%',
  color: vars.colors.primary,
  disabled: false,
};
