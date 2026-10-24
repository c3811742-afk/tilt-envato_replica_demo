import type { CSSProperties } from 'react';
import { cx, withDefaults } from '@/shared/utils';
import { vars } from '@/shared/theme';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { sidebarLayoutDefaults } from './SidebarLayout.defaults';
import type { SidebarLayoutProps } from './SidebarLayout.types';
import styles from './SidebarLayout.module.css';

// A page with a panel docked to the screen's start edge (e.g. search filters). On desktop the panel's background
// runs from under the header down to the footer; its content stays in view and scrolls on its own. The page
// (usually a <Page>) fills the rest. With `onCollapsedChange` the user can fold the panel to a slim strip.
// Smaller screens show the page alone, so give them another way to reach the panel's content (e.g. a dialog).
export const SidebarLayout = (props: SidebarLayoutProps) => {
  const { sidebar, children, label, width, collapsed, onCollapsedChange, collapseLabel, expandLabel, collapsedWidth } =
    withDefaults(sidebarLayoutDefaults, props);
  const foldable = onCollapsedChange !== undefined;
  const folded = foldable && collapsed;
  const style = { '--sidebar-layout-width': folded ? collapsedWidth : width } as CSSProperties;

  return (
    <div className={styles.layout} style={style}>
      <div className={styles.rail}>
        <aside className={cx(styles.sidebar, folded && styles.folded)} aria-label={label}>
          {foldable && (
            <div className={styles.toggle}>
              <Button
                variant="outline"
                size="sm"
                iconOnly
                ariaLabel={folded ? expandLabel : collapseLabel}
                onClick={() => onCollapsedChange(!folded)}
              >
                {/* Points the way the panel will move: toward the screen edge to fold, away from it to open. */}
                <Icon name={folded ? 'chevronEnd' : 'chevronStart'} size={vars.sizes.icon.md} />
              </Button>
            </div>
          )}
          {/* Hidden, not removed, so what the user picked inside (open sections, typed dates) is kept. */}
          <div hidden={folded}>{sidebar}</div>
        </aside>
      </div>
      <div className={styles.main}>{children}</div>
    </div>
  );
};
