import type { CSSProperties } from 'react';
import { Link } from 'react-router';
import { Text } from '@/shared/components';
import { vars } from '@/shared/theme';
import { cx, withDefaults } from '@/shared/utils';
import { statCardDefaults } from './StatCard.defaults';
import type { StatCardProps } from './StatCard.types';
import styles from './StatCard.module.css';

// One key number with its name and a short line of context. Text only, so it never relies on color.
export const StatCard = (props: StatCardProps) => {
  const { label, value, detail, to, minHeight } = withDefaults(statCardDefaults, props);
  const style = { '--stat-card-min-height': minHeight } as CSSProperties;

  const content = (
    <>
      <Text as="span" variant="label" color={vars.colors.textMuted}>
        {label}
      </Text>
      <Text as="span" variant="h2">
        {value}
      </Text>
      {detail && (
        <Text as="span" variant="bodySm" color={vars.colors.textMuted}>
          {detail}
        </Text>
      )}
    </>
  );

  return to ? (
    <Link to={to} className={cx(styles.card, styles.link)} style={style}>
      {content}
    </Link>
  ) : (
    <div className={styles.card} style={style}>
      {content}
    </div>
  );
};
