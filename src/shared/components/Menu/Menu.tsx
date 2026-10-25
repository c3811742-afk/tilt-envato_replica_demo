import { Link } from 'react-router';
import { vars } from '@/shared/theme';
import { cx, withDefaults } from '@/shared/utils';
import { Badge } from '../Badge';
import { Dropdown } from '../Dropdown';
import { Icon } from '../Icon';
import { Text } from '../Text';
import { menuDefaults } from './Menu.defaults';
import type { MenuItem, MenuProps } from './Menu.types';
import styles from './Menu.module.css';

// A button that opens a short list: actions ("⋯" more actions) or links (the admin's alerts), each with its icon,
// full name and an optional count, optionally in labelled groups (one under the other, or side by side with
// `columns`). Picking one closes the list.
export const Menu = (props: MenuProps) => {
  const { label, icon, trigger, title, empty, items, columns, width, columnsWidth } = withDefaults(menuDefaults, props);

  // Consecutive items with the same `section` make one group.
  const groups = items.reduce<{ section?: string; items: MenuItem[] }[]>((all, item) => {
    const last = all[all.length - 1];
    if (last && last.section === item.section) last.items.push(item);
    else all.push({ section: item.section, items: [item] });
    return all;
  }, []);

  const content = (item: MenuItem) => (
    <>
      {item.icon && <Icon name={item.icon} size={vars.sizes.icon.sm} />}
      <span className={styles.label}>{item.label}</span>
      {item.count && <Badge variant="info">{item.count}</Badge>}
    </>
  );

  return (
    <Dropdown
      label={label}
      width={columns ? columnsWidth : width}
      square={!trigger}
      trigger={trigger ?? <Icon name={icon} size={vars.sizes.icon.sm} />}
    >
      {(close) => (
        <div className={cx(styles.groups, columns && styles.columns)}>
          {title && (
            <Text variant="label" color={vars.colors.textMuted}>
              {title}
            </Text>
          )}
          {items.length === 0 && empty && <Text variant="bodySm">{empty}</Text>}
          {groups.map((group) => (
            <div key={group.section ?? group.items[0].key}>
              {group.section && (
                <p className={styles.section} aria-hidden="true">
                  {group.section}
                </p>
              )}
              <ul className={styles.list}>
                {group.items.map((item) => {
                  const className = cx(styles.item, item.danger && styles.danger);
                  const name = item.section ? `${item.section}: ${item.label}` : undefined;
                  return (
                    <li key={item.key}>
                      {item.to && !item.disabled ? (
                        <Link to={item.to} className={className} aria-label={name} onClick={close}>
                          {content(item)}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          className={className}
                          disabled={item.disabled}
                          aria-label={name}
                          onClick={() => {
                            close();
                            item.onSelect?.();
                          }}
                        >
                          {content(item)}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Dropdown>
  );
};
