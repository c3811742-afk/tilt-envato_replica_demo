import type { ReactNode } from 'react';
import type { Item } from '@/shared/types';

export interface ItemCardProps {
  item: Item; // required: a card always shows one item
  headingLevel?: 'h2' | 'h3' | 'h4'; // the title's heading level, to fit the page outline
  showCategory?: boolean; // the small line shows the category instead of the creator
  preview?: boolean; // hover to preview videos, a play button for music and sound effects
  actions?: ReactNode; // buttons on the cover's bottom end corner; defaults to the app's item actions (favorite, save)
}
