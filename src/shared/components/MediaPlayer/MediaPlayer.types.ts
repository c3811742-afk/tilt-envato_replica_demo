import type { ReactNode } from 'react';
import type { PlaybackSource } from '@/shared/utils';

export interface MediaPlayerProps {
  source: PlaybackSource; // required: what the player plays
  title?: string; // the item's name, for the play button's accessible name
  kind?: 'audio' | 'video';
  peaks?: number[]; // audio: the waveform, which is also the position slider
  stage?: (time: number, duration: number) => ReactNode; // video: the picture at a point in time
}
