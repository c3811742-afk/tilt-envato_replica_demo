import { NavLink, useLocation } from 'react-router';
import { adminNavGroups, navAlertKeys } from '@/features/admin/constants';
import { useAdminSession } from '@/features/admin/hooks';
import type { AdminAlerts } from '@/features/admin/types';
import { Icon } from '@/shared/components';
import { useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { cx, formatNumber } from '@/shared/utils';
import styles from './AdminSidebar.module.css';

interface AdminSidebarProps {
  alerts: AdminAlerts | null;
}

// The blue sidebar: the pages this admin's role can use, in groups, with a count where something is waiting.
export const AdminSidebar = ({ alerts }: AdminSidebarProps) => {
  const { text, locale } = useLocale();
  const { can } = useAdminSession();
  const { pathname } = useLocation();
  const groups = adminNavGroups
    .map((group) => ({ key: group.key, items: group.items.filter((item) => can(item.permission)) }))
    .filter((group) => group.items.length > 0);

  const countFor = (key: string) =>
    alerts ? (navAlertKeys[key] ?? []).reduce((sum, alertKey) => sum + alerts[alertKey], 0) : 0;

  const nav = (
    <nav aria-label={text.admin.layout.navLabel} className={styles.nav}>
      {groups.map((group) => (
        <div key={group.key} className={styles.group}>
          <span className={styles.groupLabel}>{text.admin.navGroups[group.key]}</span>
          <ul className={styles.list}>
            {group.items.map((item) => {
              const count = countFor(item.key);
              return (
                <li key={item.key}>
                  <NavLink to={item.to} className={({ isActive }) => cx(styles.link, isActive && styles.active)}>
                    <Icon name={item.icon} size={vars.sizes.icon.sm} />
                    <span className={styles.label}>{text.admin.nav[item.key]}</span>
                    {count > 0 && <span className={styles.count}>{formatNumber(count, locale)}</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <aside className={styles.sidebar}>
      {/* Phones and tablets: the links fold away behind "Menu". key: it closes again after each page change. */}
      <details key={pathname} className={styles.menu}>
        <summary className={styles.menuToggle}>
          <Icon name="list" size={vars.sizes.icon.sm} />
          {text.admin.layout.menu}
        </summary>
        {nav}
      </details>
      <div className={styles.desktopNav}>{nav}</div>
    </aside>
  );
};
