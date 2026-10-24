import type { CSSProperties } from 'react';
import { cx, withDefaults } from '@/shared/utils';
import { filterBarDefaults } from './FilterBar.defaults';
import type { FilterBarProps } from './FilterBar.types';
import styles from './FilterBar.module.css';

// A row of filters above a list. Filters share the width and wrap on small screens.
export const FilterBar = (props: FilterBarProps) => {
  const { children, label, gap, itemMinWidth, wideFirst } = withDefaults(filterBarDefaults, props);

  const style = {
    '--filter-bar-gap': gap,
    '--filter-bar-item-min-width': itemMinWidth,
  } as CSSProperties;

  return (
    <div className={cx(styles.filterBar, wideFirst && styles.wideFirst)} style={style} role="group" aria-label={label}>
      {children}
    </div>
  );
};
