import type { TrackRowProps } from './TrackRow.types';

export const trackRowDefaults: Required<Pick<TrackRowProps, 'showVersions' | 'linkToItem'>> = {
  showVersions: true,
  linkToItem: true,
};
