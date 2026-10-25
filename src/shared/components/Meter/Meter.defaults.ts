import { vars } from '@/shared/theme';
import type { MeterProps } from './Meter.types';

export const meterDefaults: Required<Pick<MeterProps, 'value' | 'max' | 'color' | 'trackColor' | 'height'>> = {
  value: 0,
  max: 1,
  color: vars.colors.primary,
  trackColor: vars.colors.surfaceMuted,
  height: vars.sizes.meter.height,
};
