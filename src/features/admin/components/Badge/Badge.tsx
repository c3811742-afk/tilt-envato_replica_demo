import type { CSSProperties } from 'react';
import { withDefaults } from '@/shared/utils';
import { badgeDefaults, badgeTones } from './Badge.defaults';
import type { BadgeProps } from './Badge.types';
import styles from './Badge.module.css';

// A small label for a status, role or flag.
export const Badge = (props: BadgeProps) => {
  const { children, tone, background, color, radius } = withDefaults(badgeDefaults, props);

  const style = {
    '--badge-background': background ?? badgeTones[tone].background,
    '--badge-color': color ?? badgeTones[tone].color,
    '--badge-radius': radius,
  } as CSSProperties;

  return (
    <span className={styles.badge} style={style}>
      {children}
    </span>
  );
};
