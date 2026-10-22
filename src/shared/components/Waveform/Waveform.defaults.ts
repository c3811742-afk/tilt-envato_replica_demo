import { vars } from '@/shared/theme';
import type { WaveformProps } from './Waveform.types';

export const waveformDefaults: Required<Pick<WaveformProps, 'peaks' | 'progress' | 'height' | 'color' | 'playedColor' | 'keyStep'>> = {
  peaks: [],
  progress: 0,
  height: vars.sizes.track.waveform,
  color: vars.colors.text,
  playedColor: vars.colors.primary,
  keyStep: 0.05,
};
