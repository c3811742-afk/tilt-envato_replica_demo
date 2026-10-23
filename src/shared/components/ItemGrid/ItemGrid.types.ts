import type { ReactNode } from 'react';
import type { GridSize } from '@/shared/constants';
import type { Item } from '@/shared/types';

export interface ItemGridProps {
  items?: Item[];
  size?: GridSize; // the card size the user picked; sets the column width
  minColumnWidth?: string; // overrides the size's column width
  gap?: string;
  label?: string; // accessible name of the list
  actionsFor?: (item: Item) => ReactNode; // buttons on each card in place of the app's item actions
}
