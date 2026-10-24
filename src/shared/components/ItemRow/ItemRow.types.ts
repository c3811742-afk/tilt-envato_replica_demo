import type { Item } from '@/shared/types';

export interface ItemRowProps {
  items?: Item[];
  label?: string; // accessible name of the row
  itemWidth?: string;
}
