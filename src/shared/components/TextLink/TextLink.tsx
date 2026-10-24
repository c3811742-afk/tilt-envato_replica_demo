import type { CSSProperties } from 'react';
import { Link } from 'react-router';
import { cx, withDefaults } from '@/shared/utils';
import { textStyleVars } from '../Text/Text.defaults';
import { textLinkDefaults } from './TextLink.defaults';
import type { TextLinkProps } from './TextLink.types';
import styles from './TextLink.module.css';

// An inline text link: to another page of the app (`to`), to an external site (`href`), or an action (`onClick`).
export const TextLink = (props: TextLinkProps) => {
  const { children, to, href, onClick, variant, color, underline, newTab } = withDefaults(textLinkDefaults, props);
  const textStyle = textStyleVars[variant];

  const style = {
    '--link-font-family': textStyle.fontFamily,
    '--link-font-size': textStyle.fontSize,
    '--link-font-weight': textStyle.fontWeight,
    '--link-line-height': textStyle.lineHeight,
    '--link-letter-spacing': textStyle.letterSpacing,
    '--link-transform': textStyle.textTransform,
    '--link-color': color,
  } as CSSProperties;
  const className = cx(styles.link, underline && styles.underline);

  if (onClick) {
    return (
      <button type="button" className={cx(className, styles.button)} style={style} onClick={onClick}>
        {children}
      </button>
    );
  }

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className} style={style}>
        {children}
      </a>
    );
  }

  return (
    <Link to={to} className={className} style={style} target={newTab ? '_blank' : undefined} rel={newTab ? 'noreferrer' : undefined}>
      {children}
    </Link>
  );
};
