import { vars } from '@/shared/theme';
import type { VideoStageProps } from './VideoStage.types';

export const videoStageDefaults: Required<Pick<VideoStageProps, 'accent' | 'icon' | 'seed' | 'progress' | 'aspectRatio'>> = {
  accent: 'royalBlue',
  icon: 'video',
  seed: '',
  progress: 0,
  aspectRatio: vars.sizes.aspectRatio.video,
};

// When a template's title is on screen (fractions of the preview): it fades in, holds, then fades out.
export const titleTiming = { in: 0.1, out: 0.85 } as const;
