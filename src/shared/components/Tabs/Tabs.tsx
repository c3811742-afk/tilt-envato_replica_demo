import { useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { cx, withDefaults } from '@/shared/utils';
import { tabsDefaults } from './Tabs.defaults';
import type { Tab, TabsProps } from './Tabs.types';
import styles from './Tabs.module.css';

// Tabs that switch what is shown in one place (e.g. an item's preview, tutorial and files).
// Arrow keys move between tabs; only the open panel is rendered.
export const Tabs = <T extends string>(props: TabsProps<T>) => {
  const resolved = withDefaults(tabsDefaults, props);
  const { label, onChange, gap, children } = resolved;
  const tabs = resolved.tabs as Tab<T>[];
  const [ownValue, setOwnValue] = useState<T | undefined>(undefined);
  const value = resolved.value ?? ownValue ?? tabs[0]?.value;
  const baseId = useId();
  const listRef = useRef<HTMLDivElement>(null);

  const select = (next: T) => {
    setOwnValue(next);
    onChange?.(next);
  };

  // Arrow keys follow the reading direction, so they work the same way in Arabic.
  const onKeyDown = (event: KeyboardEvent) => {
    const index = tabs.findIndex((tab) => tab.value === value);
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
    const backward = rtl ? 'ArrowRight' : 'ArrowLeft';
    if (event.key !== forward && event.key !== backward) return;
    event.preventDefault();
    const next = tabs[(index + (event.key === forward ? 1 : -1) + tabs.length) % tabs.length];
    select(next.value);
    listRef.current?.querySelector<HTMLButtonElement>(`#${CSS.escape(`${baseId}-tab-${next.value}`)}`)?.focus();
  };

  const open = tabs.find((tab) => tab.value === value);

  return (
    <div className={styles.tabs} style={{ '--tabs-gap': gap } as CSSProperties}>
      <div ref={listRef} role="tablist" aria-label={label} className={styles.list} onKeyDown={onKeyDown}>
        {tabs.map((tab) => {
          const selected = tab.value === value;
          return (
            <button
              key={tab.value}
              id={`${baseId}-tab-${tab.value}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              tabIndex={selected ? 0 : -1}
              className={cx(styles.tab, selected && styles.selected)}
              onClick={() => select(tab.value)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {open && (
        <div id={`${baseId}-panel`} role="tabpanel" aria-labelledby={`${baseId}-tab-${open.value}`}>
          {open.content ?? children}
        </div>
      )}
    </div>
  );
};
