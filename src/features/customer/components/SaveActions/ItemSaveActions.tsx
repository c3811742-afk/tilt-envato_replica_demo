import type { Item } from '@/shared/types';
import { FavoriteButton } from './FavoriteButton';
import { SaveToCollection } from './SaveToCollection';

// The heart and folder buttons every item card shows (given to the cards by the app layout).
export const ItemSaveActions = ({ item }: { item: Item }) => (
  <>
    <FavoriteButton itemId={item.id} size="sm" iconOnly />
    <SaveToCollection itemId={item.id} size="sm" iconOnly />
  </>
);
