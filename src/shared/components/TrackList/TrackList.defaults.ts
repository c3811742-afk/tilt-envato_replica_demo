import type { TrackListProps } from './TrackList.types';

export const trackListDefaults: Required<Pick<TrackListProps, 'items' | 'showVolume'>> = {
  items: [],
  showVolume: true,
};
