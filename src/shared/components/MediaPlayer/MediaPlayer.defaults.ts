import type { MediaPlayerProps } from './MediaPlayer.types';

export const mediaPlayerDefaults: Required<Pick<MediaPlayerProps, 'kind' | 'peaks'>> = {
  kind: 'audio',
  peaks: [],
};
