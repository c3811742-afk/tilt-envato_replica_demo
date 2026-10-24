import type { CSSProperties } from 'react';
import { cx, withDefaults } from '@/shared/utils';
import { splitLayoutDefaults } from './SplitLayout.defaults';
import type { SplitLayoutProps } from './SplitLayout.types';
import styles from './SplitLayout.module.css';

// Two columns on desktop (main content and a side panel that stays in view and scrolls on its own if it's long),
// stacked on phones.
export const SplitLayout = (props: SplitLayoutProps) => {
  const { main, aside, columns, gap, stickyAside, scrollAside, asideAt } = withDefaults(splitLayoutDefaults, props);

  const style = {
    '--split-columns': columns,
    '--split-gap': gap,
  } as CSSProperties;

  const mainColumn = <div className={styles.column}>{main}</div>;
  const asideColumn = <div className={cx(styles.column, stickyAside && styles.sticky, stickyAside && scrollAside && styles.scrollable)}>{aside}</div>;

  return (
    <div className={styles.layout} style={style}>
      {asideAt === 'start' ? asideColumn : mainColumn}
      {asideAt === 'start' ? mainColumn : asideColumn}
    </div>
  );
};
