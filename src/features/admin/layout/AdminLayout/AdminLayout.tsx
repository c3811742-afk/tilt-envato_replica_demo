import { NavLink, Outlet, useLocation } from 'react-router';
import { fetchAdmins } from '@/features/admin/api';
import { SelectField } from '@/features/admin/components';
import { adminNavGroups } from '@/features/admin/constants';
import { useAdminSession } from '@/features/admin/hooks';
import { fillText, isolate } from '@/features/admin/utils';
import { AsyncContent, Button, Container, ErrorBoundary, Text } from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { vars } from '@/shared/theme';
import { cx } from '@/shared/utils';
import { AdminSessionProvider } from './AdminSessionProvider';
import styles from './AdminLayout.module.css';

const AdminShell = () => {
  const { text, switchLocale } = useLocale();
  const { admins, currentAdmin, switchAdmin, can } = useAdminSession();
  const { pathname } = useLocation();
  const groups = adminNavGroups
    .map((group) => ({ key: group.key, items: group.items.filter((item) => can(item.permission)) }))
    .filter((group) => group.items.length > 0);

  const adminOptions = admins.map((admin) => ({
    value: admin.id,
    label: fillText(text.admin.layout.adminOption, { name: isolate(admin.name), role: text.admin.roles[admin.role] }),
  }));

  const nav = (
    <nav aria-label={text.admin.layout.navLabel} className={styles.nav}>
      {groups.map((group) => (
        <div key={group.key} className={styles.navGroup}>
          <Text as="span" variant="label" color={vars.colors.textMuted}>
            {text.admin.navGroups[group.key]}
          </Text>
          <ul className={styles.navList}>
            {group.items.map((item) => (
              <li key={item.key}>
                <NavLink to={item.to} className={({ isActive }) => cx(styles.navLink, isActive && styles.active)}>
                  {text.admin.nav[item.key]}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <Text as="span" variant="h3">
          {text.admin.layout.title}
        </Text>
        {/* Phones and tablets: the links fold away behind "Menu". key: it closes again after each page change. */}
        <details key={pathname} className={styles.menu}>
          <summary className={styles.menuToggle}>{text.admin.layout.menu}</summary>
          {nav}
        </details>
        <div className={styles.desktopNav}>{nav}</div>
        <div className={styles.session}>
          <SelectField
            label={text.admin.layout.signedInAs}
            hint={text.admin.layout.demoHint}
            value={currentAdmin.id}
            options={adminOptions}
            onChange={switchAdmin}
          />
          <Button variant="secondary" size="sm" onClick={switchLocale}>
            {text.common.switchLanguage}
          </Button>
        </div>
      </aside>
      <main className={styles.main}>
        <Container>
          {/* A crash inside one page keeps the sidebar working; it clears when the admin navigates. */}
          <ErrorBoundary resetKey={pathname}>
            <Outlet />
          </ErrorBoundary>
        </Container>
      </main>
    </div>
  );
};

// Sidebar + page area for every /admin page. Loads the admin list first, for the session.
export const AdminLayout = () => {
  const admins = useAsync(fetchAdmins, []);

  return (
    <AsyncContent state={admins}>
      {(list) => (
        <AdminSessionProvider initialAdmins={list}>
          <AdminShell />
        </AdminSessionProvider>
      )}
    </AsyncContent>
  );
};
