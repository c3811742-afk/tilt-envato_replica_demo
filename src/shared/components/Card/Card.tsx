import type { CSSProperties } from 'react';
import { Link } from 'react-router';
import { cx, withDefaults } from '@/shared/utils';
import { cardDefaults } from './Card.defaults';
import type { CardProps } from './Card.types';
import styles from './Card.module.css';

// A bordered, flat box for grouped content: a plan, a category, a step.
export const Card = (props: CardProps) => {
  const { children, as: Element, to, padding, gap, background, color, borderColor, radius, interactive } = withDefaults(
    cardDefaults,
    props,
  );

  const style = {
    '--card-padding': padding,
    '--card-gap': gap,
    '--card-background': background,
    '--card-color': color,
    '--card-border-color': borderColor,
    '--card-radius': radius,
  } as CSSProperties;
  const className = cx(styles.card, (interactive ?? Boolean(to)) && styles.interactive);

  if (to) {
    return (
      <Element className={styles.item}>
        <Link to={to} className={cx(className, styles.link)} style={style}>
          {children}
        </Link>
      </Element>
    );
  }

  return (
    <Element className={className} style={style}>
      {children}
    </Element>
  );
};
