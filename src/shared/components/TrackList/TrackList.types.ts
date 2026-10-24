import type { ReactNode } from 'react';
import type { Item } from '@/shared/types';

export interface TrackListProps {
  items?: Item[];
  label?: string; // accessible name of the list
  actionsFor?: (item: Item) => ReactNode; // buttons shown on each track (e.g. Download, Save)
  showVolume?: boolean; // one volume control for every track in the list
}
