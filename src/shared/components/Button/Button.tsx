import type { CSSProperties } from 'react';
import { cx, withDefaults } from '@/shared/utils';
import { buttonDefaults, buttonHeights, buttonVariants } from './Button.defaults';
import type { ButtonProps } from './Button.types';
import styles from './Button.module.css';

export const Button = (props: ButtonProps) => {
  const { children, variant, size, background, color, radius, fullWidth, disabled, type, onClick } = withDefaults(
    buttonDefaults,
    props,
  );

  // Resolved values are handed to the CSS module as custom properties.
  const style = {
    '--button-background': background ?? buttonVariants[variant].background,
    '--button-color': color ?? buttonVariants[variant].color,
    '--button-height': buttonHeights[size],
    '--button-radius': radius,
  } as CSSProperties;

  return (
    <button
      type={type}
      className={cx(styles.button, fullWidth && styles.fullWidth)}
      style={style}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
