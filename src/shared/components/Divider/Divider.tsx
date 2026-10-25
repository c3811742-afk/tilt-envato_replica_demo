import type { CSSProperties } from 'react';
import { vars } from '@/shared/theme';
import { withDefaults } from '@/shared/utils';
import { Text } from '../Text';
import { dividerDefaults } from './Divider.defaults';
import type { DividerProps } from './Divider.types';
import styles from './Divider.module.css';

// A horizontal line between two groups, with optional text in the middle.
export const Divider = (props: DividerProps) => {
  const { label, color } = withDefaults(dividerDefaults, props);
  const style = { '--divider-color': color } as CSSProperties;

  if (!label) return <hr className={styles.line} style={style} />;

  return (
    <div className={styles.labelled} style={style} role="separator">
      <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
        {label}
      </Text>
    </div>
  );
};
