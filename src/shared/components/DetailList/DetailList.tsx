import type { CSSProperties } from 'react';
import { vars } from '@/shared/theme';
import { withDefaults } from '@/shared/utils';
import { Text } from '../Text';
import { detailListDefaults } from './DetailList.defaults';
import type { DetailListProps } from './DetailList.types';
import styles from './DetailList.module.css';

// Label / value rows (item details, license details), the label at the start and the value at the end.
export const DetailList = (props: DetailListProps) => {
  const { rows, dividerColor } = withDefaults(detailListDefaults, props);

  const style = { '--detail-list-divider': dividerColor } as CSSProperties;

  return (
    <dl className={styles.list} style={style}>
      {rows.map((row) => (
        <div key={row.label} className={styles.row}>
          <Text as="dt" variant="bodySm" color={vars.colors.textMuted}>
            {row.label}
          </Text>
          <Text as="dd" variant="title" align="end" autoDirection={row.autoDirection}>
            {row.value}
          </Text>
        </div>
      ))}
    </dl>
  );
};
