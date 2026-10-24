import type { Item } from '@/shared/types';
import { FavoriteButton } from './FavoriteButton';
import { SaveToCollection } from './SaveToCollection';

interface ItemSaveActionsProps {
  item: Item;
  subtle?: boolean; // small borderless icons, for inside an item card
}

// The heart and folder buttons shown with every item: quiet ones on cards (given to the cards by the app layout),
// outlined ones in lists (tracks, fonts).
export const ItemSaveActions = ({ item, subtle = false }: ItemSaveActionsProps) => (
  <>
    <FavoriteButton itemId={item.id} size="sm" iconOnly subtle={subtle} />
    <SaveToCollection itemId={item.id} size="sm" iconOnly subtle={subtle} />
  </>
);
