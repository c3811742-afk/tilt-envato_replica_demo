import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { fetchAdminAlerts, fetchAdmins, onAdminChange } from '@/features/admin/api';
import { AsyncContent, Container, ErrorBoundary, PageBackground } from '@/shared/components';
import type { AdminAlerts } from '@/features/admin/types';
import { useAsync } from '@/shared/hooks';
import { safeAsync } from '@/shared/utils';
import { AdminSessionProvider } from './AdminSessionProvider';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopBar } from './AdminTopBar';
import styles from './AdminLayout.module.css';

const AdminShell = () => {
  const { pathname, search } = useLocation();
  const [changes, setChanges] = useState(0);
  const [counts, setCounts] = useState<AdminAlerts | null>(null);
  useEffect(() => onAdminChange(() => setChanges((count) => count + 1)), []);

  // Counted again after every admin action and page change, so the top bar and sidebar stay current.
  // The counts are a help: the last ones stay while new ones load, and none are shown if they fail.
  useEffect(() => {
    let active = true;
    safeAsync(fetchAdminAlerts).then((result) => {
      if (active) setCounts(result.ok ? result.data : null);
    });
    return () => {
      active = false;
    };
  }, [pathname, search, changes]);

  // A new page starts at the top, like a normal page load.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className={styles.layout}>
      <PageBackground />
      <AdminTopBar alerts={counts} />
      <div className={styles.body}>
        <AdminSidebar alerts={counts} />
        <main className={styles.main}>
          <Container>
            {/* A crash inside one page keeps the top bar and sidebar working; it clears when the admin navigates. */}
            <ErrorBoundary resetKey={pathname}>
              <Outlet />
            </ErrorBoundary>
          </Container>
        </main>
      </div>
    </div>
  );
};

// Top bar, sidebar and page area for every /admin page. Loads the admin list first, for the session.
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
