import type { CSSProperties } from 'react';
import { withDefaults } from '@/shared/utils';
import { badgeDefaults, badgeVariants } from './Badge.defaults';
import type { BadgeProps } from './Badge.types';
import styles from './Badge.module.css';

// A short label on a card or item: "Free", "Premium", "Most popular".
export const Badge = (props: BadgeProps) => {
  const { children, variant, background, color, radius } = withDefaults(badgeDefaults, props);

  const style = {
    '--badge-background': background ?? badgeVariants[variant].background,
    '--badge-color': color ?? badgeVariants[variant].color,
    '--badge-radius': radius,
  } as CSSProperties;

  return (
    <span className={styles.badge} style={style}>
      {children}
    </span>
  );
};
