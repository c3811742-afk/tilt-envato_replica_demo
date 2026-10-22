import type { CollectionWithItems } from '@/shared/types';

export interface CollectionCardProps {
  collection: CollectionWithItems; // required: a card always shows one collection
  headingLevel?: 'h2' | 'h3';
}
