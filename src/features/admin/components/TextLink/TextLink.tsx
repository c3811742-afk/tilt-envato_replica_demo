import type { CSSProperties } from 'react';
import { Link } from 'react-router';
import { withDefaults } from '@/shared/utils';
import { textLinkDefaults } from './TextLink.defaults';
import type { TextLinkProps } from './TextLink.types';
import styles from './TextLink.module.css';

// An in-app link styled as text, built on React Router's <Link>.
export const TextLink = (props: TextLinkProps) => {
  const { to, children, color, autoDirection } = withDefaults(textLinkDefaults, props);
  const style = { '--text-link-color': color } as CSSProperties;

  return (
    <Link to={to} className={styles.textLink} style={style} dir={autoDirection ? 'auto' : undefined}>
      {children}
    </Link>
  );
};
