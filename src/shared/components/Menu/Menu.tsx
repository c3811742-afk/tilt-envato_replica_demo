import { vars } from '@/shared/theme';
import { cx, withDefaults } from '@/shared/utils';
import { Dropdown } from '../Dropdown';
import { Icon } from '../Icon';
import { menuDefaults } from './Menu.defaults';
import type { MenuItem, MenuProps } from './Menu.types';
import styles from './Menu.module.css';

// The "⋯" button: a short list of less frequent actions, each with its icon and full name, optionally in
// labelled groups (one under the other, or side by side with `columns`). Picking one closes the list.
export const Menu = (props: MenuProps) => {
  const { label, icon, items, columns, width, columnsWidth } = withDefaults(menuDefaults, props);

  // Consecutive items with the same `section` make one group.
  const groups = items.reduce<{ section?: string; items: MenuItem[] }[]>((all, item) => {
    const last = all[all.length - 1];
    if (last && last.section === item.section) last.items.push(item);
    else all.push({ section: item.section, items: [item] });
    return all;
  }, []);

  return (
    <Dropdown label={label} width={columns ? columnsWidth : width} square trigger={<Icon name={icon} size={vars.sizes.icon.sm} />}>
      {(close) => (
        <div className={cx(styles.groups, columns && styles.columns)}>
          {groups.map((group) => (
            <div key={group.section ?? group.items[0].key}>
              {group.section && (
                <p className={styles.section} aria-hidden="true">
                  {group.section}
                </p>
              )}
              <ul className={styles.list}>
                {group.items.map((item) => (
                  <li key={item.key}>
                    <button
                      type="button"
                      className={cx(styles.item, item.danger && styles.danger)}
                      disabled={item.disabled}
                      aria-label={item.section ? `${item.section}: ${item.label}` : undefined}
                      onClick={() => {
                        close();
                        item.onSelect();
                      }}
                    >
                      {item.icon && <Icon name={item.icon} size={vars.sizes.icon.sm} />}
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Dropdown>
  );
};
