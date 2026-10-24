import type { CSSProperties } from 'react';
import { withDefaults } from '@/shared/utils';
import { detailListDefaults } from './DetailList.defaults';
import type { DetailListProps } from './DetailList.types';
import styles from './DetailList.module.css';

// Label and value pairs (e.g. a license's customer, project and date): stacked on phones, side by side on wider screens.
export const DetailList = (props: DetailListProps) => {
  const { items, gap } = withDefaults(detailListDefaults, props);
  const style = { '--detail-list-gap': gap } as CSSProperties;

  return (
    <dl className={styles.list} style={style}>
      {items.map((item) => (
        <div key={item.label} className={styles.row}>
          <dt className={styles.label}>{item.label}</dt>
          <dd className={styles.value}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
};
