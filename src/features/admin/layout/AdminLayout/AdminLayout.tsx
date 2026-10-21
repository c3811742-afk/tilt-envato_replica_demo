import { NavLink, Outlet, useLocation } from 'react-router';
import { fetchAdmins } from '@/features/admin/api';
import { SelectField } from '@/features/admin/components';
import { adminNav } from '@/features/admin/constants';
import { useAdminSession } from '@/features/admin/hooks';
import { fillText, isolate } from '@/features/admin/utils';
import { AsyncContent, Button, Container, ErrorBoundary, Text } from '@/shared/components';
import { useAsync, useLocale } from '@/shared/hooks';
import { cx } from '@/shared/utils';
import { AdminSessionProvider } from './AdminSessionProvider';
import styles from './AdminLayout.module.css';

const AdminShell = () => {
  const { text, switchLocale } = useLocale();
  const { admins, currentAdmin, switchAdmin, can } = useAdminSession();
  const { pathname } = useLocation();
  const links = adminNav.filter((item) => can(item.permission));

  const adminOptions = admins.map((admin) => ({
    value: admin.id,
    label: fillText(text.admin.layout.adminOption, { name: isolate(admin.name), role: text.admin.roles[admin.role] }),
  }));

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <Text as="span" variant="h3">
          {text.admin.layout.title}
        </Text>
        <nav aria-label={text.admin.layout.navLabel}>
          <ul className={styles.navList}>
            {links.map((item) => (
              <li key={item.key}>
                <NavLink to={item.to} className={({ isActive }) => cx(styles.navLink, isActive && styles.active)}>
                  {text.admin.nav[item.key]}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
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
