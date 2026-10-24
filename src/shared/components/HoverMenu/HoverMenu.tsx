import { useEffect, useId, useRef, useState, type CSSProperties, type FocusEvent, type KeyboardEvent } from 'react';
import { useLocation } from 'react-router';
import { cx, withDefaults } from '@/shared/utils';
import { hoverMenuDefaults } from './HoverMenu.defaults';
import type { HoverMenuProps } from './HoverMenu.types';
import styles from './HoverMenu.module.css';

// A panel that opens while the pointer is over its trigger (e.g. the header's categories list).
// Keyboard users open it by tabbing into the trigger. It closes on Esc, when focus or the pointer
// leaves, and when the page changes. Touch screens have no hover, so the trigger link still works on its own.
export const HoverMenu = (props: HoverMenuProps) => {
  const { trigger, label, children, width, align, closeDelayMs } = withDefaults(hoverMenuDefaults, props);
  const { pathname, search } = useLocation();
  const page = `${pathname}${search}`;
  // The page the panel was opened on: it's only open on that page, so picking a link closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === page;
  const closeTimer = useRef<number | undefined>(undefined);
  const dismissed = useRef(false); // closed with Esc: stays closed until focus leaves the menu
  const panelId = useId();

  const cancelClose = () => window.clearTimeout(closeTimer.current);
  useEffect(() => cancelClose, []);

  const show = () => {
    cancelClose();
    if (!dismissed.current) setOpenOn(page);
  };
  const close = () => setOpenOn(null); // handed to the panel too; a timer still pending would only close it again
  const closeNow = () => {
    cancelClose();
    close();
  };
  const closeSoon = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(close, closeDelayMs);
  };

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    dismissed.current = false;
    closeNow();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape' || !open) return;
    dismissed.current = true;
    closeNow();
  };

  const style = { '--hover-menu-width': width } as CSSProperties;

  return (
    <div
      className={styles.hoverMenu}
      style={style}
      onMouseEnter={() => {
        dismissed.current = false;
        show();
      }}
      onMouseLeave={closeSoon}
      onFocus={show}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    >
      {trigger}
      {open && (
        <div id={panelId} role="region" aria-label={label} className={cx(styles.panel, align === 'end' && styles.alignEnd)}>
          {typeof children === 'function' ? children(close) : children}
        </div>
      )}
    </div>
  );
};
