import { withDefaults } from '@/shared/utils';
import { ItemCard } from '../ItemCard';
import { ScrollRow } from '../ScrollRow';
import { itemRowDefaults } from './ItemRow.defaults';
import type { ItemRowProps } from './ItemRow.types';

// Item cards in a row that scrolls sideways (home page rows, similar items).
export const ItemRow = (props: ItemRowProps) => {
  const { items, label, itemWidth } = withDefaults(itemRowDefaults, props);

  return (
    <ScrollRow label={label} itemWidth={itemWidth}>
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </ScrollRow>
  );
};
