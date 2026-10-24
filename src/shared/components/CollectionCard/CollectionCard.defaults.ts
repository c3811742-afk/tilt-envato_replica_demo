import type { CollectionCardProps } from './CollectionCard.types';

export const collectionCardDefaults: Required<Pick<CollectionCardProps, 'headingLevel'>> = {
  headingLevel: 'h3',
};

// Covers shown in a collection card's mosaic.
export const mosaicSize = 4;
