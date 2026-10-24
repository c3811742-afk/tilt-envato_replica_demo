import type { CSSProperties } from 'react';
import { Link } from 'react-router';
import { cx, withDefaults } from '@/shared/utils';
import { buttonDefaults, buttonHeights, buttonVariants } from './Button.defaults';
import type { ButtonProps } from './Button.types';
import styles from './Button.module.css';

export const Button = (props: ButtonProps) => {
  const { children, variant, size, background, color, radius, fullWidth, disabled, type, to, href, ariaLabel, pressed, onClick } =
    withDefaults(buttonDefaults, props);

  // Resolved values are handed to the CSS module as custom properties.
  const style = {
    '--button-background': background ?? buttonVariants[variant].background,
    '--button-color': color ?? buttonVariants[variant].color,
    '--button-border': background ?? buttonVariants[variant].border,
    '--button-height': buttonHeights[size],
    '--button-radius': radius,
  } as CSSProperties;
  const className = cx(styles.button, fullWidth && styles.fullWidth);

  if (to && !disabled) {
    return (
      <Link to={to} className={className} style={style} aria-label={ariaLabel} onClick={onClick}>
        {children}
      </Link>
    );
  }

  if (href && !disabled) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className} style={style} aria-label={ariaLabel} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={className} style={style} disabled={disabled} aria-label={ariaLabel} aria-pressed={pressed} onClick={onClick}>
      {children}
    </button>
  );
};
