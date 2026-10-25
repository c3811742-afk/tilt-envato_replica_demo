import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { useLocation } from 'react-router';
import { cx, withDefaults } from '@/shared/utils';
import { dropdownDefaults } from './Dropdown.defaults';
import type { DropdownProps } from './Dropdown.types';
import styles from './Dropdown.module.css';

// A button that opens a small panel under it (e.g. the account menu).
// The panel closes on Esc, on a click outside, and when the page changes.
export const Dropdown = (props: DropdownProps) => {
  const { trigger, label, children, width, triggerHeight, square } = withDefaults(dropdownDefaults, props);
  const { pathname } = useLocation();
  // The page the panel was opened on: it's only open on that page, so it closes when the page changes.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (next: boolean) => setOpenOn(next ? pathname : null);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  // The panel opens toward the start side of the button. If that would take it off the screen (a button near
  // the screen's start edge, a wide panel), it opens toward the end side instead.
  const keepOnScreen = (panel: HTMLDivElement | null) => {
    if (!panel) return;
    const { left, right } = panel.getBoundingClientRect();
    if (left < 0 || right > document.documentElement.clientWidth) panel.classList.add(styles.flipped);
  };

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpenOn(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenOn(null);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const close = () => setOpen(false);
  const style = { '--dropdown-width': width, '--dropdown-trigger-height': triggerHeight } as CSSProperties;

  return (
    <div ref={rootRef} className={styles.dropdown} style={style}>
      <button
        type="button"
        className={cx(styles.trigger, square && styles.square)}
        aria-label={label}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
      >
        {trigger}
      </button>
      {open && (
        <div ref={keepOnScreen} id={panelId} className={styles.panel}>
          {typeof children === 'function' ? children(close) : children}
        </div>
      )}
    </div>
  );
};
