import { vars } from '@/shared/theme';
import { withDefaults } from '@/shared/utils';
import { Grid } from '../Grid';
import { ItemCard } from '../ItemCard';
import { itemGridDefaults } from './ItemGrid.defaults';
import type { ItemGridProps } from './ItemGrid.types';

// Item cards in a responsive grid (search results).
export const ItemGrid = (props: ItemGridProps) => {
  const { items, size, minColumnWidth, gap, label } = withDefaults(itemGridDefaults, props);

  return (
    <Grid minColumnWidth={minColumnWidth ?? vars.sizes.itemCard.minWidth[size]} gap={gap} ariaLabel={label}>
      {items.map((item) => (
        <li key={item.id}>
          <ItemCard item={item} />
        </li>
      ))}
    </Grid>
  );
};
