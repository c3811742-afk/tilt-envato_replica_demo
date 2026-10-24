import type { CSSProperties } from 'react';
import { cx, withDefaults } from '@/shared/utils';
import { stackDefaults } from './Stack.defaults';
import type { StackProps } from './Stack.types';
import styles from './Stack.module.css';

const alignValues = { stretch: 'stretch', start: 'flex-start', center: 'center', end: 'flex-end' } as const;

// Puts its children in a column (or a wrapping row) with even space between them.
export const Stack = (props: StackProps) => {
  const { children, as: Element, direction, gap, align } = withDefaults(stackDefaults, props);

  const style = {
    '--stack-gap': gap,
    '--stack-align': alignValues[align],
  } as CSSProperties;

  return (
    <Element className={cx(styles.stack, direction === 'row' && styles.row)} style={style}>
      {children}
    </Element>
  );
};
