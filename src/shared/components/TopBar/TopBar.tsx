import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router';
import { routes } from '@/shared/constants';
import { useLocale } from '@/shared/hooks';
import { withDefaults } from '@/shared/utils';
import { Container } from '../Container';
import { topBarDefaults } from './TopBar.defaults';
import type { TopBarProps } from './TopBar.types';
import styles from './TopBar.module.css';

// The bar at the top of every page, on the site and in the admin area: the TILT logo, a search in the middle,
// actions at the end, and an optional row of links under it. It stays in view while the page scrolls.
export const TopBar = (props: TopBarProps) => {
  const { homeTo, homeLabel, tag, search, actions, below, accentColor, accentWidth, contained } = withDefaults(topBarDefaults, props);
  const { text } = useLocale();
  const style = { '--top-bar-accent': accentColor, '--top-bar-accent-width': accentWidth } as CSSProperties;
  const width = (content: ReactNode) => (contained ? <Container>{content}</Container> : <div className={styles.fullWidth}>{content}</div>);

  return (
    <header className={styles.topBar} style={style}>
      {width(
        <div className={styles.content}>
          <Link to={homeTo ?? routes.home} className={styles.brand} aria-label={homeLabel ?? text.brand.homeLabel}>
            <span className={styles.logo}>{text.brand.name}</span>
            {tag}
          </Link>
          {search && <div className={styles.search}>{search}</div>}
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>,
      )}
      {below && <div className={styles.below}>{width(below)}</div>}
    </header>
  );
};
