import type { ItemCardProps } from './ItemCard.types';

export const itemCardDefaults: Required<Pick<ItemCardProps, 'headingLevel' | 'showCategory' | 'preview'>> = {
  headingLevel: 'h3',
  showCategory: true,
  preview: true,
};
