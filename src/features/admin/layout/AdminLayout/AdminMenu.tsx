import { NavLink } from 'react-router';
import { adminNavGroups, navAlertKeys } from '@/features/admin/constants';
import { useAdminSession } from '@/features/admin/hooks';
import type { AdminAlerts } from '@/features/admin/types';
import { Badge, Icon, Text } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { cx, formatNumber } from '@/shared/utils';
import styles from './AdminMenu.module.css';

interface AdminMenuProps {
  alerts: AdminAlerts | null;
}

// The admin's menu: the pages this admin's role can use, in groups, with a count where something is waiting.
export const AdminMenu = ({ alerts }: AdminMenuProps) => {
  const { text, locale } = useLocale();
  const { can } = useAdminSession();
  const groups = adminNavGroups
    .map((group) => ({ key: group.key, items: group.items.filter((item) => can(item.permission)) }))
    .filter((group) => group.items.length > 0);

  const countFor = (key: string) =>
    alerts ? (navAlertKeys[key] ?? []).reduce((sum, alertKey) => sum + alerts[alertKey], 0) : 0;

  // In the shared SidebarLayout (AdminLayout), which folds it behind "Menu" on phones and tablets.
  const nav = (
    <nav aria-label={text.admin.layout.navLabel} className={styles.nav}>
      {groups.map((group) => (
        <div key={group.key} className={styles.group}>
          <span className={styles.groupLabel}>
            <Text as="span" variant="label" color={vars.colors.navMuted}>
              {text.admin.navGroups[group.key]}
            </Text>
          </span>
          <ul className={styles.list}>
            {group.items.map((item) => {
              const count = countFor(item.key);
              return (
                <li key={item.key}>
                  <NavLink to={item.to} className={({ isActive }) => cx(styles.link, isActive && styles.active)}>
                    {({ isActive }) => (
                      <>
                        <Icon name={item.icon} size={vars.sizes.icon.sm} />
                        <span className={styles.label}>{text.admin.nav[item.key]}</span>
                        {/* A lime count in the menu; the other way round on the lime current page. */}
                        {count > 0 && (
                          <Badge
                            background={isActive ? vars.colors.onNavAccent : vars.colors.navAccent}
                            color={isActive ? vars.colors.navAccent : vars.colors.onNavAccent}
                          >
                            {formatNumber(count, locale)}
                          </Badge>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return nav;
};
