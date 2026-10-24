import type { CSSProperties } from 'react';
import { cx, withDefaults } from '@/shared/utils';
import { gridDefaults } from './Grid.defaults';
import type { GridProps } from './Grid.types';
import styles from './Grid.module.css';

// A responsive grid: one column on small phones, as many columns of at least `minColumnWidth` as fit.
export const Grid = (props: GridProps) => {
  const { children, as: Element, minColumnWidth, gap, stretch, equalRows, columns, ariaLabel } = withDefaults(gridDefaults, props);

  const style = {
    '--grid-columns': columns
      ? `repeat(${columns}, minmax(0, 1fr))`
      : `repeat(${stretch ? 'auto-fit' : 'auto-fill'}, minmax(${minColumnWidth}, 1fr))`,
    '--grid-gap': gap,
  } as CSSProperties;

  return (
    <Element className={cx(styles.grid, equalRows && styles.equalRows)} style={style} aria-label={ariaLabel}>
      {children}
    </Element>
  );
};
