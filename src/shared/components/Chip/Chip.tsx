import type { CSSProperties } from 'react';
import { Link } from 'react-router';
import { vars } from '@/shared/theme';
import { withDefaults } from '@/shared/utils';
import { Icon } from '../Icon';
import { chipDefaults, chipSelected } from './Chip.defaults';
import type { ChipProps } from './Chip.types';
import styles from './Chip.module.css';

// A compact, rounded choice: a category shortcut, a popular search, a filter.
export const Chip = (props: ChipProps) => {
  const { children, to, onClick, selected, icon, background, color, radius } = withDefaults(chipDefaults, props);

  const style = {
    '--chip-background': selected ? chipSelected.background : background,
    '--chip-color': selected ? chipSelected.color : color,
    '--chip-radius': radius,
  } as CSSProperties;

  const content = (
    <>
      {icon && <Icon name={icon} size={vars.sizes.icon.sm} />}
      {children}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={styles.chip} style={style} aria-current={selected ? 'true' : undefined}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={styles.chip} style={style} aria-pressed={selected} onClick={onClick}>
      {content}
    </button>
  );
};
