import { HashRouter, Route, Routes } from 'react-router';
import { routes } from '@/shared/constants';
import { HomePage } from '@/features/customer/pages/HomePage';
import { NotFoundPage } from '@/features/common/pages/NotFoundPage';
import {
  AdminHomePage,
  AdminLayout,
  AdminsPage,
  AuditLogPage,
  LiveElementsPage,
  ReviewElementPage,
  ReviewQueuePage,
} from '@/features/admin';
import { AppErrorBoundary } from './AppErrorBoundary';
import { LocaleProvider } from './providers/LocaleProvider';

// HashRouter (URLs like /#/item/123): GitHub Pages has no server-side routing,
// so normal paths would 404 when a page is refreshed or opened from a link.
export const App = () => (
  <LocaleProvider>
    <HashRouter>
      <AppErrorBoundary>
        <Routes>
          <Route path={routes.home} element={<HomePage />} />
          <Route path={routes.admin} element={<AdminLayout />}>
            <Route index element={<AdminHomePage />} />
            <Route path={routes.adminReview} element={<ReviewQueuePage />} />
            <Route path={routes.adminReviewElement} element={<ReviewElementPage />} />
            <Route path={routes.adminLiveElements} element={<LiveElementsPage />} />
            <Route path={routes.adminAdmins} element={<AdminsPage />} />
            <Route path={routes.adminAuditLog} element={<AuditLogPage />} />
          </Route>
          <Route path={routes.notFound} element={<NotFoundPage />} />
        </Routes>
      </AppErrorBoundary>
    </HashRouter>
  </LocaleProvider>
);
