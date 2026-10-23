import type { ReactNode } from 'react';
import type { TrackVersionKind } from '@/shared/constants';
import type { Item } from '@/shared/types';

export interface TrackRowProps {
  item: Item; // required: a row always plays one item
  version?: TrackVersionKind; // an alternate version of the track (shown nested under the main one)
  actions?: ReactNode; // e.g. Download and Save buttons
  showVersions?: boolean; // offer to expand the track's alternate versions
  linkToItem?: boolean; // the title opens the item page
}
