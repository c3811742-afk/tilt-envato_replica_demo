import { useId, useRef, type CSSProperties, type KeyboardEvent } from 'react';
import { useLocale } from '@/shared/hooks';
import { locales } from '@/shared/theme';
import { cx, withDefaults } from '@/shared/utils';
import { tabsDefaults } from './Tabs.defaults';
import type { TabsProps } from './Tabs.types';
import styles from './Tabs.module.css';

// Tabs with their content. Arrow keys move between tabs (mirrored in Arabic), Home and End jump to the ends.
export const Tabs = <T extends string>(props: TabsProps<T>) => {
  const { label, tabs, value, onChange, children, gap } = withDefaults(tabsDefaults, props);
  const { locale } = useLocale();
  const id = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabId = (tab: T) => `${id}-tab-${tab}`;
  const panelId = `${id}-panel`;

  const select = (index: number) => {
    const wrapped = (index + tabs.length) % tabs.length;
    tabRefs.current[wrapped]?.focus();
    onChange?.(tabs[wrapped].value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const forward = locales[locale].dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    const back = forward === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft';
    const targets: Record<string, number> = { [forward]: index + 1, [back]: index - 1, Home: 0, End: tabs.length - 1 };
    if (!(event.key in targets)) return;
    event.preventDefault();
    select(targets[event.key]);
  };

  const style = { '--tabs-gap': gap } as CSSProperties;

  return (
    <div className={styles.tabs} style={style}>
      <div role="tablist" aria-label={label} className={styles.list}>
        {tabs.map((tab, index) => {
          const selected = tab.value === value;
          return (
            <button
              key={tab.value}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={tabId(tab.value)}
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              className={cx(styles.tab, selected && styles.selected)}
              onClick={() => onChange?.(tab.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={panelId} aria-labelledby={tabId(value)} className={styles.panel}>
        {children}
      </div>
    </div>
  );
};
