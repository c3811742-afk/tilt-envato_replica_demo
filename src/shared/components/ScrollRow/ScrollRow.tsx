import type { CSSProperties } from 'react';
import { withDefaults } from '@/shared/utils';
import { scrollRowDefaults } from './ScrollRow.defaults';
import type { ScrollRowProps } from './ScrollRow.types';
import styles from './ScrollRow.module.css';

// A horizontal row that scrolls sideways (swipe on phones). Children need a `key`.
export const ScrollRow = (props: ScrollRowProps) => {
  const { children, itemWidth, gap, label } = withDefaults(scrollRowDefaults, props);

  const style = {
    '--scroll-row-item-width': itemWidth,
    '--scroll-row-gap': gap,
  } as CSSProperties;

  return (
    <ul className={styles.row} style={style} aria-label={label}>
      {children.map((child, index) => (
        <li key={(child as { key?: string } | null)?.key ?? index} className={styles.item}>
          {child}
        </li>
      ))}
    </ul>
  );
};
