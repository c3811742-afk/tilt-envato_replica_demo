import { useId, useState, type CSSProperties } from 'react';
import { useLocation } from 'react-router';
import { vars } from '@/shared/theme';
import { cx, withDefaults } from '@/shared/utils';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { sidebarLayoutDefaults } from './SidebarLayout.defaults';
import type { SidebarLayoutProps } from './SidebarLayout.types';
import styles from './SidebarLayout.module.css';

// A page with a panel docked to the screen's start edge: the search filters, the admin's menu.
// Desktop: the panel's background runs the full height of the page; its content stays in view under the top bar
// and scrolls on its own. With `onCollapsedChange` a tab on the panel's edge folds it away and opens it again.
// Phones and tablets: a button above the page opens the panel in place; it closes again on the next page.
export const SidebarLayout = (props: SidebarLayoutProps) => {
  const {
    sidebar,
    children,
    label,
    width,
    phoneToggleLabel,
    phoneToggleIcon,
    phoneToggleTour,
    background,
    color,
    stickyTop,
    reachFooter,
    collapsed,
    onCollapsedChange,
    collapseLabel,
    expandLabel,
    collapsedWidth,
  } = withDefaults(sidebarLayoutDefaults, props);
  const { pathname } = useLocation();
  const panelId = useId();
  // The page the panel was opened on (phones): it's only open there, so going to another page closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const foldable = onCollapsedChange !== undefined;
  const folded = foldable && collapsed;
  const style = {
    '--sidebar-layout-width': folded ? collapsedWidth : width,
    '--sidebar-layout-background': background,
    '--sidebar-layout-color': color,
    '--sidebar-layout-top': stickyTop,
  } as CSSProperties;

  return (
    <div className={cx(styles.layout, reachFooter && styles.reachFooter)} style={style}>
      {phoneToggleLabel && (
        <div className={styles.phoneToggle} data-tour={phoneToggleTour}>
          <Button variant="outline" fullWidth expanded={open} onClick={() => setOpenOn(open ? null : pathname)}>
            <Icon name={phoneToggleIcon} size={vars.sizes.icon.sm} />
            {phoneToggleLabel}
            <Icon name="chevronDown" size={vars.sizes.icon.sm} />
          </Button>
        </div>
      )}
      <div className={cx(styles.rail, open && styles.open)}>
        {foldable && (
          // The panel's tab: part of its edge, it stays in view while the page scrolls.
          <div className={styles.handle}>
            <button
              type="button"
              className={styles.tab}
              aria-label={folded ? expandLabel : collapseLabel}
              aria-expanded={!folded}
              aria-controls={panelId}
              onClick={() => onCollapsedChange(!folded)}
            >
              {/* Points the way the panel will move: toward the screen edge to fold, away from it to open. */}
              <Icon name={folded ? 'chevronEnd' : 'chevronStart'} size={vars.sizes.icon.sm} />
            </button>
          </div>
        )}
        <aside id={panelId} className={cx(styles.sidebar, folded && styles.folded)} aria-label={label}>
          {/* Hidden, not removed, so what the user picked inside (open sections, typed dates) is kept. */}
          <div hidden={folded}>{sidebar}</div>
        </aside>
      </div>
      <div className={styles.main}>{children}</div>
    </div>
  );
};
